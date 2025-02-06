from typing import Optional
import aiohttp
from app.config import get_settings

settings = get_settings()

class AIHandler:
    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        
    async def generate_response(
        self,
        question: str,
        subject: Optional[str] = None,
        difficulty_level: Optional[str] = None
    ) -> str:
        """
        Generate a guided response using the LLM
        """
        prompt = self._create_prompt(question, subject, difficulty_level)
        
        # Implement your specific LLM API call here
        # This is a placeholder for your actual implementation
        async with aiohttp.ClientSession() as session:
            # Replace with your actual LLM API endpoint and implementation
            async with session.post(
                "your-llm-endpoint",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={"prompt": prompt}
            ) as response:
                result = await response.json()
                return result["response"]

    def _create_prompt(self, question: str, subject: Optional[str], difficulty_level: Optional[str]) -> str:
        return f"""
        You are a helpful Dutch high school tutor.
        Subject: {subject or 'General'}
        Question: {question}
        Difficulty: {difficulty_level or 'medium'}
        
        Guide the student towards the answer using the Socratic method.
        Break down the problem into steps and ask leading questions.
        Don't give the answer directly.
        """