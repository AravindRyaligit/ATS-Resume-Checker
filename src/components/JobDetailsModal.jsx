import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Download, Trash2, MapPin, User, Calendar, Briefcase, Link, AlertTriangle, Globe, Edit2, Check, X } from 'lucide-react';
import { downloadFile } from '../lib/storage';

const STATUS_COLORS = {
    'Applied': 'bg-gray',
    'Pending Response': 'bg-blue',
    'Interview Scheduled': 'bg-yellow',
    'Rejected': 'bg-red',
    'Accepted': 'bg-green'
};

const STATUS_ORDER = ['Applied', 'Pending Response', 'Interview Scheduled', 'Rejected', 'Accepted'];

export default function JobDetailsModal({ job, isOpen, onClose, onDelete, onEdit, onUpdate }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditingRemarks, setIsEditingRemarks] = useState(false);
    const [remarksValue, setRemarksValue] = useState('');
    const [isRemarksExpanded, setIsRemarksExpanded] = useState(false);
    const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);

    // New state for interview editing
    const [isEditingInterview, setIsEditingInterview] = useState(false);
    const [interviewDateValue, setInterviewDateValue] = useState('');
    const [interviewTimeValue, setInterviewTimeValue] = useState('');

    useEffect(() => {
        if (isOpen && job) {
            setIsDeleting(false);
            setIsEditingRemarks(false);
            setIsRemarksExpanded(false);
            setIsRemarksModalOpen(false);
            setIsEditingInterview(false);
            setRemarksValue(job.remarks || '');
            setInterviewDateValue(job.interviewDate || '');
            setInterviewTimeValue(job.interviewTime || '');
        }
    }, [isOpen, job]);

    const handleSaveRemarks = () => {
        onUpdate({
            ...job,
            remarks: remarksValue
        });
        setIsEditingRemarks(false);
    };

    const handleCancelRemarks = () => {
        setRemarksValue(job.remarks || '');
        setIsEditingRemarks(false);
    };

    const handleSaveInterview = () => {
        onUpdate({
            ...job,
            interviewDate: interviewDateValue,
            interviewTime: interviewTimeValue
        });
        setIsEditingInterview(false);
    };

    const handleCancelInterview = () => {
        setInterviewDateValue(job.interviewDate || '');
        setInterviewTimeValue(job.interviewTime || '');
        setIsEditingInterview(false);
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        onUpdate({
            ...job,
            status: newStatus
        });
    };

    if (!job) return null;

    const currentStatusIndex = STATUS_ORDER.indexOf(job.status);
    const availableStatuses = currentStatusIndex === -1
        ? STATUS_ORDER
        : STATUS_ORDER.slice(currentStatusIndex);

    const statusClass = STATUS_COLORS[job.status] || 'bg-gray';

    const handleDeleteClick = () => {
        setIsDeleting(true);
    };

    const confirmDelete = () => {
        onDelete(job.id);
        onClose();
    };

    const cancelDelete = () => {
        setIsDeleting(false);
    };

    if (isDeleting) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Delete Application?">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        padding: '1rem',
                        borderRadius: '50%',
                        marginBottom: '1rem',
                        color: 'var(--danger)'
                    }}>
                        <AlertTriangle size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Are you sure?</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        This will permanently delete the application for <strong>{job.position}</strong> at <strong>{job.company}</strong>. This action cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                        <button className="btn" style={{ flex: 1, backgroundColor: 'var(--bg-input)' }} onClick={cancelDelete}>
                            No, Keep it
                        </button>
                        <button className="btn btn-danger" style={{ flex: 1 }} onClick={confirmDelete}>
                            Yes, Delete
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }

    const DetailRow = ({ icon: Icon, label, value }) => (
        <div style={{ display: 'flex', marginBottom: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '2rem', color: 'var(--text-secondary)' }}><Icon size={18} /></div>
            <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.1rem' }}>{label}</div>
                <div style={{ fontSize: '1rem', width: '100%' }}>{value || '-'}</div>
            </div>
        </div>
    );

    const REMARKS_THRESHOLD = 150;
    const shouldTruncate = job.remarks && job.remarks.length > REMARKS_THRESHOLD;
    const displayedRemarks = !isRemarksExpanded && shouldTruncate
        ? job.remarks.slice(0, REMARKS_THRESHOLD) + '...'
        : job.remarks;

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Job Details">
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{job.position}</h3>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>{job.company}</p>
                    </div>
                    <select
                        value={job.status}
                        onChange={handleStatusChange}
                        className={`badge ${statusClass}`}
                        style={{
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            outline: 'none',
                            paddingRight: '0.5rem',
                            maxWidth: '200px'
                        }}
                    >
                        {availableStatuses.map(status => (
                            <option key={status} value={status} style={{ color: 'black' }}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <DetailRow icon={MapPin} label="Location" value={job.location} />
                    <DetailRow icon={Globe} label="Country" value={job.country} />
                    <DetailRow icon={User} label="HR Contact" value={job.hrContact} />
                    <DetailRow icon={Link} label="Method" value={job.method} />
                    <DetailRow icon={Calendar} label="Applied On" value={new Date(job.createdAt).toLocaleDateString()} />
                    {job.status === 'Interview Scheduled' && (
                        <DetailRow
                            icon={Calendar}
                            label="Interview Date"
                            value={
                                !isEditingInterview ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div>
                                            <div>{new Date(job.interviewDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                            {job.interviewTime && <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>at {job.interviewTime}</div>}
                                        </div>
                                        <button
                                            onClick={() => setIsEditingInterview(true)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--text-secondary)',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}>
                                            <Edit2 size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <input
                                            type="date"
                                            className="input"
                                            value={interviewDateValue}
                                            onChange={(e) => setInterviewDateValue(e.target.value)}
                                            style={{ padding: '0.3rem', fontSize: '0.9rem' }}
                                        />
                                        <input
                                            type="time"
                                            className="input"
                                            value={interviewTimeValue}
                                            onChange={(e) => setInterviewTimeValue(e.target.value)}
                                            style={{ padding: '0.3rem', fontSize: '0.9rem' }}
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={handleSaveInterview}
                                                style={{
                                                    background: 'var(--success)',
                                                    border: 'none',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '0.8rem'
                                                }}>
                                                <Check size={14} /> Save
                                            </button>
                                            <button
                                                onClick={handleCancelInterview}
                                                style={{
                                                    background: 'var(--bg-input)',
                                                    border: 'none',
                                                    color: 'var(--text-primary)',
                                                    cursor: 'pointer',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '0.8rem'
                                                }}>
                                                <X size={14} /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                )
                            }
                        />
                    )}
                    {job.jobUrl && (
                        <div style={{ display: 'flex', marginBottom: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '2rem', color: 'var(--text-secondary)' }}><Link size={18} /></div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.1rem' }}>Job Info</div>
                                <a href={job.jobUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
                                    Open Job Post
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label className="label" style={{ marginBottom: 0 }}>Remarks</label>
                        {!isEditingRemarks ? (
                            <button
                                onClick={() => setIsEditingRemarks(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.8rem'
                                }}>
                                <Edit2 size={14} /> Edit
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={handleSaveRemarks}
                                    style={{
                                        background: 'var(--success)',
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '0.8rem'
                                    }}>
                                    <Check size={14} /> Save
                                </button>
                                <button
                                    onClick={handleCancelRemarks}
                                    style={{
                                        background: 'var(--bg-input)',
                                        border: 'none',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '0.8rem'
                                    }}>
                                    <X size={14} /> Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {isEditingRemarks ? (
                        <textarea
                            className="input"
                            value={remarksValue}
                            onChange={(e) => setRemarksValue(e.target.value)}
                            placeholder="Add remarks..."
                            style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                        />
                    ) : (
                        <div>
                            <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: shouldTruncate ? '0.25rem' : '0' }}>
                                {displayedRemarks || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No remarks added.</span>}
                            </p>
                            {shouldTruncate && (
                                <button
                                    onClick={() => setIsRemarksModalOpen(true)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--accent-primary)',
                                        cursor: 'pointer',
                                        padding: '0',
                                        fontSize: '0.85rem',
                                        fontWeight: 500
                                    }}
                                >
                                    Expand
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                    <label className="label">Attachments</label>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {job.cvFile ? (
                            <button className="btn" style={{ backgroundColor: 'white', color: 'black', gap: '0.5rem' }} onClick={() => downloadFile(job.cvFile)}>
                                <Download size={16} />
                                Download CV
                            </button>
                        ) : <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No CV attached</span>}

                        {job.coverLetterFile ? (
                            <button className="btn" style={{ backgroundColor: 'white', color: 'black', gap: '0.5rem' }} onClick={() => downloadFile(job.coverLetterFile)}>
                                <Download size={16} />
                                Download Cover Letter
                            </button>
                        ) : null}
                    </div>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button className="btn" style={{ backgroundColor: 'white', color: 'black' }} onClick={() => onEdit(job)}>
                        Edit Application
                    </button>
                    <button className="btn btn-danger" onClick={handleDeleteClick} style={{ gap: '0.5rem' }}>
                        <Trash2 size={16} />
                        Delete Application
                    </button>
                </div>
            </Modal>

            {/* Remarks Modal Popup */}
            {isRemarksModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    backdropFilter: 'blur(5px)'
                }} onClick={(e) => { e.stopPropagation(); setIsRemarksModalOpen(false); }}>
                    <div style={{
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: '16px',
                        width: '90%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        animation: 'fadeIn 0.2s ease-out'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Remarks</h3>
                            <button
                                onClick={() => setIsRemarksModalOpen(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                            <p style={{
                                fontSize: '1.1rem',
                                lineHeight: '1.7',
                                whiteSpace: 'pre-wrap',
                                color: 'var(--text-primary)',
                                margin: 0
                            }}>
                                {job.remarks}
                            </p>
                        </div>
                        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn" onClick={() => setIsRemarksModalOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
