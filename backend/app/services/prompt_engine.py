import json
import logging
from typing import List, Dict, Any
import httpx
from app.core.config import settings
from app.models.job_ai_config import JobAIConfig

logger = logging.getLogger(__name__)

GLOBAL_RECRUITER_RULES = """
- Ask ONE question at a time. Do not ask multiple questions in one sentence.
- Acknowledge the candidate's response before moving on, but keep it brief.
- Avoid repeatedly saying "Great", "Perfect", or "Thanks for sharing".
- Do not repeat a question if the candidate already answered it naturally.
- If the answer is unclear, ask once for clarification.
- If the candidate still doesn't understand, explain the question simply.
- Accept natural language answers. Don't require exact keywords.
- Don't sound robotic. Keep responses short and conversational.
- Speak like a human recruiter.
- Do not invent candidate information.
- Do not make hiring promises.
- Respect candidate responses and handle interruptions naturally.
- Follow the EXACT order of the screening questions provided, unless the conversation context makes a natural response require temporary deviation.
"""

INVALID_ANSWER_RULES = """
- If the candidate's answer is unclear, phrase the question differently.
- Maximum clarification attempts: 2.
- If the candidate still provides an unclear answer after 2 attempts, say "No problem, we can move on to the next question." and proceed.
- NEVER loop indefinitely on the same question.
"""

CALLBACK_RULES = """
- If the candidate says they are busy, in a meeting, or asks you to call back later, DO NOT mark them as not interested.
- Reply naturally, e.g., "No problem. Would you like me to call you back at a more convenient time?"
- Ask for the specific DATE and TIME. The AI must not assume a date/time.
- If they say "Tomorrow", explicitly ask "What time tomorrow works best for you?"
- After collecting both the date and time, thank them and end the call.
- Extract the callback date as 'callback_date' and the callback time as 'callback_time' so the system can record it.
"""

INTEREST_RULES = """
- Use semantic intent to detect interest. Do not use simple keyword matching like if "no" is in the answer.
- Explicit rejection (e.g., "I'm not interested", "I don't want to continue", "I'm not looking for this kind of opportunity") -> Result in marking them as Not Interested.
- Temporary unavailability (e.g., "I'm busy", "Call me later") -> Treat as Callback Required, NOT Not Interested.
- Uncertainty (e.g., "I'm not sure", "Can you tell me more?") -> Continue the conversation and provide details.
"""

PROMPT_TEMPLATE_V1 = """You are Hireonomous AI Recruiter.
You are calling a candidate regarding the {job_title} opportunity at {company_name}.
Your goal is to conduct a short, professional screening conversation.

JOB INFORMATION
Job Title: {job_title}
Job Description: {job_description}
Required Skills: {required_skills}
Experience: {experience_range}
Location: {location}
Employment Type: {employment_type}

SCREENING QUESTIONS (Must be asked in this order)
{screening_questions}

GLOBAL CONVERSATION RULES
{global_recruiter_rules}

INVALID ANSWER RULES
{invalid_answer_rules}

CALLBACK RULES
{callback_rules}

INTEREST RULES
{interest_rules}
"""

class PromptEngine:
    @staticmethod
    async def generate_screening_questions(job_title: str, job_description: str, skills: List[str], experience: str) -> List[Dict[str, Any]]:
        """Uses OpenAI to generate 5-7 relevant screening questions for a job."""
        if not settings.OPENAI_API_KEY:
            # Fallback
            return [
                {"question": "How many years of total work experience do you have?", "category": "Experience", "required": True, "order": 1},
                {"question": f"What experience do you have with {skills[0] if skills else 'the required tools'}?", "category": "Technical", "required": True, "order": 2},
                {"question": "When would you be available for an interview?", "category": "Logistics", "required": True, "order": 3},
            ]

        prompt = f"""
        Generate 5-7 screening questions for this job.
        Job Title: {job_title}
        Description: {job_description}
        Skills: {', '.join(skills)}
        Experience: {experience}
        
        The questions should be natural. Include some technical, some experience-based, and logistics (availability).
        DO NOT ask irrelevant questions (e.g., ML questions for a Sales job).
        Return JSON list of objects with: "question", "category" (e.g. Technical, Experience, Logistics), "required" (bool).
        """
        
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o",
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"}
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
                response.raise_for_status()
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                # Sometimes it wraps in a root object
                data = json.loads(content)
                questions = data.get("questions", data) if isinstance(data, dict) else data
                
                formatted_questions = []
                for idx, q in enumerate(questions):
                    formatted_questions.append({
                        "question": q.get("question", ""),
                        "category": q.get("category", "General"),
                        "required": q.get("required", True),
                        "order": idx + 1
                    })
                return formatted_questions
        except Exception as e:
            logger.error(f"Failed to generate questions: {e}")
            return [
                {"question": "How many years of total work experience do you have?", "category": "Experience", "required": True, "order": 1},
                {"question": "When would you be available for an interview?", "category": "Logistics", "required": True, "order": 2}
            ]

    @staticmethod
    def generate_prompt(job: dict, config: dict, candidate_name: str = "the candidate", company_name: str = "Hireonomous") -> str:
        """Generates the final system prompt by combining templates and context."""
        
        q_list = config.get("screening_questions", [])
        q_str = "\n".join([f"{q.get('order', idx+1)}. {q.get('question')}" for idx, q in enumerate(q_list)])
        
        prompt = PROMPT_TEMPLATE_V1.format(
            job_title=job.get("title", ""),
            company_name=company_name,
            job_description=job.get("description", ""),
            required_skills=", ".join(job.get("skills", [])),
            experience_range=job.get("experience", ""),
            location=job.get("location", ""),
            employment_type=job.get("jobType", ""),
            screening_questions=q_str,
            global_recruiter_rules=GLOBAL_RECRUITER_RULES,
            invalid_answer_rules=INVALID_ANSWER_RULES,
            callback_rules=CALLBACK_RULES,
            interest_rules=INTEREST_RULES
        )
        
        # Add tone/voice constraints if needed
        tone = config.get("tone", "Professional & Conversational")
        prompt += f"\n\nMaintain a {tone} tone throughout the conversation."
        
        return prompt
