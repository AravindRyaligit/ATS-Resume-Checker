import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import JobCard from './JobCard';

export default function CountryGroup({ country, jobs, onJobClick, onUpdate, onDelete, selectedJobIds, onToggleSelect }) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div style={{ marginBottom: '1rem' }}>
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    marginBottom: '0.5rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '1.5rem',
                    height: '1.5rem',
                    marginRight: '0.5rem',
                    color: 'var(--text-secondary)'
                }}>
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>

                <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    margin: 0
                }}>
                    {country} <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>({jobs.length})</span>
                </h3>
            </div>

            {isExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0', paddingLeft: '0.5rem' }}>
                    {jobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onClick={onJobClick}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            isSelected={selectedJobIds?.has(job.id)}
                            onToggleSelect={() => onToggleSelect(job.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
