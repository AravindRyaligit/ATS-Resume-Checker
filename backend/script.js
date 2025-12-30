// API Configuration
const API_URL = 'http://localhost:5000';

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const resumeFile = document.getElementById('resumeFile');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFileBtn = document.getElementById('removeFile');
const jobDescription = document.getElementById('jobDescription');
const charCount = document.getElementById('charCount');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsSection = document.getElementById('resultsSection');
const loadingOverlay = document.getElementById('loadingOverlay');
const errorToast = document.getElementById('errorToast');
const errorMessage = document.getElementById('errorMessage');
const exportBtn = document.getElementById('exportBtn');

// State
let selectedFile = null;
let analysisResults = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    // Upload area events
    uploadArea.addEventListener('click', () => resumeFile.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // File input
    resumeFile.addEventListener('change', handleFileSelect);
    removeFileBtn.addEventListener('click', removeFile);

    // Job description
    jobDescription.addEventListener('input', updateCharCount);
    jobDescription.addEventListener('input', checkFormValidity);

    // Analyze button
    analyzeBtn.addEventListener('click', analyzeResume);

    // Export button
    exportBtn.addEventListener('click', exportResults);
}

// File Upload Handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFile(file) {
    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!validTypes.includes(file.type)) {
        showError('Invalid file type. Please upload a PDF or DOCX file.');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('File too large. Maximum size is 5MB.');
        return;
    }

    selectedFile = file;
    displayFileInfo(file);
    checkFormValidity();
}

function displayFileInfo(file) {
    uploadArea.style.display = 'none';
    fileInfo.style.display = 'flex';
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
}

