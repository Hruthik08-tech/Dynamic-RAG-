"""
Interactive Terminal Query Interface for Live News RAG
Tests the RAG pipeline with conversational queries in the terminal
"""

import requests
import json
from datetime import datetime
import sys


class NewsRAGTester:
    """Interactive tester for the Live News RAG pipeline"""
    
    def __init__(self, base_url: str = "http://0.0.0.0:8000"):
        self.base_url = base_url
        self.answer_endpoint = f"{base_url}/v1/pw_ai_answer"
        self.retrieve_endpoint = f"{base_url}/v1/retrieve"
        self.list_docs_endpoint = f"{base_url}/v1/pw_list_documents"
        
    def check_server_health(self) -> bool:
        """Check if the RAG server is running"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=2)
            return response.status_code in [200, 404]  # 404 is ok, means server is up
        except requests.exceptions.RequestException:
            return False
    
    def query(self, question: str) -> dict | None:
        """Send a query to the RAG system and get a response"""
        try:
            # Try both 'query' and 'prompt' parameters
            payload = {"prompt": question}  # Changed from "query" to "prompt"
            response = requests.post(
                self.answer_endpoint,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=180  # Increased timeout for LLM processing
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"\n Error querying RAG system: {e}")
            return None
    
    def retrieve_context(self, question: str, k: int = 5) -> dict | None:
        """Retrieve relevant context chunks without LLM answer"""
        try:
            payload = {"query": question, "k": k}
            response = requests.post(
                self.retrieve_endpoint,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"\n Error retrieving context: {e}")
            return None
    
    def list_documents(self) -> list | None:
        """List all documents in the knowledge base"""
        try:
            response = requests.post(
                self.list_docs_endpoint,
                json={},
                headers={"Content-Type": "application/json"},
                timeout=60
            )
            response.raise_for_status()
            # The API returns a list directly, not a dict
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"\n Error listing documents: {e}")
            return None
    
    def print_response(self, response_data: dict | None):
        """Pretty print the RAG response"""
        if not response_data:
            return
        
        print("\n" + "="*70)
        print(" RAG RESPONSE")
        print("="*70)
        
        # Main answer - check both 'answer' and 'response' keys
        answer = response_data.get("answer") or response_data.get("response")
        if answer:
            print(f"\n{answer}\n")
        
        # Sources used
        if sources := response_data.get("sources"):
            print("\n Sources Used:")
            print("-"*70)
            for i, source in enumerate(sources[:5], 1):  # Show top 5 sources
                metadata = source.get("metadata", {})
                print(f"\n{i}. {metadata.get('title', 'Untitled')}")
                print(f"   Source: {metadata.get('source', 'Unknown')}")
                print(f"   Author: {metadata.get('author', 'Unknown')}")
                print(f"   Published: {metadata.get('published_at', 'N/A')}")
                print(f"   Sentiment: {metadata.get('sentiment', 'N/A')}")
                if url := metadata.get('path'):
                    print(f"   URL: {url}")
        
        print("\n" + "="*70)
    
    def print_context(self, context_data: dict | list | None):
        """Pretty print retrieved context chunks"""
        if not context_data:
            return
        
        print("\n" + "="*70)
        print(" RETRIEVED CONTEXT")
        print("="*70)
        
        # Handle both dict with 'chunks' key and direct list
        if isinstance(context_data, dict):
            chunks = context_data.get("chunks", [])
        elif isinstance(context_data, list):
            chunks = context_data
        else:
            chunks = []
        
        if chunks:
            for i, chunk in enumerate(chunks, 1):
                metadata = chunk.get("metadata", {})
                text = chunk.get("text", "")
                
                print(f"\n{i}. {metadata.get('title', 'Untitled')}")
                print(f"   Source: {metadata.get('source', 'Unknown')}")
                print(f"   Author: {metadata.get('author', 'Unknown')}")
                print(f"   Published: {metadata.get('published_at', 'N/A')}")
                print(f"   Sentiment: {metadata.get('sentiment', 'N/A')}")
                print(f"\n   Content Preview: {text[:200]}...")
        else:
            print("\n  No chunks found")
        
        print("\n" + "="*70)
    
    def interactive_mode(self):
        """Run an interactive query session"""
        print("\n" + "="*70)
        print(" LIVE NEWS RAG - INTERACTIVE TESTING MODE")
        print("="*70)
        print("\nChecking server health...")
        
        if not self.check_server_health():
            print(" RAG server is not running!")
            print(f"   Please start the server with: python news.py")
            print(f"   Expected server at: {self.base_url}")
            return
        
        print(" Server is running!\n")
        print("Commands:")
        print("  - Type your question to query the RAG system")
        print("  - Type 'context: <question>' to see retrieved context only")
        print("  - Type 'docs' to list all indexed documents")
        print("  - Type 'quit' or 'exit' to stop")
        print("\n" + "="*70)
        
        while True:
            try:
                # Get user input
                print("\n You: ", end="", flush=True)
                user_input = input().strip()
                
                if not user_input:
                    continue
                
                # Handle exit commands
                if user_input.lower() in ['quit', 'exit', 'q']:
                    print("\n Goodbye!")
                    break
                
                # Handle list documents command
                if user_input.lower() == 'docs':
                    print("\n Fetching document list...")
                    docs = self.list_documents()
                    
                    if docs and isinstance(docs, list):
                        print(f"\nTotal documents indexed: {len(docs)}")
                        for i, doc in enumerate(docs[:10], 1):  # Show first 10
                            metadata = doc.get("metadata", {})
                            print(f"\n{i}. {metadata.get('title', 'Untitled')}")
                            print(f"   Source: {metadata.get('source', 'Unknown')}")
                            print(f"   Published: {metadata.get('published_at', 'N/A')}")
                            print(f"   Sentiment: {metadata.get('sentiment', 'N/A')}")
                    else:
                        print("No documents found or error occurred")
                    continue
                
                # Handle context-only queries
                if user_input.lower().startswith('context:'):
                    question = user_input[8:].strip()
                    if question:
                        print("\n Retrieving context...")
                        context_data = self.retrieve_context(question)
                        self.print_context(context_data)
                    continue
                
                # Regular RAG query
                print(f"\nProcessing query at {datetime.now().strftime('%H:%M:%S')}...")
                response_data = self.query(user_input)
                
                if response_data:
                    self.print_response(response_data)
                    
                    # Save response for confidence evaluation if needed
                    self._save_last_response(user_input, response_data)
                else:
                    print("\nFailed to get response from RAG system")
            
            except KeyboardInterrupt:
                print("\n\n Interrupted by user. Goodbye!")
                break
            except Exception as e:
                print(f"\nError: {e}")
    
    def _save_last_response(self, query: str, response: dict):
        """Save last response for confidence evaluation"""
        try:
            with open("last_response.json", "w") as f:
                json.dump({
                    "timestamp": datetime.now().isoformat(),
                    "query": query,
                    "response": response
                }, f, indent=2)
        except Exception as e:
            # Silent fail - this is just for testing
            pass
    
    def batch_test(self, questions: list[str]):
        """Run a batch of test questions"""
        print("\n" + "="*70)
        print("BATCH TESTING MODE")
        print("="*70)
        
        results = []
        
        for i, question in enumerate(questions, 1):
            print(f"\n[{i}/{len(questions)}] Testing: {question}")
            response_data = self.query(question)
            
            if response_data:
                results.append({
                    "question": question,
                    "answer": response_data.get("answer"),
                    "sources_count": len(response_data.get("sources", [])),
                    "timestamp": datetime.now().isoformat()
                })
                print("Success")
            else:
                print("Failed")
        
        # Save batch results
        with open("batch_test_results.json", "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\nBatch test complete! Results saved to batch_test_results.json")
        return results


def main():
    """Main entry point"""
    # Parse command line arguments
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "http://0.0.0.0:8000"
    
    tester = NewsRAGTester(base_url)
    
    # Check if batch mode
    if "--batch" in sys.argv:
        # Example batch questions
        test_questions = [
            "What are the latest developments in AI?",
            "Tell me about recent technology news",
            "What's happening in the stock market?",
            "Any breaking news today?",
            "What are the top stories right now?"
        ]
        tester.batch_test(test_questions)
    else:
        # Interactive mode
        tester.interactive_mode()


if __name__ == "__main__":
    main()