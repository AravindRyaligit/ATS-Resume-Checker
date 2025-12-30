import ollama
from typing import Dict, List, Optional
import json
from config import Config


class LLMSuggestionGenerator:
    """Generates specific, actionable resume text suggestions using Ollama LLM"""
    
    def __init__(self):
        self.enabled = Config.OLLAMA_ENABLED
        self.base_url = Config.OLLAMA_BASE_URL
        self.model = Config.OLLAMA_MODEL
        self.timeout = Config.OLLAMA_TIMEOUT
        self.ollama_available = self._check_ollama_availability()
    
    def _check_ollama_availability(self) -> bool:
        """Check if Ollama is running and accessible"""
        if not self.enabled:
            return False
        
        try:
            ollama.list()
            return True
        except Exception as e:
            print(f"Ollama not available: {e}")
            return False
    
    def generate_suggestions(
        self,
        job_description: str,
        missing_keywords: Dict[str, List[str]],
        resume_sections: Dict[str, str],
        current_score: float
    ) -> Dict[str, any]:
        """
        Generate specific text suggestions for resume improvement
        
        Args:
            job_description: The target job description
            missing_keywords: Dictionary of missing keywords by category
            resume_sections: Current resume sections
            current_score: Current ATS score
            
        Returns:
            Dictionary containing specific text suggestions
        """
        if not self.ollama_available:
            return self._get_fallback_suggestions(missing_keywords)
        
        try:
            suggestions = {
                'missing_keywords_list': self._generate_missing_keywords_list(
                    missing_keywords
                ),
                'skills_to_add': self._generate_skills_to_add(
                    job_description, missing_keywords
                ),
                'professional_summary': self._generate_professional_summary(
                    job_description, missing_keywords
                ),
                'experience_bullets': self._generate_experience_bullets(
                    job_description, missing_keywords, resume_sections
                ),
                'skills_integration': self._generate_skills_text(
                    job_description, missing_keywords
                ),
                'summary_enhancement': self._generate_summary_text(
                    job_description, missing_keywords, resume_sections
                ),
                'project_ideas': self._generate_project_ideas(
                    job_description, missing_keywords, resume_sections
                ),
                'section_specific': self._generate_section_specific(
                    missing_keywords
                )
            }
            
            return suggestions
            
        except Exception as e:
            print(f"LLM generation error: {e}")
            return self._get_fallback_suggestions(missing_keywords)
    
    def _generate_missing_keywords_list(
        self,
        missing_keywords: Dict[str, List[str]]
    ) -> Dict[str, List[str]]:
        """Generate explicit list of missing keywords to add"""
        
        result = {}
        
        # Technical Skills
        tech = missing_keywords.get('technical_skills', [])
        if tech:
            result['technical_skills'] = tech[:10]  # Top 10
        
        # Soft Skills
        soft = missing_keywords.get('soft_skills', [])
        if soft:
            result['soft_skills'] = soft[:5]  # Top 5
        
        # Certifications
        certs = missing_keywords.get('certifications', [])
        if certs:
            result['certifications'] = certs[:5]
        
        # Education
        edu = missing_keywords.get('education', [])
        if edu:
            result['education'] = edu[:3]
        
        return result
    
    def _generate_skills_to_add(
        self,
        job_description: str,
        missing_keywords: Dict[str, List[str]]
    ) -> List[str]:
        """Generate specific list of skills to add to resume"""
        
        all_missing = []
        all_missing.extend(missing_keywords.get('technical_skills', [])[:8])
        all_missing.extend(missing_keywords.get('soft_skills', [])[:4])
        
        if not all_missing:
            return []
        
        prompt = f"""You are a resume expert. Based on this job description, list the EXACT skills the candidate should add to their resume.

Job Description: {job_description[:600]}

Missing Skills: {', '.join(all_missing)}

Instructions:
- List each skill on a new line starting with a dash (-)
- Use the EXACT terminology from the job description
- Prioritize the most important skills first
- Include both technical and soft skills
- Keep it to 8-10 skills maximum
- Be specific (e.g., "Python 3.x" not just "Python")

Generate the skills list:"""
        
        try:
            response = ollama.generate(
                model=self.model,
                prompt=prompt,
                options={'temperature': 0.5, 'num_predict': 250}
            )
            
            text = response['response'].strip()
            skills = [line.strip('- ').strip() for line in text.split('\n') if line.strip().startswith('-')]
            
            return skills[:10] if skills else all_missing[:10]
            
        except Exception as e:
            print(f"Error generating skills list: {e}")
            return all_missing[:10]
    
    def _generate_professional_summary(
        self,
        job_description: str,
        missing_keywords: Dict[str, List[str]]
    ) -> str:
        """Generate job-tailored professional summary"""
        
        tech_skills = missing_keywords.get('technical_skills', [])[:5]
        soft_skills = missing_keywords.get('soft_skills', [])[:2]
        
        if not tech_skills:
            return ""
        
        prompt = f"""You are a professional resume writer. Write a compelling professional summary tailored specifically for this job.

Job Description: {job_description[:500]}

Key Skills to Include: {', '.join(tech_skills + soft_skills)}

Instructions:
- Write 3-4 sentences maximum
- Start with a strong professional title or descriptor
- Highlight relevant experience and expertise
- Naturally incorporate the key skills listed above
- Make it compelling and achievement-focused
- Use active voice and strong language
- Tailor it specifically to THIS job description

Write the professional summary:"""
        
        try:
            response = ollama.generate(
                model=self.model,
                prompt=prompt,
                options={'temperature': 0.7, 'num_predict': 200}
            )
            
            return response['response'].strip()
            
        except Exception as e:
            print(f"Error generating professional summary: {e}")
            return ""
    
    def _generate_experience_bullets(
        self,
        job_description: str,
        missing_keywords: Dict[str, List[str]],
        resume_sections: Dict[str, str]
    ) -> List[str]:
        """Generate specific bullet points for Experience section"""
        
        technical_skills = missing_keywords.get('technical_skills', [])[:5]
        
        if not technical_skills:
            return []
        
        prompt = f"""You are a professional resume writer. Generate 4 specific, achievement-oriented bullet points that incorporate the missing skills.

Job Description: {job_description[:500]}

Missing Skills to Incorporate: {', '.join(technical_skills)}

Instructions:
- Start with powerful action verbs (Led, Developed, Architected, Implemented, Optimized, etc.)
- Include SPECIFIC metrics (e.g., "increased efficiency by 40%", "managed $2M budget", "reduced load time by 3 seconds")
- Naturally incorporate ALL the missing skills listed above
- Use past tense for completed work
- Each bullet should be 1-2 lines maximum
- Focus on ACHIEVEMENTS and IMPACT, not just tasks
- Make them sound impressive and quantifiable
- Ensure they're ATS-friendly

Generate 4 bullet points, one per line, starting with a dash (-)."""

        try:
            response = ollama.generate(
                model=self.model,
                prompt=prompt,
                options={'temperature': 0.7, 'num_predict': 400}
            )
            
            text = response['response'].strip()
            bullets = [line.strip('- ').strip() for line in text.split('\n') if line.strip().startswith('-')]
            
            return bullets[:4] if bullets else []
            
        except Exception as e:
            print(f"Error generating experience bullets: {e}")
            return []
    
    def _generate_skills_text(
        self,
        job_description: str,
        missing_keywords: Dict[str, List[str]]
    ) -> List[str]:
        """Generate text to integrate missing skills"""
        
        all_missing = []
        all_missing.extend(missing_keywords.get('technical_skills', [])[:3])
        all_missing.extend(missing_keywords.get('soft_skills', [])[:2])
        
        if not all_missing:
            return []
        
        prompt = f"""You are a professional resume writer. Write 2-3 sentences that showcase these skills for a Skills section.

Job Requirements: {job_description[:400]}

Skills to Showcase: {', '.join(all_missing)}

Instructions:
- Write professional skill statements
- Show PROFICIENCY and EXPERIENCE level (e.g., "5+ years", "Expert in", "Advanced proficiency")
- Incorporate ALL the skills listed above
- Make it sound impressive and confident
- Keep each sentence complete and professional
- Focus on demonstrating expertise, not just listing

Generate 2-3 sentences, one per line."""

        try:
            response = ollama.generate(
                model=self.model,
                prompt=prompt,
                options={'temperature': 0.7, 'num_predict': 200}
            )
            
            text = response['response'].strip()
            sentences = [s.strip() for s in text.split('\n') if s.strip() and len(s.strip()) > 20]
            
            return sentences[:3] if sentences else []
            
        except Exception as e:
            print(f"Error generating skills text: {e}")
            return []
    
    def _generate_summary_text(
        self,
        job_description: str,
        missing_keywords: Dict[str, List[str]],
        resume_sections: Dict[str, str]
    ) -> str:
        """Generate enhanced professional summary"""
        
        key_skills = missing_keywords.get('technical_skills', [])[:4]
        
        if not key_skills:
            return ""
        
        prompt = f"""You are a professional resume writer. Generate a compelling 2-3 sentence professional summary for a resume.

Job Description: {job_description[:400]}

Key Skills to highlight: {', '.join(key_skills)}

Requirements:
- Write in third person or first person
- Highlight relevant experience and skills
- Include the key skills naturally
- Make it compelling and professional
- Keep it to 2-3 sentences total
- Focus on value proposition

Generate the professional summary:"""

        try:
            response = ollama.generate(
                model=self.model,
                prompt=prompt,
                options={'temperature': 0.7, 'num_predict': 150}
            )
            
            return response['response'].strip()
            
        except Exception as e:
            print(f"Error generating summary: {e}")
            return ""
    
    def _generate_project_ideas(
        self,
        job_description: str,
        missing_keywords: Dict[str, List[str]],
        resume_sections: Dict[str, str]
    ) -> List[str]:
        """Generate specific project ideas to add to resume"""
        
        technical_skills = missing_keywords.get('technical_skills', [])[:6]
        
        if not technical_skills:
            return []
        
        # Check if resume has projects
        projects_section = resume_sections.get('other', '')
        has_projects = 'project' in projects_section.lower()
        
        prompt = f"""You are a technical career advisor. Based on this job description, suggest 3-4 specific project ideas that would strengthen the candidate's resume.

Job Description: {job_description[:500]}

Missing Technical Skills: {', '.join(technical_skills)}

Current Projects Status: {"Has some projects" if has_projects else "No projects section found"}

Instructions:
- Suggest SPECIFIC, realistic projects (not vague ideas)
- Each project should demonstrate 2-3 of the missing skills
- Include what the project should DO and what technologies to use
- Make them achievable within 1-2 weeks each
- Focus on projects that directly relate to the job requirements
- Be concrete (e.g., "Build a real-time chat app using React and WebSocket" not "Make a web app")
- Each suggestion should be one complete sentence
- Start each with a dash (-)

Generate 3-4 project ideas:"""

        try:
            response = ollama.generate(
                model=self.model,
                prompt=prompt,
                options={'temperature': 0.7, 'num_predict': 400}
            )
            
            text = response['response'].strip()
            projects = [line.strip('- ').strip() for line in text.split('\n') if line.strip().startswith('-')]
            
            return projects[:4] if projects else []
            
        except Exception as e:
            print(f"Error generating project ideas: {e}")
            return []
    
    def _generate_section_specific(
        self,
        missing_keywords: Dict[str, List[str]]
    ) -> Dict[str, List[str]]:
        """Generate section-specific keyword integration suggestions"""
        
        suggestions = {}
        
        # Technical Skills
        tech_skills = missing_keywords.get('technical_skills', [])[:5]
        if tech_skills:
            suggestions['technical_skills'] = [
                f"Add '{skill}' to your Technical Skills section" for skill in tech_skills
            ]
        
        # Certifications
        certs = missing_keywords.get('certifications', [])[:3]
        if certs:
            suggestions['certifications'] = [
                f"Consider obtaining: {cert}" for cert in certs
            ]
        
        # Soft Skills
        soft = missing_keywords.get('soft_skills', [])[:3]
        if soft:
            suggestions['soft_skills'] = [
                f"Demonstrate '{skill}' through specific examples in your experience" for skill in soft
            ]
        
        return suggestions
    
    def _get_fallback_suggestions(
        self,
        missing_keywords: Dict[str, List[str]]
    ) -> Dict[str, any]:
        """Provide basic suggestions when LLM is unavailable"""
        
        return {
            'experience_bullets': [],
            'skills_integration': [],
            'summary_enhancement': "",
            'section_specific': self._generate_section_specific(missing_keywords),
            'llm_unavailable': True,
            'message': 'AI suggestions unavailable. Please ensure Ollama is running with llama3.2 model.'
        }
