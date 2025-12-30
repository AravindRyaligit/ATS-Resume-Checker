# ATS Resume Checker

A comprehensive Applicant Tracking System (ATS) resume checker that analyzes resumes against job descriptions, providing precision scoring, keyword analysis, and actionable optimization suggestions.

![ATS Resume Checker](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

### 🎯 Precision ATS Scoring
- **Multi-factor Analysis**: Weighted scoring across skills (40%), experience (30%), education (15%), and keywords (15%)
- **Semantic Matching**: Uses NLP to understand context beyond exact keyword matching
- **Industry Standard**: Simulates real ATS systems used by Fortune 500 companies
- **Detailed Breakdown**: Category-by-category score analysis

### 🔍 Intelligent Keyword Analysis
- **Automatic Extraction**: Identifies key requirements from job descriptions
- **Categorization**: Separates technical skills, soft skills, certifications, and education
- **Synonym Recognition**: Understands related terms and variations
- **Visual Highlighting**: Shows exactly where keywords appear (or are missing)

### 💡 Actionable Suggestions
- **Prioritized Recommendations**: Critical, important, and recommended actions
- **Section-Specific Advice**: Targeted suggestions for each resume section
- **ATS Formatting Tips**: Ensures your resume is parser-friendly
- **Impact Ranking**: Focus on changes that matter most

### 📊 Professional Dashboard
- **Real-time Analysis**: Fast processing with progress indicators
- **Interactive Visualizations**: Animated score gauges and charts
- **Export Functionality**: Download detailed reports
- **Responsive Design**: Works on desktop, tablet, and mobile

### 📄 Resume Parsing
- **Multiple Formats**: Supports PDF and DOCX files
- **Section Detection**: Automatically identifies resume sections
- **Contact Extraction**: Finds email, phone, and LinkedIn
- **Format Validation**: Checks ATS compatibility

## Technology Stack

### Backend
- **Python 3.8+**: Core programming language
- **Flask**: Lightweight web framework
- **spaCy**: Advanced NLP for semantic analysis
- **scikit-learn**: TF-IDF vectorization and similarity
- **PyPDF2 & python-docx**: Resume file parsing

### Frontend
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with glassmorphism
- **Vanilla JavaScript**: No framework dependencies
- **Google Fonts (Inter)**: Professional typography

## Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd Resume_checker
```

2. **Create a virtual environment**
```bash
python -m venv venv
```

3. **Activate the virtual environment**
- Windows:
```bash
venv\Scripts\activate
```
- macOS/Linux:
```bash
source venv/bin/activate
```

4. **Install dependencies**
```bash
pip install -r requirements.txt
```

5. **Download spaCy language model**
```bash
python -m spacy download en_core_web_sm
```

## Usage

### Starting the Application

1. **Start the Flask server**
```bash
python app.py
```

The server will start on `http://localhost:5000`

2. **Open the web interface**
- Open `index.html` in your web browser
- Or use a local server:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000`

### Using the ATS Checker

1. **Upload Your Resume**
   - Click the upload area or drag & drop your resume (PDF or DOCX)
   - Maximum file size: 5MB

2. **Enter Job Description**
   - Paste the complete job description
   - Include all requirements, skills, and qualifications

3. **Analyze**
   - Click "Analyze Resume"
   - Wait for the analysis to complete (typically 3-5 seconds)

4. **Review Results**
   - Check your overall ATS score
   - Review category breakdowns
   - Identify missing keywords
   - Read optimization suggestions

5. **Export Report**
   - Click "Export Results" to download a detailed text report

## API Documentation

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "message": "ATS Resume Checker API is running"
}
```

### Analyze Resume
```http
POST /api/analyze
```

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `resume`: File (PDF or DOCX)
  - `job_description`: String

**Response:**
```json
{
  "success": true,
  "score": {
    "overall_score": 75.5,
    "category_scores": {
      "skills_match": 80.0,
      "experience_match": 70.0,
      "education_match": 75.0,
      "keyword_density": 77.0
    },
    "semantic_similarity": 72.5,
    "rating": "Good"
  },
  "keywords": {
    "found": {...},
    "missing": {...},
    "density": 77.0
  },
  "suggestions": {...}
}
```

## Project Structure

```
Resume_checker/
├── app.py                    # Flask API server
├── config.py                 # Configuration settings
├── resume_parser.py          # Resume parsing logic
├── keyword_extractor.py      # Keyword extraction engine
├── ats_scorer.py            # Scoring algorithm
├── suggestions_generator.py  # Suggestions engine
├── requirements.txt          # Python dependencies
├── index.html               # Frontend interface
├── styles.css               # Styling
├── script.js                # Frontend logic
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## How It Works

### 1. Resume Parsing
- Extracts text from PDF/DOCX files
- Identifies sections (summary, experience, education, skills)
- Cleans and normalizes text

### 2. Keyword Extraction
- Analyzes job description using NLP
- Extracts technical skills, soft skills, certifications
- Categorizes by importance

### 3. Scoring Algorithm
- **Skills Match (40%)**: Technical and soft skills alignment
- **Experience Match (30%)**: TF-IDF similarity with job description
- **Education Match (15%)**: Degree and certification matching
- **Keyword Density (15%)**: Presence of key terms

### 4. Semantic Analysis
- Uses spaCy for contextual understanding
- Recognizes synonyms and related terms
- Calculates semantic similarity score

### 5. Suggestions Generation
- Identifies missing keywords by category
- Prioritizes recommendations by impact
- Provides section-specific advice
- Includes ATS formatting tips

## Tips for Best Results

1. **Complete Job Descriptions**: Include all sections of the job posting
2. **Clean Resumes**: Use standard formatting without complex graphics
3. **Relevant Content**: Ensure your resume matches the job type
4. **Update Regularly**: Re-analyze after making changes
5. **Multiple Attempts**: Try different job descriptions to optimize broadly

## Scoring Guide

- **80-100 (Excellent)**: Resume is well-optimized for ATS
- **60-79 (Good)**: Minor improvements recommended
- **40-59 (Fair)**: Significant optimization needed
- **0-39 (Needs Improvement)**: Major restructuring required

## Troubleshooting

### Common Issues

**"Failed to analyze resume"**
- Ensure the file is a valid PDF or DOCX
- Check file size is under 5MB
- Verify the file isn't password-protected

**"No resume file provided"**
- Make sure you've selected a file before clicking Analyze

**"Server connection error"**
- Ensure Flask server is running (`python app.py`)
- Check that port 5000 is not blocked

**"spaCy model not found"**
- Run: `python -m spacy download en_core_web_sm`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Flask, spaCy, and scikit-learn
- Inspired by real ATS systems used in recruitment
- Designed to help job seekers optimize their resumes

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ to help you land your dream job**
