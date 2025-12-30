import re
import PyPDF2
from docx import Document
from typing import Dict, List

class ResumeParser:
    def __init__(self):
        self.section_keywords = {
            'summary': ['summary', 'profile', 'objective', 'about'],
            'experience': ['experience', 'work history', 'employment', 'professional experience'],
            'education': ['education', 'academic', 'qualification', 'degree'],
            'skills': ['skills', 'technical skills', 'competencies', 'expertise'],
            'certifications': ['certification', 'certificate', 'license']
        }
    
    def parse_resume(self, file_path: str) -> Dict:
        """Parse resume and extract structured information"""
        if file_path.endswith('.pdf'):
            text = self._extract_pdf(file_path)
        elif file_path.endswith('.docx'):
            text = self._extract_docx(file_path)
        else:
            raise ValueError("Unsupported file format")
        
        sections = self._identify_sections(text)
        
        return {
            'raw_text': text,
            'sections': sections,
            'contact_info': self._extract_contact_info(text),
            'total_words': len(text.split())
        }
    
    def _extract_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            raise Exception(f"Error reading PDF: {str(e)}")
        
        return self._clean_text(text)
    
    def _extract_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = Document(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        except Exception as e:
            raise Exception(f"Error reading DOCX: {str(e)}")
        
        return self._clean_text(text)
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s\-.,@()&/]', '', text)
        return text.strip()
    
    def _identify_sections(self, text: str) -> Dict[str, str]:
        """Identify and extract different sections of the resume"""
        sections = {}
        lines = text.split('\n')
        current_section = 'other'
        section_content = {key: [] for key in self.section_keywords.keys()}
        section_content['other'] = []
        
        for line in lines:
            line_lower = line.lower().strip()
            
            # Check if line is a section header
            section_found = False
            for section_name, keywords in self.section_keywords.items():
                if any(keyword in line_lower for keyword in keywords) and len(line.split()) < 5:
                    current_section = section_name
                    section_found = True
                    break
            
            if not section_found and line.strip():
                section_content[current_section].append(line)
        
        # Convert lists to strings
        for section_name, content in section_content.items():
            sections[section_name] = ' '.join(content).strip()
        
        return sections
    
    def _extract_contact_info(self, text: str) -> Dict[str, str]:
        """Extract contact information from resume"""
        contact_info = {}
        
        # Email pattern
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, text)
        if email_match:
            contact_info['email'] = email_match.group()
        
        # Phone pattern
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        phone_match = re.search(phone_pattern, text)
        if phone_match:
            contact_info['phone'] = phone_match.group()
        
        # LinkedIn pattern
        linkedin_pattern = r'linkedin\.com/in/[\w-]+'
        linkedin_match = re.search(linkedin_pattern, text, re.IGNORECASE)
        if linkedin_match:
            contact_info['linkedin'] = linkedin_match.group()
        
        return contact_info
