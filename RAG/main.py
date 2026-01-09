import os
from dotenv import load_dotenv

load_dotenv()

import pathway as pw
from pathway.xpacks.llm.embedders import LiteLLMEmbedder
from pathway.xpacks.llm.llms import LiteLLMChat
from pathway.xpacks.llm.document_store import DocumentStore
from pathway.xpacks.llm.servers import QARestServer
from pathway.xpacks.llm.question_answering import BaseRAGQuestionAnswerer
from pathway.stdlib.indexing import BruteForceKnnFactory
import requests
from datetime import datetime
from typing import Any, List
import time
import re


class Config:
    """Application configuration"""
    NEWSAPI_KEY = os.environ.get("NEWSAPI_KEY", "")
    OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
    EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "nomic-embed-text")
    LLM_MODEL = os.environ.get("LLM_MODEL", "llama3.1")
    NEWS_CATEGORY = os.environ.get("NEWS_CATEGORY", "technology")
    NEWS_COUNTRY = os.environ.get("NEWS_COUNTRY", "us")
    NEWS_QUERY = os.environ.get("NEWS_QUERY", "")
    POLL_INTERVAL = int(os.environ.get("POLL_INTERVAL", "300"))
    HOST = os.environ.get("HOST", "0.0.0.0")
    PORT = int(os.environ.get("PORT", "8000"))
    CHUNK_SIZE = int(os.environ.get("CHUNK_SIZE", "1000"))
    CHUNK_OVERLAP = int(os.environ.get("CHUNK_OVERLAP", "200"))
    TOP_K = int(os.environ.get("TOP_K", "5"))


class SentimentAnalyzer:
    """Sentiment analysis UDF"""
    
    POSITIVE_WORDS = {
        'good', 'great', 'excellent', 'positive', 'success', 'win', 'gain',
        'profit', 'growth', 'increase', 'rise', 'surge', 'boost', 'benefit',
        'improve', 'advance', 'progress', 'achieve', 'breakthrough', 'innovation',
        'opportunity', 'optimistic', 'strong', 'robust', 'recover', 'bullish',
        'soar', 'climb', 'expand', 'victory', 'outstanding', 'remarkable'
    }
    
    NEGATIVE_WORDS = {
        'bad', 'poor', 'negative', 'fail', 'loss', 'decline', 'drop', 'fall',
        'decrease', 'plunge', 'crash', 'crisis', 'concern', 'worry', 'risk',
        'threat', 'danger', 'problem', 'issue', 'challenge', 'struggle', 'weak',
        'bearish', 'cut', 'slash', 'reduce', 'downgrade', 'collapse', 'plummet',
        'warning', 'fear', 'terrible', 'worst', 'disappointing', 'critical'
    }
    
    INTENSIFIERS = {'very', 'extremely', 'highly', 'absolutely', 'completely', 'incredibly'}
    NEGATIONS = {'not', 'no', 'never', 'neither', 'nobody', 'nothing', "n't", 'nor'}
    
    @staticmethod
    def analyze(text: str) -> tuple[str, float]:
        """Analyze sentiment of text"""
        if not text or not isinstance(text, str):
            return 'neutral', 0.5
        
        words = re.findall(r'\b\w+\b', text.lower())
        if not words:
            return 'neutral', 0.5
        
        positive_score = 0
        negative_score = 0
        
        for i, word in enumerate(words):
            negated = any(
                words[max(0, i-3):i].count(neg) > 0 
                for neg in SentimentAnalyzer.NEGATIONS
            )
            
            intensified = any(
                words[max(0, i-2):i].count(intens) > 0
                for intens in SentimentAnalyzer.INTENSIFIERS
            )
            
            multiplier = 1.5 if intensified else 1.0
            
            if word in SentimentAnalyzer.POSITIVE_WORDS:
                if negated:
                    negative_score += multiplier
                else:
                    positive_score += multiplier
                    
            elif word in SentimentAnalyzer.NEGATIVE_WORDS:
                if negated:
                    positive_score += multiplier
                else:
                    negative_score += multiplier
        
        total_score = positive_score + negative_score
        
        if total_score == 0:
            return 'neutral', 0.5
        
        sentiment_ratio = positive_score / total_score
        
        if sentiment_ratio > 0.6:
            sentiment = 'positive'
            confidence = min(sentiment_ratio, 0.95)
        elif sentiment_ratio < 0.4:
            sentiment = 'negative'
            confidence = min(1 - sentiment_ratio, 0.95)
        else:
            sentiment = 'neutral'
            confidence = 0.5 + abs(0.5 - sentiment_ratio)
        
        return sentiment, round(confidence, 3)