function removeFile(e) {
    e.stopPropagation();
    selectedFile = null;
    resumeFile.value = '';
    uploadArea.style.display = 'block';
    fileInfo.style.display = 'none';
    checkFormValidity();
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Job Description Handlers
function updateCharCount() {
    const count = jobDescription.value.length;
    charCount.textContent = count.toLocaleString();
}

function checkFormValidity() {
    const isValid = selectedFile !== null && jobDescription.value.trim().length > 50;
    analyzeBtn.disabled = !isValid;
}

// Analysis
async function analyzeResume() {
    if (!selectedFile || !jobDescription.value.trim()) {
        showError('Please upload a resume and enter a job description.');
        return;
    }

    // Show loading
    loadingOverlay.style.display = 'flex';

    // Prepare form data
    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('job_description', jobDescription.value);

    try {
        const response = await fetch(`${API_URL}/api/analyze`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Analysis failed');
        }

        const data = await response.json();
        analysisResults = data;
        displayResults(data);

    } catch (error) {
        console.error('Analysis error:', error);
        showError(error.message || 'Failed to analyze resume. Please try again.');
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

// Display Results
function displayResults(data) {
    // Show results section
    resultsSection.style.display = 'flex';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Display score
    displayScore(data.score);

    // Display category breakdown
    displayCategoryScores(data.score.category_scores);

    // Display missing keywords
    displayMissingKeywords(data.keywords.missing);

    // Display LLM suggestions
    if (data.llm_suggestions && !data.llm_suggestions.llm_unavailable) {
        displayLLMSuggestions(data.llm_suggestions);
    }

    // Display suggestions
    displaySuggestions(data.suggestions);
}

function displayScore(scoreData) {
    const scoreNumber = document.getElementById('scoreNumber');
    const scoreLabel = document.getElementById('scoreLabel');
    const gaugeFill = document.getElementById('gaugeFill');

    const score = scoreData.overall_score;
    const rating = scoreData.rating;

    // Animate score
    animateValue(scoreNumber, 0, score, 1500);
    scoreLabel.textContent = rating;

    // Animate gauge
    const circumference = 251.2;
    const offset = circumference - (score / 100) * circumference;

    setTimeout(() => {
        gaugeFill.style.strokeDashoffset = offset;
    }, 100);

    // Update gauge color based on score
    const gradient = document.getElementById('scoreGradient');
    if (score >= 80) {
        gradient.innerHTML = `
            <stop offset="0%" stop-color="#11998e"/>
            <stop offset="100%" stop-color="#38ef7d"/>
        `;
    } else if (score >= 60) {
        gradient.innerHTML = `
            <stop offset="0%" stop-color="#f093fb"/>
            <stop offset="100%" stop-color="#4facfe"/>
        `;
    } else if (score >= 40) {
        gradient.innerHTML = `
            <stop offset="0%" stop-color="#f2994a"/>
            <stop offset="100%" stop-color="#f2c94c"/>
        `;
    } else {
        gradient.innerHTML = `
            <stop offset="0%" stop-color="#eb3349"/>
            <stop offset="100%" stop-color="#f45c43"/>
        `;
    }
}

function displayCategoryScores(scores) {
    const container = document.getElementById('categoryScores');
    container.innerHTML = '';

    const categories = [
        { key: 'skills_match', label: 'Skills Match' },
        { key: 'experience_match', label: 'Experience Match' },
        { key: 'education_match', label: 'Education Match' },
        { key: 'keyword_density', label: 'Keyword Density' }
    ];

    categories.forEach((category, index) => {
        const score = scores[category.key];
        const item = document.createElement('div');
        item.className = 'category-item';
        item.style.animationDelay = `${index * 0.1}s`;

        item.innerHTML = `
            <div class="category-header">
                <span class="category-name">${category.label}</span>
                <span class="category-value">${score}%</span>
            </div>
            <div class="category-bar">
                <div class="category-fill" style="width: 0%"></div>
            </div>
        `;

        container.appendChild(item);

        // Animate bar
        setTimeout(() => {
            const fill = item.querySelector('.category-fill');
            fill.style.width = `${score}%`;
        }, 100 + (index * 100));
    });
}

function displayMissingKeywords(missing) {
    const container = document.getElementById('missingKeywords');
    container.innerHTML = '';

    const categories = [
        { key: 'technical_skills', label: 'Technical Skills', icon: '💻', priority: 'high' },
        { key: 'soft_skills', label: 'Soft Skills', icon: '🤝', priority: 'medium' },
        { key: 'certifications', label: 'Certifications', icon: '🎓', priority: 'high' },
        { key: 'education', label: 'Education', icon: '📚', priority: 'medium' }
    ];

    let hasKeywords = false;

    categories.forEach(category => {
        const keywords = missing[category.key];
        if (keywords && keywords.length > 0) {
            hasKeywords = true;
            const section = document.createElement('div');
            section.className = 'keyword-category';

            section.innerHTML = `
                <h3>
                    <span>${category.icon}</span>
                    ${category.label}
                    <span class="keyword-badge">${keywords.length}</span>
                </h3>
                <div class="keyword-list">
                    ${keywords.slice(0, 10).map(kw => `
                        <span class="keyword-tag priority-${category.priority}">${kw}</span>
                    `).join('')}
                    ${keywords.length > 10 ? `<span class="keyword-tag">+${keywords.length - 10} more</span>` : ''}
                </div>
            `;

            container.appendChild(section);
        }
    });

    if (!hasKeywords) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Great! Your resume includes all key terms from the job description.</p>';
    }
}

function displaySuggestions(suggestions) {
    const summaryContainer = document.getElementById('suggestionsSummary');
    const listContainer = document.getElementById('suggestionsList');

    // Display summary
    const summary = suggestions.summary;
    summaryContainer.innerHTML = `
        <h3>📊 Analysis Summary</h3>
        <p>${summary.message}</p>
        <p style="margin-top: 0.5rem;">
            <strong>Missing Keywords:</strong> ${summary.total_missing_keywords} | 
            <strong>Critical Issues:</strong> ${summary.critical_issues} | 
            <strong>Important Issues:</strong> ${summary.important_issues}
        </p>
    `;

    // Display suggestions
    listContainer.innerHTML = '';

    const allSuggestions = [
        ...suggestions.critical.map(s => ({ ...s, type: 'critical', icon: '🔴' })),
        ...suggestions.important.map(s => ({ ...s, type: 'important', icon: '🟡' })),
        ...suggestions.recommended.slice(0, 5).map(s => ({ ...s, type: 'recommended', icon: '🔵' }))
    ];

    allSuggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.style.animationDelay = `${index * 0.1}s`;

        item.innerHTML = `
            <div class="suggestion-header">
                <div class="suggestion-icon ${suggestion.type}">
                    ${suggestion.icon}
                </div>
                <div class="suggestion-content">
                    <div class="suggestion-title">${suggestion.title}</div>
                    <div class="suggestion-description">${suggestion.description}</div>
                    <div class="suggestion-action">
                        <strong>Action:</strong> ${suggestion.action}
                    </div>
                </div>
            </div>
        `;

        listContainer.appendChild(item);
    });
}

// Display LLM Suggestions
function displayLLMSuggestions(llmData) {
    const container = document.getElementById('llmSuggestions');
    const card = document.getElementById('llmSuggestionsCard');

    if (!llmData || llmData.llm_unavailable) {
        card.style.display = 'none';
        return;
    }

    card.style.display = 'block';
    container.innerHTML = '';

    // Missing Keywords List (NEW - PRIORITY 1)
    if (llmData.missing_keywords_list) {
        const section = createKeywordsListSection(llmData.missing_keywords_list);
        if (section) container.appendChild(section);
    }

    // Skills to Add (NEW - PRIORITY 2)
    if (llmData.skills_to_add && llmData.skills_to_add.length > 0) {
        const section = createLLMSection(
            '🎯 Exact Skills to Add to Your Resume',
            'Add these specific skills to your Skills section or work experience',
            llmData.skills_to_add
        );
        container.appendChild(section);
    }

    // Professional Summary (NEW - PRIORITY 3)
    if (llmData.professional_summary && llmData.professional_summary.trim()) {
        const section = createLLMSection(
            '📝 Job-Tailored Professional Summary',
            'Use this customized summary at the top of your resume',
            [llmData.professional_summary]
        );
        container.appendChild(section);
    }

    // Experience Bullets
    if (llmData.experience_bullets && llmData.experience_bullets.length > 0) {
        const section = createLLMSection(
            '💼 Experience Section Bullets',
            'Add these achievement-oriented bullet points to your experience section',
            llmData.experience_bullets
        );
        container.appendChild(section);
    }

    // Skills Integration
    if (llmData.skills_integration && llmData.skills_integration.length > 0) {
        const section = createLLMSection(
            '🔧 Skills Integration Sentences',
            'Use these sentences to showcase your skills professionally',
            llmData.skills_integration
        );
        container.appendChild(section);
    }

    // Summary Enhancement (legacy)
    if (llmData.summary_enhancement && llmData.summary_enhancement.trim() && !llmData.professional_summary) {
        const section = createLLMSection(
            '📄 Summary Enhancement',
            'Alternative professional summary option',
            [llmData.summary_enhancement]
        );
        container.appendChild(section);
    }

    // Section Specific
    if (llmData.section_specific) {
        Object.entries(llmData.section_specific).forEach(([key, suggestions]) => {
            if (suggestions && suggestions.length > 0) {
                const title = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                const section = createLLMSection(
                    `📌 ${title}`,
                    'Quick additions for your resume',
                    suggestions
                );
                container.appendChild(section);
            }
        });
    }

    // Show message if no suggestions
    if (container.children.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">AI suggestions are being generated...</p>';
    }
}

