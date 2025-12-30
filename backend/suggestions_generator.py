from typing import Dict, List

class SuggestionsGenerator:
    def __init__(self):
        self.priority_weights = {
            'technical_skills': 10,
            'soft_skills': 7,
            'certifications': 8,
            'education': 6,
            'other': 5
        }
    
    def generate_suggestions(self, 
                           missing_keywords: Dict[str, List[str]], 
                           score_data: Dict,
                           resume_sections: Dict) -> Dict:
        """Generate actionable suggestions for resume improvement"""
        
        suggestions = {
            'critical': [],
            'important': [],
            'recommended': [],
            'formatting': [],
            'summary': {}
        }
        
        # Analyze score and generate suggestions
        overall_score = score_data['overall_score']
        category_scores = score_data['category_scores']
        
        # Critical suggestions (score < 40)
        if overall_score < 40:
            suggestions['critical'].append({
                'title': 'Low ATS Score - Major Improvements Needed',
                'description': 'Your resume needs significant optimization to pass ATS screening.',
                'action': 'Focus on adding missing keywords and restructuring content to match job requirements.'
            })
        
        # Skills suggestions
        if category_scores['skills_match'] < 60:
            tech_missing = missing_keywords.get('technical_skills', [])
            if tech_missing:
                suggestions['critical'].append({
                    'title': 'Add Missing Technical Skills',
                    'description': f'Your resume is missing {len(tech_missing)} key technical skills.',
                    'action': f'Add these skills to your Skills section: {", ".join(tech_missing[:5])}',
                    'keywords': tech_missing,
                    'section': 'skills'
                })
        
        # Experience suggestions
        if category_scores['experience_match'] < 60:
            suggestions['important'].append({
                'title': 'Strengthen Experience Section',
                'description': 'Your experience section doesn\'t align well with job requirements.',
                'action': 'Rewrite bullet points to include job-specific keywords and quantify achievements.',
                'section': 'experience'
            })
        
        # Education suggestions
        if category_scores['education_match'] < 50:
            edu_missing = missing_keywords.get('education', [])
            if edu_missing:
                suggestions['important'].append({
                    'title': 'Highlight Relevant Education',
                    'description': 'Education requirements from job posting are not clearly visible.',
                    'action': f'Ensure these qualifications are prominent: {", ".join(edu_missing)}',
                    'section': 'education'
                })
        
        # Keyword density suggestions
        if category_scores['keyword_density'] < 50:
            suggestions['important'].append({
                'title': 'Increase Keyword Density',
                'description': 'Your resume contains too few keywords from the job description.',
                'action': 'Naturally incorporate more job-specific terms throughout your resume.',
                'section': 'all'
            })
        
        # Soft skills suggestions
        soft_missing = missing_keywords.get('soft_skills', [])
        if soft_missing:
            suggestions['recommended'].append({
                'title': 'Add Soft Skills',
                'description': f'Include {len(soft_missing)} soft skills mentioned in job posting.',
                'action': f'Weave these into your experience descriptions: {", ".join(soft_missing[:3])}',
                'keywords': soft_missing,
                'section': 'experience'
            })
        
        # Certification suggestions
        cert_missing = missing_keywords.get('certifications', [])
        if cert_missing:
            suggestions['recommended'].append({
                'title': 'Highlight Certifications',
                'description': 'Job requires specific certifications.',
                'action': f'If you have these, add them prominently: {", ".join(cert_missing)}',
                'keywords': cert_missing,
                'section': 'certifications'
            })
        
        # Project suggestions
        project_suggestions = self._generate_project_suggestions(
            resume_sections, 
            missing_keywords, 
            category_scores
        )
        if project_suggestions:
            suggestions['recommended'].extend(project_suggestions)
        
        # Formatting suggestions
        suggestions['formatting'] = self._generate_formatting_tips(resume_sections)
        
        # Generate summary
        suggestions['summary'] = self._generate_summary(overall_score, missing_keywords, suggestions)
        
        return suggestions
    
    def _generate_formatting_tips(self, resume_sections: Dict) -> List[Dict]:
        """Generate ATS-friendly formatting tips"""
        tips = []
        
        # Check for essential sections
        essential_sections = ['experience', 'education', 'skills']
        for section in essential_sections:
            if not resume_sections.get(section) or len(resume_sections.get(section, '')) < 20:
                tips.append({
                    'title': f'Add {section.title()} Section',
                    'description': f'Your resume appears to be missing a clear {section} section.',
                    'action': f'Create a dedicated {section.title()} section with clear headers.'
                })
        
        # General formatting tips
        tips.extend([
            {
                'title': 'Use Standard Section Headers',
                'description': 'ATS systems look for standard section names.',
                'action': 'Use headers like "Work Experience", "Education", "Skills", "Certifications".'
            },
            {
                'title': 'Avoid Graphics and Tables',
                'description': 'Complex formatting can confuse ATS parsers.',
                'action': 'Use simple bullet points and clear text formatting.'
            },
            {
                'title': 'Use Standard Fonts',
                'description': 'Stick to ATS-friendly fonts.',
                'action': 'Use Arial, Calibri, or Times New Roman in 10-12pt size.'
            },
            {
                'title': 'Include Contact Information',
                'description': 'Make it easy for recruiters to reach you.',
                'action': 'Put phone, email, and LinkedIn at the top of your resume.'
            }
        ])
        
        return tips
    
    def _generate_project_suggestions(self, resume_sections: Dict, missing_keywords: Dict, category_scores: Dict) -> List[Dict]:
        """Generate project-related suggestions"""
        suggestions = []
        
        # Check if resume has a projects section
        projects_section = resume_sections.get('other', '')  # Projects often in 'other' section
        has_projects = 'project' in projects_section.lower()
        
        # Get missing technical skills for project suggestions
        tech_missing = missing_keywords.get('technical_skills', [])
        
        # If no projects section or weak skills match, suggest adding projects
        if not has_projects or category_scores.get('skills_match', 0) < 70:
            if tech_missing:
                # Categorize skills for project suggestions
                project_ideas = self._suggest_projects_by_skills(tech_missing)
                
                if project_ideas:
                    suggestions.append({
                        'title': 'Add Relevant Projects',
                        'description': f'Your resume would benefit from projects showcasing: {", ".join(tech_missing[:3])}',
                        'action': f'Consider adding projects like: {project_ideas}',
                        'section': 'projects',
                        'keywords': tech_missing
                    })
            else:
                suggestions.append({
                    'title': 'Strengthen Projects Section',
                    'description': 'Projects demonstrate practical application of skills.',
                    'action': 'Add 2-3 projects that align with the job requirements, highlighting technologies used and outcomes achieved.',
                    'section': 'projects'
                })
        
        # If projects exist but skills match is low, suggest improving them
        elif has_projects and category_scores.get('skills_match', 0) < 60:
            suggestions.append({
                'title': 'Enhance Project Descriptions',
                'description': 'Your projects don\'t highlight the required technical skills.',
                'action': f'Update project descriptions to emphasize: {", ".join(tech_missing[:5])}',
                'section': 'projects',
                'keywords': tech_missing
            })
        
        return suggestions
    
    def _suggest_projects_by_skills(self, missing_skills: List[str]) -> str:
        """Suggest specific project types based on missing skills"""
        skills_lower = [skill.lower() for skill in missing_skills]
        
        # Project suggestions based on skill categories
        project_templates = {
            'web': ['react', 'angular', 'vue', 'javascript', 'node.js', 'express', 'django', 'flask'],
            'data': ['python', 'machine learning', 'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch'],
            'mobile': ['android', 'ios', 'react native', 'flutter', 'swift', 'kotlin'],
            'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd'],
            'database': ['sql', 'mongodb', 'postgresql', 'mysql', 'redis']
        }
        
        suggestions = []
        
        # Check which categories match
        if any(skill in skills_lower for skill in project_templates['web']):
            suggestions.append('a full-stack web application')
        
        if any(skill in skills_lower for skill in project_templates['data']):
            suggestions.append('a data analysis or ML project')
        
        if any(skill in skills_lower for skill in project_templates['mobile']):
            suggestions.append('a mobile app')
        
        if any(skill in skills_lower for skill in project_templates['cloud']):
            suggestions.append('a cloud-deployed application')
        
        if any(skill in skills_lower for skill in project_templates['database']):
            suggestions.append('a database-driven application')
        
        if suggestions:
            return ', '.join(suggestions[:2])
        
        return 'projects demonstrating the required technologies'
    
    
    def _generate_summary(self, score: float, missing_keywords: Dict, suggestions: Dict) -> Dict:
        """Generate executive summary of suggestions"""
        total_missing = sum(len(keywords) for keywords in missing_keywords.values())
        critical_count = len(suggestions['critical'])
        important_count = len(suggestions['important'])
        
        if score >= 80:
            message = "Your resume is well-optimized for ATS! Just a few minor tweaks recommended."
            priority = "low"
        elif score >= 60:
            message = "Your resume is good but has room for improvement. Focus on the important suggestions."
            priority = "medium"
        else:
            message = "Your resume needs significant optimization to pass ATS screening. Address critical issues first."
            priority = "high"
        
        return {
            'message': message,
            'priority': priority,
            'total_missing_keywords': total_missing,
            'critical_issues': critical_count,
            'important_issues': important_count,
            'top_actions': self._get_top_actions(suggestions)
        }
    
    def _get_top_actions(self, suggestions: Dict) -> List[str]:
        """Get top 3 priority actions"""
        actions = []
        
        # Get critical actions first
        for item in suggestions['critical'][:2]:
            actions.append(item['action'])
        
        # Then important
        for item in suggestions['important'][:2]:
            if len(actions) < 3:
                actions.append(item['action'])
        
        # Fill with recommended if needed
        for item in suggestions['recommended']:
            if len(actions) < 3:
                actions.append(item['action'])
        
        return actions[:3]
