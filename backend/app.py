from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from config import Config
from resume_parser import ResumeParser
from keyword_extractor import KeywordExtractor
from ats_scorer import ATSScorer
from suggestions_generator import SuggestionsGenerator
from llm_suggestion_generator import LLMSuggestionGenerator

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})
app.config.from_object(Config)

# Initialize components
resume_parser = ResumeParser()
keyword_extractor = KeywordExtractor()
ats_scorer = ATSScorer()
suggestions_generator = SuggestionsGenerator()
llm_generator = LLMSuggestionGenerator()

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'ATS Resume Checker API is running'
    }), 200

@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    """Main analysis endpoint"""
    try:
        # Check if file is present
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file provided'}), 400
        
        file = request.files['resume']
        job_description = request.form.get('job_description', '')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not job_description:
            return jsonify({'error': 'No job description provided'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file format. Only PDF and DOCX allowed'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        try:
            # Parse resume
            resume_data = resume_parser.parse_resume(filepath)
            
            # Extract keywords from job description
            job_keywords = keyword_extractor.extract_keywords(job_description)
            
            # Find missing keywords
            missing_keywords = keyword_extractor.find_missing_keywords(
                resume_data['raw_text'], 
                job_keywords
            )
            
            # Calculate ATS score
            score_data = ats_scorer.calculate_score(
                resume_data, 
                job_description, 
                job_keywords
            )
            
            # Generate suggestions
            suggestions = suggestions_generator.generate_suggestions(
                missing_keywords,
                score_data,
                resume_data['sections']
            )
            
            # Calculate keyword density
            keyword_density = keyword_extractor.calculate_keyword_density(
                resume_data['raw_text'],
                job_keywords['all_keywords']
            )
            
            # Generate LLM-powered suggestions
            llm_suggestions = {}
            try:
                if Config.OLLAMA_ENABLED:
                    llm_suggestions = llm_generator.generate_suggestions(
                        job_description,
                        missing_keywords,
                        resume_data['sections'],
                        score_data['overall_score']
                    )
            except Exception as e:
                print(f"LLM generation error: {e}")
                llm_suggestions = {
                    'llm_unavailable': True,
                    'message': 'AI suggestions temporarily unavailable'
                }
            
            # Prepare response
            response = {
                'success': True,
                'score': score_data,
                'keywords': {
                    'found': job_keywords,
                    'missing': missing_keywords,
                    'density': round(keyword_density, 2)
                },
                'suggestions': suggestions,
                'llm_suggestions': llm_suggestions,
                'resume_sections': {
                    'has_summary': bool(resume_data['sections'].get('summary')),
                    'has_experience': bool(resume_data['sections'].get('experience')),
                    'has_education': bool(resume_data['sections'].get('education')),
                    'has_skills': bool(resume_data['sections'].get('skills')),
                    'word_count': resume_data['total_words']
                },
                'contact_info': resume_data['contact_info']
            }
            
            return jsonify(response), 200
            
        finally:
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(413)
def file_too_large(e):
    """Handle file too large error"""
    return jsonify({
        'error': 'File too large. Maximum size is 5MB'
    }), 413

@app.errorhandler(500)
def internal_error(e):
    """Handle internal server errors"""
    return jsonify({
        'error': 'Internal server error occurred'
    }), 500

if __name__ == '__main__':
    app.run(
        host=Config.API_HOST,
        port=Config.API_PORT,
        debug=Config.DEBUG
    )
