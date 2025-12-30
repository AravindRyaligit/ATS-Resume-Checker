# ATS Job Tracker & Resume Checker

A comprehensive Applicant Tracking System (ATS) solution that combines a modern job tracking dashboard with an intelligent resume analysis tool. Built with React, Vite, Python (Flask), and AI.

![Screenshot 2025-12-30 170608.jpg](https://github.com/AravindRyaligit/ATS/blob/main/Screenshot%202025-12-30%20170608.jpg)
## Overview

This project consists of two main components:
1.  **JobTracker**: A React-based dashboard to organize your job search, track applications, and manage interview schedules.
2.  **Resume Checker**: A Python/Flask application that uses NLP and GenAI to analyze your resume against job descriptions, providing detailed scoring and optimization suggestions.

## Features

### 🖥️ JobTracker
- **Application Tracking**: Log detailed application info (Company, Position, Status, Location, etc.).
- **Smart Dashboard**: View usage stats and upcoming interviews at a glance.
- **Data Persistence**: Uses IndexedDB for secure, local data storage.
- **Search & Sort**: Filter applications instantly by role or company; sort by date.
- **File Management**: Attach specific CVs and cover letters to each application entry.

### 🧠 Resume Checker
- **Precision Scoring**: Analyzes Skills (40%), Experience (30%), Education (15%), and Keywords (15%).
- **AI Suggestions**: Uses Ollama (LLM) to generate specific, actionable text improvements for your resume.
- **Keyword Analysis**: Extracts and highlights missing technical and soft skills from job descriptions.
- **Multi-Format Support**: Parses both PDF and DOCX resume files.
- **Detailed Reports**: Exports comprehensive analysis reports.

## Technology Stack

- **Frontend**: React, Vite, Lucide React (Icons), IDB-Keyval (Storage).
- **Backend**: Python 3.8+, Flask, spaCy (NLP), scikit-learn (TF-IDF), Ollama (GenAI).

## Prerequisites

Before starting, ensure you have the following installed:
- **Node.js** (v16+ recommended)
- **Python** (v3.8+)
- **Ollama** (for AI suggestions) - [Download Ollama](https://ollama.com/)

## Installation & Setup

### 1. Backend Setup (Resume Checker)

Navigate to the `backend` directory and set up the Python environment:

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download required spaCy model
python -m spacy download en_core_web_sm
```

**Note**: Ensure Ollama is running (`ollama serve`) and you have pulled the model you intend to use (e.g., `ollama pull llama3`).

### 2. Frontend Setup (JobTracker)

In the root directory of the project:

```bash
# Install Node dependencies
npm install
```

## Usage

You need to run both the frontend and backend servers.

### 1. Start the Backend Server
In your backend terminal (with venv activated):
```bash
python app.py
```
*Server runs at `http://localhost:5000`*

### 2. Start the Frontend Application
In your root terminal:
```bash
npm run dev
```
*App runs at `http://localhost:5173` (or similar)*

### 3. Using the App
1.  Open the frontend URL in your browser.
2.  Use the **Dashboard** to add specific job applications.
3.  Use the **Resume Analysis** tool to upload your CV and a job description to get instant feedback and scoring.

## Project Structure

```
ATS/
├── backend/                  # Python Flask Server & Analysis Logic
│   ├── app.py                # API Entry Point
│   ├── ats_scorer.py         # Scoring Algorithms
│   ├── resume_parser.py      # File Parsing (PDF/DOCX)
│   ├── ...
├── src/                      # React Frontend Source
│   ├── components/           # UI Components
│   ├── ...
├── public/                   # Static Assets
├── package.json              # Frontend Dependencies
├── vite.config.js            # Vite Configuration
└── README.md                 # Project Documentation
```

## Contributing

Contributions are welcome! Please fork the repository and submit a Pull Request.

## License

This project is licensed under the MIT License.
