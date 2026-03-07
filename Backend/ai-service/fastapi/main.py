from fastapi import FastAPI
from pydantic import BaseModel
import httpx, redis, json, os, hashlib

app = FastAPI()
redis_url = os.getenv("REDIS_HOST", "progresspulse_redis")
if not redis_url.startswith("redis://"):
    redis_url = f"redis://{redis_url}:6379"
r = redis.from_url(redis_url)
OLLAMA = os.getenv("OLLAMA_BASE_URL", "http://progresspulse_ollama:11434")
MODEL  = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
TTL    = int(os.getenv("CACHE_TTL_SECONDS", 86400))

class GoalSummaryRequest(BaseModel):
    goals: list
    employee_name: str

class DigestRequest(BaseModel):
    logs: list
    employee_name: str
    week_start: str

class ProgressRequest(BaseModel):
    goals: list
    employee_name: str

def cache_key(data: str) -> str:
    return hashlib.md5(data.encode()).hexdigest()

async def ask_ollama(prompt: str) -> str:
    cached = r.get(cache_key(prompt))
    if cached:
        return cached.decode()
    async with httpx.AsyncClient(timeout=120) as client:
        res = await client.post(f"{OLLAMA}/api/generate",
            json={"model": MODEL, "prompt": prompt, "stream": False})
        text = res.json()["response"]
    r.setex(cache_key(prompt), TTL, text)
    return text

@app.post("/ai/goal-summary")
async def goal_summary(req: GoalSummaryRequest):
    prompt = f"""Analyze {req.employee_name}'s goals and give a brief professional summary:
Goals: {json.dumps(req.goals)}
Provide: overall progress assessment, strengths, areas to improve. Keep it under 100 words."""
    return {"summary": await ask_ollama(prompt)}

@app.post("/ai/weekly-digest")
async def weekly_digest(req: DigestRequest):
    prompt = f"""Summarize {req.employee_name}'s week of {req.week_start}:
Logs: {json.dumps(req.logs)}
Provide: key achievements, blockers, recommendations. Under 100 words."""
    return {"digest": await ask_ollama(prompt)}

@app.post("/ai/progress-insight")
async def progress_insight(req: ProgressRequest):
    prompt = f"""Give {req.employee_name} motivational progress insights:
Goals: {json.dumps(req.goals)}
Be encouraging and specific. Under 80 words."""
    return {"insight": await ask_ollama(prompt)}

@app.get("/health")
def health():
    return {"status": "ok"}
