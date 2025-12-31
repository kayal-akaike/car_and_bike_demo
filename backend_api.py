"""
FastAPI backend for the Mahindra Bot React frontend.
Provides REST endpoints for the chat interface.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, AsyncGenerator
import json
import asyncio
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Langfuse for token tracking (with fallback for compatibility issues)
try:
    from langfuse import Langfuse, observe
    
    # Initialize Langfuse client
    langfuse = Langfuse(
        public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
        secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
        host=os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")
    )
    print("✅ Langfuse initialized successfully for token tracking")
except Exception as e:
    print(f"⚠️ Langfuse initialization failed: {e}")
    print("⚠️ Continuing without Langfuse tracking...")
    
    # Fallback: Create no-op decorator and client
    def observe(name=None, **kwargs):
        def decorator(func):
            return func
        return decorator
    
    class MockLangfuse:
        def flush(self):
            pass
    
    langfuse = MockLangfuse()

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

from mahindrabot.core import AgentToolKit, run_mahindra_bot
from mahindrabot.core.intents import classify_intent
from mahindrabot.services.bike_service import BikeService
from mahindrabot.services.car_service import CarService
from mahindrabot.services.ev_charger_service import EVChargerLocationService
from mahindrabot.services.faq_service import FAQService
from mahindrabot.services.llm_service import LLMConfig, ModelArgs, UserMessage

app = FastAPI(
    title="Mahindra Bot API",
    description="Backend API for the Mahindra Bot React frontend",
    version="1.0.0"
)

# Enable CORS for React frontend
# Get allowed origins from environment variable or use defaults
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatMessage(BaseModel):
    content: str
    role: str  # "user" or "assistant"
    timestamp: str = None

class ToolResult(BaseModel):
    name: str
    status: int
    input: Dict[str, Any] = None
    output: Any = None
    metadata: Dict[str, Any] = None

class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []

class PasswordVerification(BaseModel):
    password: str

class ChatResponse(BaseModel):
    message: str
    intent: str | None = None
    tools_used: List[str] = []
    tool_results: List[ToolResult] = []
    conversation_id: str | None = None

# Global services - initialized on startup
car_service = None
bike_service = None
faq_service = None
ev_charger_service = None
toolkit = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    global car_service, bike_service, faq_service, ev_charger_service, toolkit
    
    try:
        car_data_path = Path("data/new_car_details")
        bike_data_path = Path("data/new_bike_details")
        faq_data_path = Path("data/consolidated_faqs.json")
        ev_locations_path = Path("data/ev-locations.json")
        
        car_service = CarService(str(car_data_path))
        bike_service = BikeService(str(bike_data_path))
        faq_service = FAQService(str(faq_data_path))
        ev_charger_service = EVChargerLocationService(str(ev_locations_path))
        
        toolkit = AgentToolKit(
            car_service=car_service,
            bike_service=bike_service,
            faq_service=faq_service,
            ev_charger_service=ev_charger_service
        )
        
        print("✅ Services initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing services: {e}")

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Mahindra Bot API is running"}

@app.post("/verify-password")
async def verify_password(request: PasswordVerification):
    """Verify login password against APP_PASSWORD from environment."""
    app_password = os.getenv("APP_PASSWORD", "")
    
    if not app_password:
        raise HTTPException(status_code=500, detail="APP_PASSWORD not configured")
    
    return {"valid": request.password == app_password}

@app.post("/chat")
@observe(name="chat_endpoint")  # Track this endpoint with Langfuse
async def chat(request: ChatRequest) -> ChatResponse:
    """Handle chat messages and return bot response."""
    try:
        if not toolkit:
            raise HTTPException(status_code=500, detail="Services not initialized")
        
        # Convert conversation history to LLM format
        messages = []
        for msg in request.conversation_history:
            messages.append(UserMessage(content=msg.content, role=msg.role))
        
        # Add current user message
        user_message = UserMessage(content=request.message, role="user")
        messages.append(user_message)
        
        # Create LLM config
        config = LLMConfig(
            model_id="gpt-4o-mini",
            model_args=ModelArgs(temperature=0.1, max_tokens=1000)
        )
        
        # Classify intent
        intent = None
        intent_str = None
        try:
            intent = classify_intent(messages, config)
            if intent and hasattr(intent, 'intent_name'):
                intent_str = intent.intent_name.value if hasattr(intent.intent_name, 'value') else str(intent.intent_name)
            elif intent and hasattr(intent, 'type'):
                intent_str = intent.type.value if hasattr(intent.type, 'value') else str(intent.type)
        except Exception as e:
            print(f"Intent classification failed: {e}")
        
        # Get bot response
        responses = list(run_mahindra_bot(request.message, messages[:-1], toolkit, config))
        
        if not responses:
            raise HTTPException(status_code=500, detail="No response from bot")
        
        final_response = responses[-1]
        tools_used = []
        tool_results = []
        
        # Extract tool information from response steps
        for step in final_response.steps:
            if step.status == "done" and hasattr(step, 'tool_results'):
                for tool_result in step.tool_results:
                    tools_used.append(tool_result.name)
                    tool_results.append(ToolResult(
                        name=tool_result.name,
                        status=tool_result.status,
                        input=tool_result.input if hasattr(tool_result, 'input') else None,
                        output=tool_result.output if hasattr(tool_result, 'output') else None,
                        metadata=tool_result.metadata if hasattr(tool_result, 'metadata') else None
                    ))
        
        # Flush Langfuse to ensure data is sent
        langfuse.flush()
        
        return ChatResponse(
            message=final_response.final_message.content if final_response.final_message else "I'm sorry, I couldn't process your request.",
            intent=intent_str,
            tools_used=tools_used,
            tool_results=tool_results,
            conversation_id="default"  # TODO: Implement proper conversation management
        )
        
    except Exception as e:
        print(f"Chat error: {e}")
        langfuse.flush()  # Flush even on error
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")
        
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Handle chat messages and return streaming bot response."""
    
    async def generate_response() -> AsyncGenerator[str, None]:
        try:
            if not toolkit:
                yield json.dumps({"error": "Services not initialized"}) + "\n"
                return
            
            # Convert conversation history
            messages = []
            for msg in request.conversation_history:
                messages.append(UserMessage(content=msg.content, role=msg.role))
            
            config = LLMConfig(
                model_id="gpt-4o-mini",
                model_args=ModelArgs(temperature=0.1, max_tokens=1000)
            )
            
            # Classify intent
            intent = None
            try:
                # Add user message to messages list
                user_msg = UserMessage(content=request.message, role="user")
                messages.append(user_msg)
                intent = classify_intent(messages, config)
            except Exception as e:
                print(f"Intent classification failed: {e}")
            
            # Yield intent first
            if intent:
                yield json.dumps({
                    "type": "intent", 
                    "data": {"intent": intent.type.value, "confidence": intent.confidence}
                }) + "\n"
            
            # Stream bot responses
            for response in run_mahindra_bot(request.message, messages, toolkit, config):
                if response.final_message:
                    yield json.dumps({
                        "type": "message",
                        "data": {
                            "content": response.final_message.content,
                            "final": True
                        }
                    }) + "\n"
                else:
                    # Stream intermediate steps/thinking
                    for step in response.steps:
                        if hasattr(step, 'content'):
                            yield json.dumps({
                                "type": "thinking",
                                "data": {"content": step.content}
                            }) + "\n"
                
                await asyncio.sleep(0.1)  # Small delay for smoother streaming
                
        except Exception as e:
            yield json.dumps({
                "type": "error", 
                "data": {"message": f"Error: {str(e)}"}
            }) + "\n"
    
    return StreamingResponse(generate_response(), media_type="text/plain")

