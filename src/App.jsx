import React, { useState, useEffect } from 'react';
import { Search, Trash2 } from 'lucide-react';
import Layout from './components/Layout';
import JobCard from './components/JobCard';
import AddJobModal from './components/AddJobModal';
import JobDetailsModal from './components/JobDetailsModal';
import CountryGroup from './components/CountryGroup';
import SkillsSection from './components/SkillsSection';
import ResumeChecker from './components/ResumeChecker';
import { initStorage, getJobs, saveJob, deleteJob } from './lib/storage';

function App() {
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (newest) or 'asc' (oldest)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJobIds, setSelectedJobIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('tracker'); // 'tracker' or 'resume'

  const [jobToEdit, setJobToEdit] = useState(null);

  // Load jobs on mount
  useEffect(() => {
    async function load() {
      await initStorage();
      const stored = await getJobs();
      // Sort by newest first
      setJobs(stored.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    }
    load();
  }, []);

  const refreshJobs = async () => {
    const stored = await getJobs();
    setJobs(stored.sort((a, b) => b.createdAt - a.createdAt));
  };

  const handleCreateJob = () => {
    setJobToEdit(null);
    setIsAddOpen(true);
  };

  const handleSaveJob = async (job) => {
    await saveJob(job);
    await refreshJobs();
    setIsAddOpen(false);
    setJobToEdit(null);
  };

  const handleDeleteJob = async (id) => {
    await deleteJob(id);
    setSelectedJob(null);
    await refreshJobs();
  };

  const handleEditJob = (job) => {
    setSelectedJob(null); // Close details
    setJobToEdit(job);
    setIsAddOpen(true);
  };

  const handleUpdateJob = async (updatedJob) => {
    await saveJob(updatedJob);
    await refreshJobs();
    setSelectedJob(updatedJob);
  };

  const handleToggleSelect = (id) => {
    const newSelected = new Set(selectedJobIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedJobIds(newSelected);
  };

  const filteredJobs = jobs.filter(j =>
    j.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.company.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    return sortOrder === 'desc'
      ? b.createdAt - a.createdAt
      : a.createdAt - b.createdAt;
  });

  const areAllSelected = filteredJobs.length > 0 && selectedJobIds.size === filteredJobs.length;

  const handleSelectAll = () => {
    if (areAllSelected) {
      setSelectedJobIds(new Set());
    } else {
      setSelectedJobIds(new Set(filteredJobs.map(job => job.id)));
    }
  };

  const handleSelectRejected = () => {
    const rejectedJobs = filteredJobs.filter(job => job.status === 'Rejected');
    setSelectedJobIds(new Set(rejectedJobs.map(job => job.id)));
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedJobIds.size} selected jobs?`)) {
      for (const id of Array.from(selectedJobIds)) {
        await deleteJob(id);
      }
      setSelectedJobIds(new Set());
      await refreshJobs();
    }
  };

  return (
    <Layout onAddJob={handleCreateJob} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'tracker' ? (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              Loading applications...
            </div>
          ) : jobs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              border: '2px dashed rgba(255,255,255,0.05)',
              borderRadius: 'var(--radius-md)'
            }}>
              <h2 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>No Applications Yet</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Start tracking your job hunt by adding your first application.
              </p>
              <button className="btn btn-primary" onClick={handleCreateJob}>
                Add First Job
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{
                  position: 'relative',
                  maxWidth: '600px'
                }}>
                  <Search
                    size={20}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)'
                    }}
                  />
                  <input
                    type="text"
                    className="input"
                    placeholder="Search by role or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      paddingLeft: '3rem',
                      height: '3.5rem',
                      fontSize: '1rem',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>My Applications</h2>
                  <span style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '0.2rem 0.8rem',
                    borderRadius: '99px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)'
                  }}>
                    Total: <strong style={{ color: 'var(--text-primary)' }}>{filteredJobs.length}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={areAllSelected}
                      onChange={handleSelectAll}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                    />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Select All</span>
                  </label>

                  <button
                    onClick={handleSelectRejected}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text-secondary)',
                      padding: '0.3rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                      e.target.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={e => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.target.style.color = 'var(--text-secondary)';
                    }}
                  >
                    Select Rejected
                  </button>

                  {selectedJobIds.size > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="btn btn-danger"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', gap: '0.5rem' }}
                    >
                      <Trash2 size={16} />
                      Delete ({selectedJobIds.size})
                    </button>
                  )}

                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="input"
                    style={{ width: 'auto', minWidth: '150px' }}
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {(() => {
                  if (filteredJobs.length === 0) {
                    return (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No applications found matching "{searchQuery}"
                      </div>
                    );
                  }

                  const grouped = filteredJobs.reduce((acc, job) => {
                    const country = job.country || 'Unspecified';
                    if (!acc[country]) acc[country] = [];
                    acc[country].push(job);
                    return acc;
                  }, {});

                  return Object.entries(grouped).sort().map(([country, countryJobs]) => (
                    <CountryGroup
                      key={country}
                      country={country}
                      jobs={countryJobs}
                      selectedJobIds={selectedJobIds}
                      onToggleSelect={handleToggleSelect}
                      onJobClick={(j) => setSelectedJob(j)}
                      onUpdate={handleUpdateJob}
                      onDelete={handleDeleteJob}
                    />
                  ));
                })()}
              </div>

              {/* My Interviews Section */}
              {
                (() => {
                  const interviews = jobs.filter(j =>
                    (j.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      j.company.toLowerCase().includes(searchQuery.toLowerCase())) &&
                    j.interviewDate
                  ).sort((a, b) => {
                    const dateA = new Date(a.interviewDate + 'T' + (a.interviewTime || '00:00'));
                    const dateB = new Date(b.interviewDate + 'T' + (b.interviewTime || '00:00'));
                    return dateA - dateB;
                  });


                  return (
                    <div style={{ marginTop: '3rem' }}>
                      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>My Interviews</h2>
                        <span style={{
                          backgroundColor: 'var(--bg-card)',
                          padding: '0.2rem 0.8rem',
                          borderRadius: '99px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          fontSize: '0.9rem',
                          color: 'var(--text-secondary)'
                        }}>
                          Upcoming: <strong style={{ color: 'var(--text-primary)' }}>{interviews.length}</strong>
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {interviews.map(job => (
                          <div
                            key={job.id}
                            onClick={() => setSelectedJob(job)}
                            style={{
                              backgroundColor: 'var(--bg-card)',
                              padding: '1.5rem',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s, background-color 0.2s'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                              <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{job.position}</h3>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{job.company}</div>
                              </div>
                              <div style={{
                                textAlign: 'center',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                color: '#60a5fa',
                                padding: '0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                minWidth: '60px'
                              }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1 }}>
                                  {new Date(job.interviewDate).getDate()}
                                </div>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                  {new Date(job.interviewDate).toLocaleString('default', { month: 'short' })}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span>⏰</span>
                                <span>{job.interviewTime || 'TBD'}</span>
                              </div>
                              {job.interviewRound && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <span>📌</span>
                                  <span>{job.interviewRound}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              }
            </>
          )}

          <SkillsSection />

          <AddJobModal
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            onSave={handleSaveJob}
            initialData={jobToEdit}
          />

          <JobDetailsModal
            job={selectedJob}
            isOpen={!!selectedJob}
            onClose={() => setSelectedJob(null)}
            onDelete={handleDeleteJob}
            onEdit={handleEditJob}
            onUpdate={handleUpdateJob}
          />
        </>
      ) : (
        <ResumeChecker />
      )}
    </Layout >
  );
}

export default App;

