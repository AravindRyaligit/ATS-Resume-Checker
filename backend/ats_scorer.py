from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, List
from config import Config

class ATSScorer:
    def __init__(self):
        self.nlp = None
        try:
            import spacy
            self.nlp = spacy.load(Config.SPACY_MODEL)
            print(f"Loaded spaCy model for ATS scoring: {Config.SPACY_MODEL}")
        except (OSError, ImportError) as e:
            print(f"Warning: spaCy model not available for ATS scoring ({e}). Using TF-IDF fallback.")
        
        
        self.vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
    
    def calculate_score(self, resume_data: Dict, job_description: str, job_keywords: Dict) -> Dict:
        """Calculate comprehensive ATS score"""
        resume_text = resume_data['raw_text']
        sections = resume_data['sections']
        
        # Calculate individual scores
        skills_score = self._score_skills(sections.get('skills', ''), job_keywords)
        experience_score = self._score_experience(sections.get('experience', ''), job_description)
        education_score = self._score_education(sections.get('education', ''), job_keywords)
        keyword_score = self._score_keywords(resume_text, job_keywords)
        
        # Calculate weighted overall score
        overall_score = (
            skills_score * Config.WEIGHTS['skills'] +
            experience_score * Config.WEIGHTS['experience'] +
            education_score * Config.WEIGHTS['education'] +
            keyword_score * Config.WEIGHTS['keywords']
        )
        
        # Calculate semantic similarity
        semantic_score = self._calculate_semantic_similarity(resume_text, job_description)
        
        # Adjust overall score with semantic similarity
        final_score = (overall_score * 0.7) + (semantic_score * 0.3)
        
        return {
            'overall_score': round(final_score, 2),
            'category_scores': {
                'skills_match': round(skills_score, 2),
                'experience_match': round(experience_score, 2),
                'education_match': round(education_score, 2),
                'keyword_density': round(keyword_score, 2)
            },
            'semantic_similarity': round(semantic_score, 2),
            'rating': self._get_rating(final_score)
        }
    
    def _score_skills(self, skills_section: str, job_keywords: Dict) -> float:
        """Score skills match"""
        if not skills_section:
            return 0.0
        
        skills_lower = skills_section.lower()
        tech_skills = job_keywords.get('technical_skills', [])
        soft_skills = job_keywords.get('soft_skills', [])
        
        total_skills = len(tech_skills) + len(soft_skills)
        if total_skills == 0:
            return 50.0
        
        # Count matched skills (weighted: technical 70%, soft 30%)
        tech_matches = sum(1 for skill in tech_skills if skill.lower() in skills_lower)
        soft_matches = sum(1 for skill in soft_skills if skill.lower() in skills_lower)
        
        tech_score = (tech_matches / len(tech_skills) * 100) if tech_skills else 0
        soft_score = (soft_matches / len(soft_skills) * 100) if soft_skills else 0
        
        return (tech_score * 0.7) + (soft_score * 0.3)
    
    def _score_experience(self, experience_section: str, job_description: str) -> float:
        """Score experience match"""
        if not experience_section:
            return 0.0
        
        # Use TF-IDF to compare experience section with job description
        try:
            tfidf_matrix = self.vectorizer.fit_transform([experience_section, job_description])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return similarity * 100
        except:
            return 50.0
    
    def _score_education(self, education_section: str, job_keywords: Dict) -> float:
        """Score education match"""
        if not education_section:
            return 30.0  # Partial credit if no education section found
        
        education_lower = education_section.lower()
        education_requirements = job_keywords.get('education', [])
        certifications = job_keywords.get('certifications', [])
        
        total_requirements = len(education_requirements) + len(certifications)
        if total_requirements == 0:
            return 70.0  # Good score if no specific requirements
        
        # Check for degree matches
        degree_keywords = ['bachelor', 'master', 'phd', 'doctorate', 'associate']
        has_degree = any(degree in education_lower for degree in degree_keywords)
        
        # Check for specific requirements
        edu_matches = sum(1 for req in education_requirements if req.lower() in education_lower)
        cert_matches = sum(1 for cert in certifications if cert.lower() in education_lower)
        
        match_score = ((edu_matches + cert_matches) / total_requirements) * 100
        
        # Bonus for having a degree
        if has_degree:
            match_score = min(100, match_score + 20)
        
        return match_score
    
    def _score_keywords(self, resume_text: str, job_keywords: Dict) -> float:
        """Score keyword density"""
        resume_lower = resume_text.lower()
        all_keywords = job_keywords.get('all_keywords', [])
        
        if not all_keywords:
            return 50.0
        
        # Count keyword matches
        matches = sum(1 for kw in all_keywords if kw.lower() in resume_lower)
        
        # Calculate density
        density = (matches / len(all_keywords)) * 100
        
        return min(100, density)
    
    def _calculate_semantic_similarity(self, resume_text: str, job_description: str) -> float:
        """Calculate semantic similarity using spaCy or TF-IDF fallback"""
        if self.nlp:
            try:
                # Process texts with spaCy
                resume_doc = self.nlp(resume_text[:1000000])  # Limit to 1M chars for spaCy
                job_doc = self.nlp(job_description[:1000000])
                
                # Calculate similarity
                similarity = resume_doc.similarity(job_doc)
                
                return similarity * 100
            except:
                pass
        
        # Fallback to TF-IDF similarity
        try:
            tfidf_matrix = self.vectorizer.fit_transform([resume_text, job_description])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return similarity * 100
        except:
            return 50.0
    
    def _get_rating(self, score: float) -> str:
        """Get rating based on score"""
        if score >= Config.EXCELLENT_SCORE:
            return "Excellent"
        elif score >= Config.GOOD_SCORE:
            return "Good"
        elif score >= Config.FAIR_SCORE:
            return "Fair"
        else:
            return "Needs Improvement"