@app.get("/intents")
async def get_intents():
    """Get available intent types."""
    return {
        "intents": [
            "greeting",
            "general_qna", 
            "car_recommendation",
            "bike_recommendation",
            "ev_charger_location",
            "insurance_query",
            "booking_assistance",
            "goodbye"
        ]
    }

@app.get("/analytics/tokens")
async def get_token_analytics():
    """Get token usage statistics for pricing."""
    try:
        traces = langfuse.fetch_traces(limit=100)  # Last 100 requests
        
        token_counts = []
        input_tokens = []
        output_tokens = []
        costs = []
        
        for trace in traces.data:
            if hasattr(trace, 'usage') and trace.usage:
                total = trace.usage.get('total', 0) or 0
                if total > 0:
                    token_counts.append(total)
                    input_tokens.append(trace.usage.get('input', 0) or 0)
                    output_tokens.append(trace.usage.get('output', 0) or 0)
            
            if hasattr(trace, 'calculated_total_cost') and trace.calculated_total_cost:
                costs.append(trace.calculated_total_cost)
        
        if not token_counts:
            return {
                "error": "No token data available yet",
                "message": "Send some requests first to collect token statistics"
            }
        
        from statistics import mean, median
        
        stats = {
            "total_requests": len(token_counts),
            "total_tokens": sum(token_counts),
            "average_tokens_per_request": round(mean(token_counts), 2),
            "median_tokens_per_request": round(median(token_counts), 2),
            "min_tokens": min(token_counts),
            "max_tokens": max(token_counts),
            "average_input_tokens": round(mean(input_tokens), 2) if input_tokens else 0,
            "average_output_tokens": round(mean(output_tokens), 2) if output_tokens else 0,
            "total_cost_usd": round(sum(costs), 6) if costs else 0,
            "average_cost_per_request": round(mean(costs), 6) if costs else 0,
        }
        
        return stats
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)