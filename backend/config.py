import os

class Config:
    # Upload settings
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    
    # Scoring weights
    WEIGHTS = {
        'skills': 0.40,
        'experience': 0.30,
        'education': 0.15,
        'keywords': 0.15
    }
    
    # Thresholds
    EXCELLENT_SCORE = 80
    GOOD_SCORE = 60
    FAIR_SCORE = 40
    
    # NLP settings
    SPACY_MODEL = 'en_core_web_sm'
    MIN_KEYWORD_LENGTH = 2
    MAX_KEYWORDS = 50
    
    # API settings
    API_HOST = '0.0.0.0'
    API_PORT = 5000
    DEBUG = True

    # LLM Configuration
    OLLAMA_ENABLED = True
    OLLAMA_BASE_URL = 'http://localhost:11434'
    OLLAMA_MODEL = 'llama3.1'  # Using llama3.1 (already installed)
    OLLAMA_TIMEOUT = 30

# Create upload folder if it doesn't exist
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
