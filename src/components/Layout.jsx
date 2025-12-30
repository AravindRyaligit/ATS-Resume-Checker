import React from 'react';
import { Briefcase, Plus, FileCheck } from 'lucide-react';

export default function Layout({ children, onAddJob, activeTab, onTabChange }) {
    return (
        <div className="layout">
            <header className="header" style={{
                backgroundColor: 'var(--bg-card)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                padding: '1rem 0',
                marginBottom: '2rem'
            }}>
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex'
                        }}>
                            <Briefcase size={24} color="white" />
                        </div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
                            JobTracker Pro
                        </h1>
                    </div>

                    {/* Tab Navigation */}
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        backgroundColor: 'var(--bg-app)',
                        padding: '0.25rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <button
                            onClick={() => onTabChange('tracker')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                background: activeTab === 'tracker' ? 'var(--accent-primary)' : 'transparent',
                                color: activeTab === 'tracker' ? 'white' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontWeight: activeTab === 'tracker' ? 600 : 400,
                                fontSize: '0.9rem'
                            }}
                        >
                            <Briefcase size={18} />
                            <span>Job Tracker</span>
                        </button>
                        <button
                            onClick={() => onTabChange('resume')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                background: activeTab === 'resume' ? 'var(--accent-primary)' : 'transparent',
                                color: activeTab === 'resume' ? 'white' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontWeight: activeTab === 'resume' ? 600 : 400,
                                fontSize: '0.9rem'
                            }}
                        >
                            <FileCheck size={18} />
                            <span>Resume Checker</span>
                        </button>
                    </div>

                    {activeTab === 'tracker' && (
                        <button className="btn btn-primary" onClick={onAddJob}>
                            <Plus size={18} />
                            <span>Add Job</span>
                        </button>
                    )}
                </div>
            </header>

            <main className="main container">
                {children}
            </main>
        </div>
    );
}
