import os
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(override=True)


def get_ai_insights(spend_summary: dict) -> dict:
    """
    Sends a structured spending summary to Gemini and gets back
    3 concise cost-optimization suggestions.

    This is NOT a chat system — it's automated insight generation.
    The backend calculates the numbers, Gemini just explains them.

    Examiner explanation:
    'We pass aggregated billing metrics — total spend, top services,
    month-over-month trend — as context to the Gemini API. The model
    returns natural-language recommendations without any user interaction.'
    """
    api_key = os.getenv("AI_API_KEY", "")

    if not api_key or api_key.startswith("paste_"):
        return {
            "available": False,
            "reason": "AI_API_KEY not configured",
            "insights": [],
        }

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-flash-latest")  # Free tier flash model

        # Build a clean, structured prompt from the real data
        prompt = f"""
You are a cloud cost analyst. Analyze this cloud spending summary and give exactly 3 
short, actionable cost-optimization recommendations. Be specific. No fluff.

Cloud Spending Summary:
- Total Spend (last 12 months): ${spend_summary.get('total_cost', 0):,.2f}
- Top Services by Cost: {', '.join(spend_summary.get('top_services', []))}
- Cloud Providers Used: {', '.join(spend_summary.get('providers', []))}
- Forecasted Next Month: ${spend_summary.get('forecast', 0):,.2f}
- Trend: {spend_summary.get('trend', 'unknown')}
- Anomalies Detected: {spend_summary.get('anomaly_count', 0)}

Return exactly 3 bullet points. Each should be one sentence. Start each with a specific action verb.
"""

        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # Parse bullet points from the response
        lines = []
        for l in raw_text.split("\n"):
            l = l.strip()
            if not l:
                continue
            # Remove leading bullet markers: "1.", "2.", "-", "*", "•"
            l = re.sub(r'^[\d]+[\.\)]\s*', '', l)
            l = re.sub(r'^[\-\*\•]\s*', '', l)
            lines.append(l.strip())
        insights = [l for l in lines if len(l) > 20][:3]  # Take max 3, ignore short lines

        return {
            "available": True,
            "insights": insights,
            "raw": raw_text,
        }

    except Exception as e:
        print(f"AI Insights error: {e}")
        return {
            "available": False,
            "reason": str(e),
            "insights": [],
        }
