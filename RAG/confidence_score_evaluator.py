"""
Hybrid Confidence Score Evaluator for Live News RAG
Uses both /v1/pw_ai_answer and /v1/retrieve endpoints to get complete data
"""

import json
import requests
import re
from datetime import datetime
from collections import Counter


class HybridConfidenceEvaluator:
    """
    Evaluates RAG response quality using hybrid approach:
    - Gets answer from /v1/pw_ai_answer
    - Gets sources from /v1/retrieve
    - Combines them for comprehensive evaluation
    """
    
    def __init__(self, base_url: str = "http://0.0.0.0:8000"):
        self.base_url = base_url
        self.answer_endpoint = f"{base_url}/v1/pw_ai_answer"
        self.retrieve_endpoint = f"{base_url}/v1/retrieve"
        self.list_docs_endpoint = f"{base_url}/v1/pw_list_documents"
    
    def evaluate_response(self, query: str, max_retries: int = 2, top_k: int = 5) -> dict:
        """Comprehensive evaluation with hybrid approach"""
        print("\n" + "="*80)
        print(" HYBRID CONFIDENCE EVALUATION")
        print("="*80)
        print(f"Query: {query}")
        print(f"Timestamp: {datetime.now().isoformat()}\n")
        
        # Pre-flight checks
        print("Step 0: Running pre-flight checks...")
        preflight_ok, preflight_msg = self._preflight_check()
        if not preflight_ok:
            return {
                "error": preflight_msg,
                "confidence": 0.0,
                "query": query,
                "timestamp": datetime.now().isoformat()
            }
        print(f" {preflight_msg}\n")
        
        # Step 1: Get sources via retrieve endpoint (faster)
        print(f"Step 1: Retrieving relevant sources (top {top_k})...")
        sources = self._get_sources(query, top_k)
        
        if not sources:
            print(" Failed to retrieve sources")
            return {
                "error": "Failed to retrieve sources",
                "confidence": 0.0,
                "query": query,
                "timestamp": datetime.now().isoformat()
            }
        
        print(f" Retrieved {len(sources)} sources\n")
        
        # Step 2: Get answer from RAG endpoint (slower)
        print("Step 2: Getting RAG answer (may take 60-120s)...")
        answer = self._get_answer(query, max_retries, timeout=180)
        
        if not answer:
            print(" Failed to get answer (timeout or error)")
            return {
                "error": "Failed to get RAG answer",
                "confidence": 0.0,
                "query": query,
                "sources_retrieved": len(sources),
                "timestamp": datetime.now().isoformat()
            }
        
        print(f" Got answer ({len(answer)} chars)\n")
        
        # Initialize scores
        scores = {
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "answer_length": len(answer),
            "sources_count": len(sources),
            "method": "hybrid (separate retrieve + answer calls)",
        }
        
        # Run all metrics
        print("Step 3: Evaluating source relevance...")
        scores["source_relevance"] = self._evaluate_source_relevance(query, sources)
        print(f"  Score: {scores['source_relevance']:.2%}\n")
        
        print("Step 4: Evaluating recency...")
        scores["recency"] = self._evaluate_recency(sources)
        print(f"  Score: {scores['recency']:.2%}\n")
        
        print("Step 5: Evaluating factual grounding...")
        scores["factual_grounding"] = self._evaluate_factual_grounding(answer, sources)
        print(f"  Score: {scores['factual_grounding']:.2%}\n")
        
        print("Step 6: Evaluating contextual enrichment...")
        scores["contextual_enrichment"] = self._evaluate_enrichment(answer, sources)
        print(f"  Score: {scores['contextual_enrichment']:.2%}\n")
        
        print("Step 7: Evaluating sentiment alignment...")
        scores["sentiment_alignment"] = self._evaluate_sentiment_alignment(answer, sources)
        print(f"  Score: {scores['sentiment_alignment']:.2%}\n")
        
        print("Step 8: Calculating overall confidence...")
        scores["overall_confidence"] = self._calculate_overall_confidence(scores)
        scores["interpretation"] = self._interpret_confidence(scores["overall_confidence"])
        scores["detailed_analysis"] = self._generate_detailed_analysis(scores, answer, sources)
        
        self._print_results(scores)
        self._save_evaluation(scores, answer, sources)
        
        return scores
    
    def _preflight_check(self) -> tuple[bool, str]:
        """Check if system is ready"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=5)
            
            docs_response = requests.post(
                self.list_docs_endpoint,
                json={},
                timeout=10
            )
            
            if docs_response.status_code == 200:
                docs = docs_response.json()
                if isinstance(docs, list):
                    doc_count = len(docs)
                    if doc_count == 0:
                        return False, "No documents indexed"
                    return True, f"System ready ({doc_count} documents)"
            
            return True, "Server responding"
            
        except Exception as e:
            return False, f"Server not responding: {e}"
    
    def _get_sources(self, query: str, k: int) -> list[dict]:
        """Get sources via retrieve endpoint"""
        try:
            response = requests.post(
                self.retrieve_endpoint,
                json={"query": query, "k": k},
                headers={"Content-Type": "application/json"},
                timeout=60  # Retrieval is usually fast
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Handle both dict and list responses
                if isinstance(data, dict):
                    return data.get("chunks", [])
                elif isinstance(data, list):
                    return data
                else:
                    return []
            else:
                print(f"  Retrieve endpoint error: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"  Error retrieving sources: {e}")
            return []
    
    def _get_answer(self, query: str, max_retries: int, timeout: int) -> str | None:
        """Get answer from RAG endpoint with retries"""
        for attempt in range(max_retries):
            try:
                print(f"  Attempt {attempt + 1}/{max_retries} (timeout: {timeout}s)...")
                
                response = requests.post(
                    self.answer_endpoint,
                    json={"prompt": query},
                    headers={"Content-Type": "application/json"},
                    timeout=timeout
                )
                
                if response.status_code == 200:
                    data = response.json()
                    answer = data.get("response") or data.get("answer", "")
                    return answer
                else:
                    print(f"  HTTP {response.status_code}")
                    
            except requests.exceptions.Timeout:
                print(f"  Timeout after {timeout}s")
                if attempt < max_retries - 1:
                    print(f"  Retrying with increased timeout...")
                    timeout += 60  # Add 60s each retry
            except Exception as e:
                print(f"  Error: {e}")
        
        return None
    
    def _evaluate_source_relevance(self, query: str, sources: list[dict]) -> float:
        """Evaluate source relevance to query"""
        if not sources:
            return 0.0
        
        query_keywords = set(re.findall(r'\b\w{4,}\b', query.lower()))
        if not query_keywords:
            return 0.5
        
        relevance_scores = []
        for source in sources:
            text = source.get("text", "") or ""
            metadata = source.get("metadata", {}) or {}
            title = metadata.get("title", "") or ""
            
            combined = (title + " " + text).lower()
            source_words = set(re.findall(r'\b\w{4,}\b', combined))
            
            if source_words:
                overlap = len(query_keywords & source_words) / len(query_keywords)
                relevance_scores.append(min(overlap * 2, 1.0))
            else:
                relevance_scores.append(0.0)
        
        return sum(relevance_scores) / len(relevance_scores) if relevance_scores else 0.0
    
    def _evaluate_recency(self, sources: list[dict]) -> float:
        """Evaluate source recency"""
        if not sources:
            return 0.0
        
        now = datetime.now()
        recency_scores = []
        
        for source in sources:
            metadata = source.get("metadata", {}) or {}
            pub_date_str = metadata.get("published_at", "") or ""
            
            if not pub_date_str:
                recency_scores.append(0.3)
                continue
            
            try:
                # Try multiple date formats
                pub_date = None
                for fmt in [
                    "%Y-%m-%dT%H:%M:%SZ",
                    "%Y-%m-%dT%H:%M:%S.%fZ",
                    "%Y-%m-%d %H:%M:%S",
                ]:
                    try:
                        pub_date = datetime.strptime(pub_date_str, fmt)
                        break
                    except:
                        continue
                
                if not pub_date:
                    pub_date = datetime.fromisoformat(pub_date_str.replace('Z', '+00:00'))
                
                hours_old = (now - pub_date).total_seconds() / 3600
                
                if hours_old <= 24:
                    score = 1.0
                elif hours_old <= 48:
                    score = 0.8
                elif hours_old <= 72:
                    score = 0.6
                elif hours_old <= 168:
                    score = 0.4
                else:
                    score = 0.2
                
                recency_scores.append(score)
                
            except:
                recency_scores.append(0.3)
        
        return sum(recency_scores) / len(recency_scores) if recency_scores else 0.3
    
    def _evaluate_factual_grounding(self, answer: str, sources: list[dict]) -> float:
        """Evaluate factual grounding"""
        if not answer or not sources:
            return 0.0
        
        answer_lower = answer.lower()
        words = re.findall(r'\b\w+\b', answer_lower)
        
        if len(words) < 3:
            return 0.5
        
        # Extract phrases
        answer_phrases = set()
        for n in range(3, min(7, len(words))):
            for i in range(len(words) - n + 1):
                phrase = ' '.join(words[i:i+n])
                if len(phrase) > 12:
                    answer_phrases.add(phrase)
        
        if not answer_phrases:
            return 0.5
        
        # Build source corpus
        source_text = " ".join([
            (s.get("text", "") or "") + " " + 
            ((s.get("metadata", {}) or {}).get("title", "") or "")
            for s in sources
        ]).lower()
        
        if not source_text:
            return 0.0
        
        grounded_count = sum(1 for phrase in answer_phrases if phrase in source_text)
        grounding_ratio = grounded_count / len(answer_phrases)
        
        return min(grounding_ratio * 1.5, 1.0)
    
    def _evaluate_enrichment(self, answer: str, sources: list[dict]) -> float:
        """Evaluate contextual enrichment"""
        if not answer or not sources:
            return 0.0
        
        answer_words = set(re.findall(r'\b\w{4,}\b', answer.lower()))
        
        if not answer_words:
            return 0.0
        
        source_words = set()
        for source in sources:
            text = source.get("text", "") or ""
            title = (source.get("metadata", {}) or {}).get("title", "") or ""
            combined = text + " " + title
            source_words.update(re.findall(r'\b\w{4,}\b', combined.lower()))
        
        if not source_words:
            return 0.5
        
        unique_words = answer_words - source_words
        enrichment_ratio = len(unique_words) / len(answer_words)
        
        # Optimal: 0.15-0.5
        if 0.15 <= enrichment_ratio <= 0.5:
            return 1.0
        elif enrichment_ratio < 0.15:
            return max(enrichment_ratio / 0.15, 0.3)
        else:
            return max(0.5, 1.0 - (enrichment_ratio - 0.5))
    
    def _evaluate_sentiment_alignment(self, answer: str, sources: list[dict]) -> float:
        """Evaluate sentiment alignment"""
        if not sources:
            return 0.5
        
        source_sentiments = []
        for source in sources:
            metadata = source.get("metadata", {}) or {}
            sentiment_str = metadata.get("sentiment", "") or "neutral_0.50"
            try:
                sentiment_label = sentiment_str.split('_')[0]
                source_sentiments.append(sentiment_label)
            except:
                source_sentiments.append("neutral")
        
        if not source_sentiments:
            return 0.5
        
        sentiment_counts = Counter(source_sentiments)
        majority_sentiment = sentiment_counts.most_common(1)[0][0]
        majority_ratio = sentiment_counts[majority_sentiment] / len(source_sentiments)
        
        # Analyze answer sentiment
        answer_lower = answer.lower()
        pos_indicators = ['good', 'great', 'positive', 'success', 'growth', 'improved', 'gain']
        neg_indicators = ['bad', 'poor', 'negative', 'fail', 'decline', 'loss', 'drop']
        
        pos_count = sum(1 for word in pos_indicators if word in answer_lower)
        neg_count = sum(1 for word in neg_indicators if word in answer_lower)
        
        if pos_count > neg_count * 1.5:
            answer_sentiment = 'positive'
        elif neg_count > pos_count * 1.5:
            answer_sentiment = 'negative'
        else:
            answer_sentiment = 'neutral'
        
        if answer_sentiment == majority_sentiment:
            return min(majority_ratio + 0.2, 1.0)
        elif majority_sentiment == 'neutral' or answer_sentiment == 'neutral':
            return 0.7
        else:
            return 0.4
    
    def _calculate_overall_confidence(self, scores: dict) -> float:
        """Calculate weighted confidence"""
        weights = {
            "source_relevance": 0.25,
            "recency": 0.20,
            "factual_grounding": 0.30,
            "contextual_enrichment": 0.15,
            "sentiment_alignment": 0.10,
        }
        
        overall = sum(
            scores.get(metric, 0) * weight
            for metric, weight in weights.items()
        )
        
        return round(overall, 3)
    
    def _interpret_confidence(self, confidence: float) -> str:
        """Human-readable interpretation"""
        if confidence >= 0.85:
            return "EXCELLENT - High confidence"
        elif confidence >= 0.70:
            return "GOOD - Reliable response"
        elif confidence >= 0.55:
            return "MODERATE - Acceptable"
        elif confidence >= 0.40:
            return "FAIR - Significant concerns"
        else:
            return "POOR - Low confidence"
    
    def _generate_detailed_analysis(self, scores: dict, answer: str, sources: list[dict]) -> dict:
        """Generate detailed analysis"""
        return {
            "strengths": self._identify_strengths(scores),
            "weaknesses": self._identify_weaknesses(scores),
            "recommendations": self._generate_recommendations(scores),
            "source_breakdown": {
                "total_sources": len(sources),
                "avg_recency_hours": self._calculate_avg_recency(sources),
                "sentiment_distribution": self._get_sentiment_distribution(sources),
            }
        }
    
    def _identify_strengths(self, scores: dict) -> list[str]:
        """Identify strengths"""
        strengths = []
        if scores.get("source_relevance", 0) >= 0.7:
            strengths.append("Strong source relevance")
        if scores.get("recency", 0) >= 0.7:
            strengths.append("Recent information")
        if scores.get("factual_grounding", 0) >= 0.7:
            strengths.append("Well-grounded in sources")
        if scores.get("contextual_enrichment", 0) >= 0.7:
            strengths.append("Good contextual enrichment")
        return strengths or ["No significant strengths"]
    
    def _identify_weaknesses(self, scores: dict) -> list[str]:
        """Identify weaknesses"""
        weaknesses = []
        if scores.get("source_relevance", 0) < 0.5:
            weaknesses.append("Low source relevance")
        if scores.get("recency", 0) < 0.5:
            weaknesses.append("Old information")
        if scores.get("factual_grounding", 0) < 0.5:
            weaknesses.append("Poor factual grounding")
        if scores.get("contextual_enrichment", 0) < 0.3:
            weaknesses.append("Too much copying")
        if scores.get("contextual_enrichment", 0) > 0.7:
            weaknesses.append("Too much novelty (hallucination risk)")
        return weaknesses or ["No significant weaknesses"]
    
    def _generate_recommendations(self, scores: dict) -> list[str]:
        """Generate recommendations"""
        recs = []
        if scores.get("source_relevance", 0) < 0.6:
            recs.append("Improve embedding model or query reformulation")
        if scores.get("recency", 0) < 0.6:
            recs.append("Reduce polling interval")
        if scores.get("factual_grounding", 0) < 0.6:
            recs.append("Adjust LLM prompt to stay closer to sources")
        return recs or ["System performing well"]
    
    def _calculate_avg_recency(self, sources: list[dict]) -> float | None:
        """Calculate average source age"""
        now = datetime.now()
        ages = []
        
        for source in sources:
            pub_date_str = (source.get("metadata", {}) or {}).get("published_at", "") or ""
            try:
                pub_date = datetime.fromisoformat(pub_date_str.replace('Z', '+00:00'))
                hours = (now - pub_date).total_seconds() / 3600
                ages.append(hours)
            except:
                pass
        
        return round(sum(ages) / len(ages), 1) if ages else None
    
    def _get_sentiment_distribution(self, sources: list[dict]) -> dict[str, int]:
        """Get sentiment distribution"""
        sentiments = []
        for source in sources:
            sentiment_str = (source.get("metadata", {}) or {}).get("sentiment", "") or "neutral_0.50"
            try:
                label = sentiment_str.split('_')[0]
                sentiments.append(label)
            except:
                sentiments.append("neutral")
        
        return dict(Counter(sentiments))
    
    def _print_results(self, scores: dict):
        """Pretty print results"""
        print("\n" + "="*80)
        print(" CONFIDENCE EVALUATION RESULTS")
        print("="*80)
        
        print(f"\n Overall Confidence: {scores['overall_confidence']:.2%}")
        print(f" Interpretation: {scores['interpretation']}\n")
        
        print("Detailed Scores:")
        print(f"  - Recency:               {scores.get('recency', 0):.2%}")
        print(f"  - Factual Grounding:     {scores.get('factual_grounding', 0):.2%}")
        print(f"  - Contextual Enrichment: {scores.get('contextual_enrichment', 0):.2%}")
        print(f"  - Sentiment Alignment:   {scores.get('sentiment_alignment', 0):.2%}")
        print(f"  - Source Relevance:      {scores.get('source_relevance', 0):.2%}")
        
        analysis = scores.get("detailed_analysis", {})
        
        print("\n Strengths:")
        for strength in analysis.get("strengths", []):
            print(f"  - {strength}")
        
        print("\n  Weaknesses:")
        for weakness in analysis.get("weaknesses", []):
            print(f"  - {weakness}")
        
        print("\n Recommendations:")
        for rec in analysis.get("recommendations", []):
            print(f"  - {rec}")
        
        breakdown = analysis.get("source_breakdown", {})
        print("\n Source Analysis:")
        print(f"  - Total Sources: {breakdown.get('total_sources', 0)}")
        if avg_age := breakdown.get("avg_recency_hours"):
            print(f"  - Average Age: {avg_age:.1f} hours")
        if sentiment_dist := breakdown.get("sentiment_distribution"):
            print(f"  - Sentiment: {sentiment_dist}")
        
        print("\n" + "="*80 + "\n")
    
    def _save_evaluation(self, scores: dict, answer: str, sources: list[dict]):
        """Save evaluation"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"confidence_eval_{timestamp}.json"
        
        data = {
            "scores": scores,
            "answer": answer,
            "sources": sources[:5]
        }
        
        with open(filename, "w") as f:
            json.dump(data, f, indent=2)
        
        print(f" Saved to: {filename}")


def main():
    """Main entry point"""
    import sys
    
    evaluator = HybridConfidenceEvaluator()
    
    query = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "What are the latest developments in AI technology?"
    
    results = evaluator.evaluate_response(query)
    
    confidence = results.get("overall_confidence", 0)
    exit(0 if confidence >= 0.7 else 1 if confidence >= 0.5 else 2)


if __name__ == "__main__":
    main()