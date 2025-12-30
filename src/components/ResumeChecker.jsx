import React, { useState, useRef } from 'react';
import './resumeCheckerStyles.css';

export default function ResumeChecker() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    };

    const handleFile = (file) => {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
        if (!validTypes.includes(file.type)) {
            showError('Invalid file type. Please upload a PDF or DOCX file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showError('File too large. Maximum size is 5MB.');
            return;
        }

        setSelectedFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const showError = (message) => {
        setError(message);
        setTimeout(() => setError(null), 5000);
    };

    const analyzeResume = async () => {
        if (!selectedFile || !jobDescription.trim()) {
            showError('Please upload a resume and enter a job description.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('resume', selectedFile);
        formData.append('job_description', jobDescription);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Analysis failed');
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            console.error('Analysis error:', err);
            showError(err.message || 'Failed to analyze resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            // Could add a toast notification here
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    };

    const isFormValid = selectedFile && jobDescription.trim().length > 50;

    return (
        <div className="resume-checker">
            {/* Input Section */}
            <div className="rc-input-section">
                <div className="card">
                    <h2>Upload Your Resume</h2>
                    {!selectedFile ? (
                        <div
                            className={`rc-upload-area ${dragOver ? 'drag-over' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className="rc-upload-text">Drag & drop your resume here</p>
                            <p className="rc-upload-subtext">or click to browse</p>
                            <p className="rc-upload-format">Supports PDF and DOCX (Max 5MB)</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".pdf,.docx,.doc"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </div>
                    ) : (
                        <div className="rc-file-info">
                            <div className="rc-file-icon">📄</div>
                            <div className="rc-file-details">
                                <p className="rc-file-name">{selectedFile.name}</p>
                                <p className="rc-file-size">{formatFileSize(selectedFile.size)}</p>
                            </div>
                            <button className="rc-remove-file" onClick={removeFile}>✕</button>
                        </div>
                    )}
                </div>

                <div className="card">
                    <h2>Job Description</h2>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description here...&#10;&#10;Include:&#10;• Required skills and qualifications&#10;• Experience requirements&#10;• Education requirements&#10;• Responsibilities"
                        rows="12"
                        className="rc-textarea"
                    />
                    <div className="rc-char-count">
                        <span>{jobDescription.length.toLocaleString()}</span> characters
                    </div>
                </div>

                <button
                    className="rc-analyze-btn"
                    onClick={analyzeResume}
                    disabled={!isFormValid || loading}
                >
                    <span>Analyze Resume</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            {/* Results Section */}
            {results && (
                <div className="rc-results-section">
                    <ScoreCard score={results.score} />
                    <CategoryBreakdown scores={results.score.category_scores} />
                    <MissingKeywords missing={results.keywords.missing} />
                    {results.llm_suggestions && !results.llm_suggestions.llm_unavailable && (
                        <LLMSuggestions llmData={results.llm_suggestions} copyToClipboard={copyToClipboard} />
                    )}
                    <Suggestions suggestions={results.suggestions} />
                </div>
            )}

            {/* Loading Overlay */}
            {loading && (
                <div className="rc-loading-overlay">
                    <div className="rc-loading-content">
                        <div className="rc-spinner"></div>
                        <p className="rc-loading-text">Analyzing your resume...</p>
                        <p className="rc-loading-subtext">This may take a few seconds</p>
                    </div>
                </div>
            )}

            {/* Error Toast */}
            {error && (
                <div className="rc-error-toast">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        <path d="M15 9l-6 6M9 9l6 6" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}

function ScoreCard({ score }) {
    const circumference = 251.2;
    const offset = circumference - (score.overall_score / 100) * circumference;

    let gradientColors = { start: '#f093fb', end: '#4facfe' };
    if (score.overall_score >= 80) {
        gradientColors = { start: '#11998e', end: '#38ef7d' };
    } else if (score.overall_score >= 60) {
        gradientColors = { start: '#f093fb', end: '#4facfe' };
    } else if (score.overall_score >= 40) {
        gradientColors = { start: '#f2994a', end: '#f2c94c' };
    } else {
        gradientColors = { start: '#eb3349', end: '#f45c43' };
    }

    return (
        <div className="card rc-score-card">
            <h2>ATS Score</h2>
            <div className="rc-score-container">
                <div className="rc-score-gauge">
                    <svg className="rc-gauge-svg" viewBox="0 0 200 120">
                        <path className="rc-gauge-bg" d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#2d3748" strokeWidth="20" strokeLinecap="round" />
                        <path className="rc-gauge-fill" d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={`url(#scoreGradient)`} strokeWidth="20" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={offset} />
                        <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={gradientColors.start} />
                                <stop offset="100%" stopColor={gradientColors.end} />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="rc-score-value">
                        <span className="rc-score-number">{score.overall_score}</span>
                        <span className="rc-score-label">{score.rating}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CategoryBreakdown({ scores }) {
    const categories = [
        { key: 'skills_match', label: 'Skills Match' },
        { key: 'experience_match', label: 'Experience Match' },
        { key: 'education_match', label: 'Education Match' },
        { key: 'keyword_density', label: 'Keyword Density' }
    ];

    return (
        <div className="card">
            <h2>Category Breakdown</h2>
            <div className="rc-category-scores">
                {categories.map((category) => (
                    <div key={category.key} className="rc-category-item">
                        <div className="rc-category-header">
                            <span className="rc-category-name">{category.label}</span>
                            <span className="rc-category-value">{scores[category.key]}%</span>
                        </div>
                        <div className="rc-category-bar">
                            <div className="rc-category-fill" style={{ width: `${scores[category.key]}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function MissingKeywords({ missing }) {
    const categories = [
        { key: 'technical_skills', label: 'Technical Skills', icon: '💻', priority: 'high' },
        { key: 'soft_skills', label: 'Soft Skills', icon: '🤝', priority: 'medium' },
        { key: 'certifications', label: 'Certifications', icon: '🎓', priority: 'high' },
        { key: 'education', label: 'Education', icon: '📚', priority: 'medium' }
    ];

    const hasKeywords = categories.some(cat => missing[cat.key]?.length > 0);

    return (
        <div className="card">
            <h2>Missing Keywords</h2>
            <div className="rc-keywords-container">
                {hasKeywords ? (
                    categories.map(category => {
                        const keywords = missing[category.key];
                        if (!keywords || keywords.length === 0) return null;

                        return (
                            <div key={category.key} className="rc-keyword-category">
                                <h3>
                                    <span>{category.icon}</span>
                                    {category.label}
                                    <span className="rc-keyword-badge">{keywords.length}</span>
                                </h3>
                                <div className="rc-keyword-list">
                                    {keywords.slice(0, 10).map((kw, i) => (
                                        <span key={i} className={`rc-keyword-tag priority-${category.priority}`}>{kw}</span>
                                    ))}
                                    {keywords.length > 10 && (
                                        <span className="rc-keyword-tag">+{keywords.length - 10} more</span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>Great! Your resume includes all key terms from the job description.</p>
                )}
            </div>
        </div>
    );
}

function LLMSuggestions({ llmData, copyToClipboard }) {
    return (
        <div className="card">
            <h2>✨ AI-Generated Suggestions</h2>
            <p className="rc-section-description">Copy and customize these AI-generated suggestions for your resume</p>
            <div className="rc-llm-suggestions">
                {llmData.skills_to_add && llmData.skills_to_add.length > 0 && (
                    <LLMSection
                        title="🎯 Exact Skills to Add to Your Resume"
                        description="Add these specific skills to your Skills section or work experience"
                        items={llmData.skills_to_add}
                        copyToClipboard={copyToClipboard}
                    />
                )}
                {llmData.professional_summary && (
                    <LLMSection
                        title="📝 Job-Tailored Professional Summary"
                        description="Use this customized summary at the top of your resume"
                        items={[llmData.professional_summary]}
                        copyToClipboard={copyToClipboard}
                    />
                )}
                {llmData.experience_bullets && llmData.experience_bullets.length > 0 && (
                    <LLMSection
                        title="💼 Experience Section Bullets"
                        description="Add these achievement-oriented bullet points to your experience section"
                        items={llmData.experience_bullets}
                        copyToClipboard={copyToClipboard}
                    />
                )}
                {llmData.project_ideas && llmData.project_ideas.length > 0 && (
                    <LLMSection
                        title="🚀 Project Ideas to Add"
                        description="Build these projects to demonstrate the required skills and strengthen your resume"
                        items={llmData.project_ideas}
                        copyToClipboard={copyToClipboard}
                    />
                )}
            </div>
        </div>
    );
}

function LLMSection({ title, description, items, copyToClipboard }) {
    return (
        <div className="rc-llm-section">
            <div className="rc-llm-section-header">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
            {items.map((item, index) => (
                <div key={index} className="rc-llm-suggestion-card">
                    <div className="rc-llm-suggestion-text">{item}</div>
                    <button className="rc-copy-btn" onClick={() => copyToClipboard(item)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2"></path>
                        </svg>
                        Copy
                    </button>
                </div>
            ))}
        </div>
    );
}

function Suggestions({ suggestions }) {
    const allSuggestions = [
        ...(suggestions.critical || []).map(s => ({ ...s, type: 'critical', icon: '🔴' })),
        ...(suggestions.important || []).map(s => ({ ...s, type: 'important', icon: '🟡' })),
        ...(suggestions.recommended || []).slice(0, 5).map(s => ({ ...s, type: 'recommended', icon: '🔵' }))
    ];

    return (
        <div className="card">
            <h2>Optimization Suggestions</h2>
            <div className="rc-suggestions-summary">
                <h3>📊 Analysis Summary</h3>
                <p>{suggestions.summary.message}</p>
                <p style={{ marginTop: '0.5rem' }}>
                    <strong>Missing Keywords:</strong> {suggestions.summary.total_missing_keywords} |
                    <strong> Critical Issues:</strong> {suggestions.summary.critical_issues} |
                    <strong> Important Issues:</strong> {suggestions.summary.important_issues}
                </p>
            </div>
            <div className="rc-suggestions-list">
                {allSuggestions.map((suggestion, index) => (
                    <div key={index} className="rc-suggestion-item">
                        <div className="rc-suggestion-header">
                            <div className={`rc-suggestion-icon ${suggestion.type}`}>
                                {suggestion.icon}
                            </div>
                            <div className="rc-suggestion-content">
                                <div className="rc-suggestion-title">{suggestion.title}</div>
                                <div className="rc-suggestion-description">{suggestion.description}</div>
                                <div className="rc-suggestion-action">
                                    <strong>Action:</strong> {suggestion.action}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