function createKeywordsListSection(keywordsList) {
    if (!keywordsList || Object.keys(keywordsList).length === 0) {
        return null;
    }

    const section = document.createElement('div');
    section.className = 'llm-section keywords-priority';

    const header = document.createElement('div');
    header.className = 'llm-section-header';
    header.innerHTML = `
        <h3 style="color: #f093fb;">🔑 Missing Keywords - Add These to Your Resume</h3>
        <p style="font-weight: 600;">These exact keywords are missing from your resume but required for the job</p>
    `;
    section.appendChild(header);

    Object.entries(keywordsList).forEach(([category, keywords]) => {
        if (keywords && keywords.length > 0) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'keyword-category-box';

            const categoryTitle = category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

            categoryDiv.innerHTML = `
                <h4 style="margin-bottom: 0.75rem; color: var(--text-primary); font-size: 1rem;">
                    ${categoryTitle} <span style="color: var(--text-secondary); font-size: 0.9rem;">(${keywords.length})</span>
                </h4>
                <div class="keyword-tags">
                    ${keywords.map(kw => `<span class="keyword-tag-highlight">${kw}</span>`).join('')}
                </div>
            `;

            section.appendChild(categoryDiv);
        }
    });

    return section;
}

function createLLMSection(title, description, items) {
    const section = document.createElement('div');
    section.className = 'llm-section';

    const header = document.createElement('div');
    header.className = 'llm-section-header';
    header.innerHTML = `
        <h3>${title}</h3>
        <p>${description}</p>
    `;
    section.appendChild(header);

    items.forEach((item, index) => {
        const suggestionCard = document.createElement('div');
        suggestionCard.className = 'llm-suggestion-card';
        suggestionCard.style.animationDelay = `${index * 0.1}s`;

        const escapedText = item.replace(/'/g, "\\'").replace(/"/g, '\\"');

        suggestionCard.innerHTML = `
            <div class="llm-suggestion-text">${item}</div>
            <button class="copy-btn" onclick="copyToClipboard(this, '${escapedText}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke-width="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2"></path>
                </svg>
                Copy
            </button>
        `;

        section.appendChild(suggestionCard);
    });

    return section;
}

// Copy to Clipboard
function copyToClipboard(button, text) {
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
            </svg>
            Copied!
        `;
        button.classList.add('copied');

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        showError('Failed to copy to clipboard');
    });
}

// Export Results
function exportResults() {
    if (!analysisResults) return;

    const exportData = {
        timestamp: new Date().toISOString(),
        score: analysisResults.score,
        keywords: analysisResults.keywords,
        suggestions: analysisResults.suggestions
    };

    // Create text report
    let report = '=== ATS RESUME ANALYSIS REPORT ===\n\n';
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    report += `OVERALL SCORE: ${analysisResults.score.overall_score}/100 (${analysisResults.score.rating})\n\n`;

    report += '--- CATEGORY BREAKDOWN ---\n';
    Object.entries(analysisResults.score.category_scores).forEach(([key, value]) => {
        report += `${key.replace('_', ' ').toUpperCase()}: ${value}%\n`;
    });

    report += '\n--- MISSING KEYWORDS ---\n';
    Object.entries(analysisResults.keywords.missing).forEach(([category, keywords]) => {
        if (keywords.length > 0) {
            report += `\n${category.toUpperCase()}:\n`;
            keywords.forEach(kw => report += `  • ${kw}\n`);
        }
    });

    report += '\n--- TOP SUGGESTIONS ---\n';
    analysisResults.suggestions.summary.top_actions.forEach((action, i) => {
        report += `${i + 1}. ${action}\n`;
    });

    // Download as text file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ats_analysis_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Utility Functions
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

function showError(message) {
    errorMessage.textContent = message;
    errorToast.style.display = 'flex';

    setTimeout(() => {
        errorToast.style.display = 'none';
    }, 5000);
}
