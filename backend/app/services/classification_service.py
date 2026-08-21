import requests
import json
from app.core.config import settings

class ClassificationService:
    @staticmethod
    async def classify_interest(transcript: str):
        """Legacy helper for interest classification."""
        return await ClassificationService.classify_screening_response(transcript, "Are you interested in this role?")

    @staticmethod
    async def classify_screening_response(transcript: str, question_text: str):
        """
        Classifies screening responses for any question.
        Determines the output format based on the question content or defaults to yes/no.
        """
        # Determine if it's an interest check or general yes/no
        is_interest = "interested" in question_text.lower() or "interest" in question_text.lower()
        valid_results = '"interested" | "not_interested" | "unclear"' if is_interest else '"yes" | "no" | "unclear"'
        
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        prompt = f"""
        You are an expert recruitment screening assistant.
        Analyze the candidate's spoken response (transcribed) to the following screening question.
        
        Question: "{question_text}"
        Transcript: "{transcript}"
        
        Based on the transcript, classify the response into one of the allowed categories: {valid_results}.
        
        Rules:
        - If the candidate says "yes", "sure", "definitely", "I am", "I have", or similar positive intent, map to "yes" or "interested".
        - If the candidate says "no", "not really", "I don't think so", "not available", or similar negative intent, map to "no" or "not_interested".
        - If the response is vague, says "maybe", "I'll have to check", or is cut off/gibberish, map to "unclear".
        
        Return STRICTLY a JSON object. No extra text.
        {{
            "result": "result_value_here",
            "reason": "Brief explanation of why you chose this classification based on the transcript."
        }}
        """
        
        payload = {
            "model": settings.OPENROUTER_MODEL,
            "messages": [
                {"role": "system", "content": "You are a recruitment assistant. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"}
        }
        
        try:
            response = requests.post(
                settings.OPENROUTER_API_URL,
                headers=headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Classification failed: {str(e)}")
            # Fallback for demo stability
            return json.dumps({"result": "unclear", "reason": f"API Error: {str(e)}"})

