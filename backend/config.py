import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Google Earth Engine
    EE_PROJECT_ID = os.getenv("EE_PROJECT_ID", "omega-bearing-464216-i7")
    EE_SERVICE_ACCOUNT = os.getenv("EE_SERVICE_ACCOUNT")
    EE_PRIVATE_KEY_PATH = os.getenv("EE_PRIVATE_KEY_PATH", "service-account-key.json")
    
    # OpenAI for LLM
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    
    # API Configuration
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", "8000"))
    
    # CORS
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080")
    
    # Default coordinates for Coimbatore, Tamil Nadu (ISRO region)
    DEFAULT_LAT = 11.0168
    DEFAULT_LNG = 76.9558
    DEFAULT_ZOOM = 10

config = Config()
