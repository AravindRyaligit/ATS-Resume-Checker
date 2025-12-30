import re
import spacy
from typing import List, Dict, Set
from collections import Counter
from config import Config

class KeywordExtractor:
    def __init__(self):
        self.nlp = None
        try:
            import spacy
            self.nlp = spacy.load(Config.SPACY_MODEL)
            print(f"Loaded spaCy model: {Config.SPACY_MODEL}")
        except (OSError, ImportError) as e:
            print(f"Warning: spaCy model not available ({e}). Using fallback keyword extraction.")
            print("To enable advanced NLP features, run: python -m spacy download en_core_web_sm")
        
        
        # Common technical skills and tools
        self.tech_skills = {
            'python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
            'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'spring', 'express',
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'ci/cd',
            'machine learning', 'deep learning', 'ai', 'nlp', 'computer vision',
            'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
            'agile', 'scrum', 'jira', 'rest api', 'graphql', 'microservices'
        }
        
        # Soft skills
        self.soft_skills = {
            'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
            'creative', 'adaptable', 'organized', 'detail-oriented', 'collaborative',
            'time management', 'critical thinking', 'decision making', 'presentation'
        }
    
    def extract_keywords(self, job_description: str) -> Dict[str, List[str]]:
        """Extract keywords from job description"""
        keywords = {
            'technical_skills': [],
            'soft_skills': [],
            'required_experience': [],
            'education': [],
            'certifications': [],
            'all_keywords': []
        }
        
        # Extract technical skills
        for skill in self.tech_skills:
            if skill in job_description.lower():
                keywords['technical_skills'].append(skill)
        
        # Extract soft skills
        for skill in self.soft_skills:
            if skill in job_description.lower():
                keywords['soft_skills'].append(skill)
        
        # Use spaCy if available, otherwise use basic extraction
        if self.nlp:
            doc = self.nlp(job_description.lower())
            
            # Extract noun phrases as potential keywords
            noun_phrases = [chunk.text for chunk in doc.noun_chunks 
                           if len(chunk.text.split()) <= 3 and len(chunk.text) > Config.MIN_KEYWORD_LENGTH]
            
            # Extract entities (organizations, technologies, etc.)
            entities = [ent.text for ent in doc.ents 
                       if ent.label_ in ['ORG', 'PRODUCT', 'SKILL', 'GPE']]
        else:
            # Fallback: extract common noun phrases using simple regex
            words = re.findall(r'\b[a-z]{3,}\b', job_description.lower())
            noun_phrases = []
            entities = []
            
            # Extract multi-word phrases (simple approach)
            for i in range(len(words) - 1):
                phrase = f"{words[i]} {words[i+1]}"
                if len(phrase) > Config.MIN_KEYWORD_LENGTH:
                    noun_phrases.append(phrase)
        
        # Extract education requirements
        education_keywords = ['bachelor', 'master', 'phd', 'degree', 'diploma', 'certification']
        for keyword in education_keywords:
            if keyword in job_description.lower():
                # Extract context around education keyword
                pattern = rf'\b\w+\s+{keyword}\b|\b{keyword}\s+\w+\b'
                matches = re.findall(pattern, job_description.lower())
                keywords['education'].extend(matches)
        
        # Extract experience requirements
        experience_pattern = r'(\d+)\+?\s*years?'
        experience_matches = re.findall(experience_pattern, job_description.lower())
        if experience_matches:
            keywords['required_experience'] = [f"{years} years" for years in experience_matches]
        
        # Extract certifications
        cert_pattern = r'\b[A-Z]{2,}[\w\s-]*(?:certified|certification)\b'
        cert_matches = re.findall(cert_pattern, job_description)
        keywords['certifications'] = cert_matches
        
        # Combine all keywords
        all_keywords = (
            keywords['technical_skills'] + 
            keywords['soft_skills'] + 
            noun_phrases + 
            entities
        )
        
        # Remove duplicates and filter
        all_keywords = list(set([kw.strip() for kw in all_keywords if len(kw.strip()) > 2]))
        
        # Rank by frequency
        keyword_freq = Counter([kw for kw in all_keywords])
        keywords['all_keywords'] = [kw for kw, _ in keyword_freq.most_common(Config.MAX_KEYWORDS)]
        
        return keywords
    
    def find_missing_keywords(self, resume_text: str, job_keywords: Dict[str, List[str]]) -> Dict[str, List[str]]:
        """Find keywords from job description that are missing in resume"""
        resume_lower = resume_text.lower()
        
        missing = {
            'technical_skills': [],
            'soft_skills': [],
            'education': [],
            'certifications': [],
            'other': []
        }
        
        # Check technical skills
        for skill in job_keywords['technical_skills']:
            if skill.lower() not in resume_lower:
                missing['technical_skills'].append(skill)
        
        # Check soft skills
        for skill in job_keywords['soft_skills']:
            if skill.lower() not in resume_lower:
                missing['soft_skills'].append(skill)
        
        # Check education
        for edu in job_keywords['education']:
            if edu.lower() not in resume_lower:
                missing['education'].append(edu)
        
        # Check certifications
        for cert in job_keywords['certifications']:
            if cert.lower() not in resume_lower:
                missing['certifications'].append(cert)
        
        # Check other keywords
        for keyword in job_keywords['all_keywords']:
            if (keyword.lower() not in resume_lower and 
                keyword not in missing['technical_skills'] and 
                keyword not in missing['soft_skills']):
                missing['other'].append(keyword)
        
        return missing
    
    def calculate_keyword_density(self, resume_text: str, keywords: List[str]) -> float:
        """Calculate keyword density in resume"""
        resume_lower = resume_text.lower()
        total_keywords = len(keywords)
        
        if total_keywords == 0:
            return 0.0
        
        found_keywords = sum(1 for kw in keywords if kw.lower() in resume_lower)
        
        return (found_keywords / total_keywords) * 100