@pw.udf
def analyze_sentiment(text: str) -> str:
    """Pathway UDF for sentiment analysis"""
    label, score = SentimentAnalyzer.analyze(text)
    return f"{label}_{score:.2f}"


@pw.udf
def chunk_text(text: str, chunk_size: int, overlap: int) -> list[str]:
    """Split text into overlapping chunks"""
    if not text:
        return []
    
    chunks = []
    start = 0
    text_length = len(text)
    
    while start < text_length:
        end = start + chunk_size
        
        if end < text_length:
            for i in range(min(end, text_length) - 1, start + chunk_size // 2, -1):
                if text[i] in '.!?\n':
                    end = i + 1
                    break
        
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        
        start = end - overlap if end < text_length else text_length
    
    return chunks


@pw.udf
def get_current_timestamp(_: str) -> str:
    """Returns current timestamp"""
    return datetime.now().isoformat()


class NewsAPIConnector(pw.io.python.ConnectorSubject):
    """Custom Pathway connector that polls NewsAPI"""
    
    def __init__(
        self,
        api_key: str,
        category: str = "technology",
        country: str = "us",
        query: str = "",
        poll_interval: int = 300
    ):
        super().__init__()
        self.api_key = api_key
        self.category = category
        self.country = country
        self.query = query
        self.poll_interval = poll_interval
        self.seen_urls = set()
        self.base_url = "https://newsapi.org/v2/top-headlines"
        self.first_run = True
        
    def run(self):
        """Main polling loop"""
        print(f"[{datetime.now()}] Starting NewsAPI connector...")
        print(f"[{datetime.now()}] Category: {self.category}, Country: {self.country}")
        
        while True:
            try:
                articles = self._fetch_articles()
                
                if self.first_run:
                    print(f"[{datetime.now()}] Initial fetch: {len(articles)} articles from API")
                    self.first_run = False
                
                new_articles = self._filter_new_articles(articles)
                
                if new_articles:
                    print(f"[{datetime.now()}] Processing {len(new_articles)} new articles")
                    
                    for i, article in enumerate(new_articles, 1):
                        url = article.get("url") or f"article_{int(time.time())}_{i}"
                        title = article.get("title") or "Untitled"
                        description = article.get("description") or ""
                        content = article.get("content") or description or ""
                        author = article.get("author") or "Unknown"
                        published_at = article.get("publishedAt") or datetime.now().isoformat()
                        source_name = article.get("source", {}).get("name") or "Unknown"
                        
                        print(f"[{datetime.now()}] Emitting: {title[:50]}...")
                        
                        self.next(
                            url=url,
                            title=title,
                            description=description,
                            content=content,
                            author=author,
                            published_at=published_at,
                            source=source_name,
                        )
                else:
                    print(f"[{datetime.now()}] No new articles")
                
            except Exception as e:
                print(f"[{datetime.now()}] Error: {e}")
                import traceback
                traceback.print_exc()
            
            print(f"[{datetime.now()}] Sleeping {self.poll_interval}s...")
            time.sleep(self.poll_interval)
    
    def _fetch_articles(self) -> list[dict[str, Any]]:
        """Fetch articles from NewsAPI"""
        params = {
            "apiKey": self.api_key,
            "pageSize": 100,
        }
        
        if self.query:
            params["q"] = self.query
        else:
            params["category"] = self.category
            params["country"] = self.country
        
        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("status") != "ok":
                print(f"[{datetime.now()}] NewsAPI error: {data.get('message')}")
                return []
            
            return data.get("articles", [])
            
        except Exception as e:
            print(f"[{datetime.now()}] NewsAPI request failed: {e}")
            return []
    
    def _filter_new_articles(self, articles: list[dict]) -> list[dict]:
        """Filter out seen articles"""
        new_articles = []
        for article in articles:
            url = article.get("url", "")
            if url and url not in self.seen_urls:
                self.seen_urls.add(url)
                new_articles.append(article)
        return new_articles


class NewsArticleSchema(pw.Schema):
    """Schema for news articles"""
    url: str
    title: str
    description: str
    content: str
    author: str
    published_at: str
    source: str


def build_news_analyst_pipeline():
    """Build the RAG pipeline with FIXED metadata handling"""
    
    if not Config.NEWSAPI_KEY:
        raise ValueError("NEWSAPI_KEY must be set")
    
    print("=" * 70)
    print("LIVE NEWS ANALYST - Fixed Metadata Version")
    print("=" * 70)
    
    # Ingest news stream
    news_stream = pw.io.python.read(
        subject=NewsAPIConnector(
            api_key=Config.NEWSAPI_KEY,
            category=Config.NEWS_CATEGORY,
            country=Config.NEWS_COUNTRY,
            query=Config.NEWS_QUERY,
            poll_interval=Config.POLL_INTERVAL,
        ),
        schema=NewsArticleSchema,
        autocommit_duration_ms=1000,
    )
    
    # Process articles with sentiment
    processed_articles = news_stream.select(
        url=pw.this.url,
        title=pw.this.title,
        source=pw.this.source,
        author=pw.this.author,
        published_at=pw.this.published_at,
        full_text=pw.apply(
            lambda t, d, c: f"Title: {t}\n\nDescription: {d}\n\nContent: {c}",
            pw.this.title,
            pw.this.description,
            pw.this.content,
        ),
        sentiment=analyze_sentiment(
            pw.apply(
                lambda t, d: f"{t} {d}",
                pw.this.title,
                pw.this.description
            )
        ),
        indexed_at=get_current_timestamp(pw.this.url),
    )
    
    # Chunk documents
    chunked_articles = processed_articles.select(
        url=pw.this.url,
        title=pw.this.title,
        source=pw.this.source,
        author=pw.this.author,
        published_at=pw.this.published_at,
        sentiment=pw.this.sentiment,
        indexed_at=pw.this.indexed_at,
        chunks=chunk_text(pw.this.full_text, Config.CHUNK_SIZE, Config.CHUNK_OVERLAP),
    )
    
    # Flatten chunks
    chunks_flat = chunked_articles.flatten(pw.this.chunks).select(
        text=pw.this.chunks,
        url=pw.this.url,
        title=pw.this.title,
        source=pw.this.source,
        author=pw.this.author,
        published_at=pw.this.published_at,
        sentiment=pw.this.sentiment,
        indexed_at=pw.this.indexed_at,
    )
    
    # CRITICAL FIX: Create documents with proper metadata structure
    # The key is to have 'data' as bytes and '_metadata' as a dict
    documents_for_store = chunks_flat.select(
        data=pw.apply(
            lambda text: text.encode('utf-8'),
            pw.this.text,
        ),
        _metadata=pw.apply(
            lambda url, title, source, author, pub, sent, idx, text: {
                "path": url,  # Required by DocumentStore
                "title": title,
                "source": source,
                "author": author,
                "published_at": pub,
                "sentiment": sent,
                "indexed_at": idx,
                "text": text,  # Keep original text accessible
            },
            pw.this.url,
            pw.this.title,
            pw.this.source,
            pw.this.author,
            pw.this.published_at,
            pw.this.sentiment,
            pw.this.indexed_at,
            pw.this.text,
        ),
    )
    
    # Build embedder
    embedder = LiteLLMEmbedder(
        capacity=5,
        retry_strategy=pw.udfs.ExponentialBackoffRetryStrategy(
            max_retries=4,
            initial_delay=1000
        ),
        model=f"ollama/{Config.EMBEDDING_MODEL}",
        api_base=Config.OLLAMA_HOST,
    )
    
    embedding_dimension = 768 if Config.EMBEDDING_MODEL == "nomic-embed-text" else 1536
    
    retriever_factory = BruteForceKnnFactory(
        embedder=embedder,
        dimensions=embedding_dimension,
        reserved_space=1000,
    )
    
    # Create DocumentStore with no parser/splitter since we already chunked
    doc_store = DocumentStore(
        docs=documents_for_store,
        retriever_factory=retriever_factory,
        parser=None,  # We already have text chunks
        splitter=None,  # We already chunked
    )
    
    # Create LLM with better prompt
    llm = LiteLLMChat(
        model=f"ollama_chat/{Config.LLM_MODEL}",
        api_base=Config.OLLAMA_HOST,
        temperature=0.1,
        retry_strategy=pw.udfs.ExponentialBackoffRetryStrategy(
            max_retries=4,
            initial_delay=1000
        ),
    )
    
    # Create RAG app
    rag_app = BaseRAGQuestionAnswerer(
        llm=llm,
        indexer=doc_store,
        search_topk=Config.TOP_K,
    )
    
    # Start server
    server = QARestServer(
        host=Config.HOST,
        port=Config.PORT,
        rag_question_answerer=rag_app,
    )
    
    print("Pipeline built successfully!")
    print("=" * 70)
    print(f"Server: http://{Config.HOST}:{Config.PORT}")
    print(f"Embedder: {Config.EMBEDDING_MODEL}")
    print(f"LLM: {Config.LLM_MODEL}")
    print("=" * 70)
    
    return server


def main():
    """Run the pipeline"""
    try:
        server = build_news_analyst_pipeline()
        server.run(threaded=False, with_cache=False)
    except KeyboardInterrupt:
        print("\n\nPipeline stopped by user")
    except Exception as e:
        print(f"\nPipeline error: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    main()