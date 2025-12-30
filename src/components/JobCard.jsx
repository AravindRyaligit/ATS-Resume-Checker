import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

const STATUS_COLORS = {
    'Applied': 'bg-gray',
    'Pending Response': 'bg-blue',
    'Interview Scheduled': 'bg-yellow',
    'Rejected': 'bg-red',
    'Accepted': 'bg-green'
};

const STATUS_ORDER = ['Applied', 'Pending Response', 'Interview Scheduled', 'Rejected', 'Accepted'];

export default function JobCard({ job, onClick: onJobClick, onUpdate, onDelete, isSelected, onToggleSelect }) {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const statusClass = STATUS_COLORS[job.status] || 'bg-gray';

    const handleStatusChange = (e) => {
        e.stopPropagation(); // Prevent opening details
        const newStatus = e.target.value;
        onUpdate({
            ...job,
            status: newStatus
        });
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (isConfirmingDelete) {
            onDelete(job.id);
        } else {
            setIsConfirmingDelete(true);
        }
    };

    const currentStatusIndex = STATUS_ORDER.indexOf(job.status);
    const availableStatuses = currentStatusIndex === -1
        ? STATUS_ORDER
        : STATUS_ORDER.slice(currentStatusIndex);

    return (
        <div
            className="card"
            onClick={() => onJobClick(job)}
            style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem', // Added gap for spacing elements
                padding: '1rem 1.5rem',
                marginBottom: '0.75rem',
                border: '1px solid rgba(255,255,255,0.05)',
                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-card)',
                transition: 'background-color 0.2s',
                borderLeft: isSelected ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)'
            }}
            onMouseEnter={e => {
                if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
            }}
            onMouseLeave={e => {
                if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-card)';
            }}
        >
            <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center' }}>
                <input
                    type="checkbox"
                    checked={!!isSelected}
                    onChange={onToggleSelect}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
            </div>

            <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                    {job.position}
                </h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {job.company}
                </div>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select
                    value={job.status}
                    onChange={handleStatusChange}
                    onClick={(e) => e.stopPropagation()}
                    className={`badge ${statusClass}`}
                    style={{
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        outline: 'none',
                        paddingRight: '0.5rem' // Adjust for dropdown arrow if needed
                    }}
                >
                    {availableStatuses.map(status => (
                        <option key={status} value={status} style={{ color: 'black' }}>
                            {status}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleDeleteClick}
                    onBlur={() => setIsConfirmingDelete(false)}
                    onMouseLeave={() => setIsConfirmingDelete(false)}
                    className="btn-icon"
                    style={{
                        color: isConfirmingDelete ? '#ef4444' : 'var(--text-secondary)',
                        padding: isConfirmingDelete ? '0.25rem 0.5rem' : '0.25rem',
                        display: 'flex', // ensure icon is centered
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isConfirmingDelete ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'all 0.2s ease',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        minWidth: isConfirmingDelete ? '60px' : 'auto'
                    }}
                    title={isConfirmingDelete ? "Click again to delete" : "Delete Application"}
                >
                    {isConfirmingDelete ? "DELETE" : <Trash2 size={16} />}
                </button>
            </div>
        </div>
    );
}
