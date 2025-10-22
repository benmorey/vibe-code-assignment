import React, { useState, useEffect } from 'react';

export interface Application {
  id: string;
  company: string;
  position: string;
  dateApplied: string;
  status: 'pending' | 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  jobUrl?: string;
  notes?: string;
  salary?: string;
  location?: string;
  hasReferral?: boolean;
  referralName?: string;
  referralContact?: string;
}

const ApplicationTracker: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPendingSidebar, setShowPendingSidebar] = useState(true);
  const [formData, setFormData] = useState<Omit<Application, 'id'>>({
    company: '',
    position: '',
    dateApplied: new Date().toISOString().split('T')[0],
    status: 'applied',
    jobUrl: '',
    notes: '',
    salary: '',
    location: '',
    hasReferral: false,
    referralName: '',
    referralContact: ''
  });

  // Load applications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('jobApplications');
    if (saved) {
      setApplications(JSON.parse(saved));
    }
  }, []);

  // Save applications to localStorage
  useEffect(() => {
    if (applications.length > 0) {
      localStorage.setItem('jobApplications', JSON.stringify(applications));
    }
  }, [applications]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setApplications(applications.map(app =>
        app.id === editingId ? { ...formData, id: editingId } : app
      ));
      setEditingId(null);
    } else {
      const newApp: Application = {
        ...formData,
        id: Date.now().toString()
      };
      setApplications([newApp, ...applications]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      dateApplied: new Date().toISOString().split('T')[0],
      status: 'applied',
      jobUrl: '',
      notes: '',
      salary: '',
      location: '',
      hasReferral: false,
      referralName: '',
      referralContact: ''
    });
    setShowForm(false);
  };

  const handleEdit = (app: Application) => {
    setFormData({
      company: app.company,
      position: app.position,
      dateApplied: app.dateApplied,
      status: app.status,
      jobUrl: app.jobUrl || '',
      notes: app.notes || '',
      salary: app.salary || '',
      location: app.location || '',
      hasReferral: app.hasReferral || false,
      referralName: app.referralName || '',
      referralContact: app.referralContact || ''
    });
    setEditingId(app.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      setApplications(applications.filter(app => app.id !== id));
    }
  };

  const approvePending = (id: string) => {
    setApplications(applications.map(app =>
      app.id === id ? { ...app, status: 'applied' as const } : app
    ));
  };

  const rejectPending = (id: string) => {
    setApplications(applications.filter(app => app.id !== id));
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending': return '#9333ea';
      case 'applied': return '#3b82f6';
      case 'interview': return '#f59e0b';
      case 'offer': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'withdrawn': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: Application['status']) => {
    switch (status) {
      case 'pending': return '⏳ Pending';
      case 'applied': return '📝 Applied';
      case 'interview': return '💼 Interview';
      case 'offer': return '🎉 Offer';
      case 'rejected': return '❌ Rejected';
      case 'withdrawn': return '🚫 Withdrawn';
      default: return status;
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    applied: applications.filter(a => a.status === 'applied').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer: applications.filter(a => a.status === 'offer').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  const pendingApplications = applications.filter(app => app.status === 'pending');

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      {/* Pending Sidebar - Always rendered for smooth transition */}
      {pendingApplications.length > 0 && (
        <div style={{
          width: showPendingSidebar ? '450px' : '60px',
          transition: 'width 0.3s ease',
          borderRight: showPendingSidebar ? '2px solid #e5e7eb' : 'none',
          paddingRight: showPendingSidebar ? '20px' : '0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {!showPendingSidebar ? (
            <div style={{ width: '60px', display: 'flex', alignItems: 'flex-start', paddingTop: '10px' }}>
              <button
                onClick={() => setShowPendingSidebar(true)}
                style={{
                  background: '#9333ea',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(147, 51, 234, 0.3)'
                }}
                title={`Show ${pendingApplications.length} pending applications`}
              >
                ▶
              </button>
            </div>
          ) : (
            <>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#9333ea', fontSize: '18px' }}>⏳ Pending ({pendingApplications.length})</h3>
            <button
              onClick={() => setShowPendingSidebar(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#6b7280'
              }}
            >
              ◀
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            {pendingApplications.map(app => (
              <div key={app.id} className="card" style={{ padding: '12px', background: '#faf5ff', border: '1px solid #e9d5ff' }}>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                    {app.position}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{app.company}</div>
                  {app.location && <div style={{ fontSize: '11px', color: '#9ca3af' }}>📍 {app.location}</div>}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => approvePending(app.id)}
                    style={{ flex: 1, padding: '6px 12px', fontSize: '12px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    ✓ Applied
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => rejectPending(app.id)}
                    style={{ flex: 1, padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    ✗ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          </>
          )}
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1 }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '10px', color: '#1f2937' }}>📊 Application Tracker</h2>
        <p style={{ color: '#6b7280' }}>Track your job applications and stay organized</p>
      </div>

      {/* Visual Dashboard */}
      {applications.length > 0 && (
        <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#374151' }}>Application Pipeline</h3>
          <div style={{ display: 'flex', gap: '4px', height: '60px', marginBottom: '20px' }}>
            {stats.pending > 0 && (
              <div
                style={{
                  flex: stats.pending,
                  background: 'linear-gradient(135deg, #9333ea 0%, #a855f7 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  minWidth: '50px'
                }}
              >
                {stats.pending}
              </div>
            )}
            {stats.applied > 0 && (
              <div
                style={{
                  flex: stats.applied,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  minWidth: '50px'
                }}
              >
                {stats.applied}
              </div>
            )}
            {stats.interview > 0 && (
              <div
                style={{
                  flex: stats.interview,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  minWidth: '50px'
                }}
              >
                {stats.interview}
              </div>
            )}
            {stats.offer > 0 && (
              <div
                style={{
                  flex: stats.offer,
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  minWidth: '50px'
                }}
              >
                {stats.offer}
              </div>
            )}
            {stats.rejected > 0 && (
              <div
                style={{
                  flex: stats.rejected,
                  background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  minWidth: '50px'
                }}
              >
                {stats.rejected}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {stats.pending > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#9333ea' }}></div>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Pending ({stats.pending})</span>
              </div>
            )}
            {stats.applied > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#3b82f6' }}></div>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Applied ({stats.applied})</span>
              </div>
            )}
            {stats.interview > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f59e0b' }}></div>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Interview ({stats.interview})</span>
              </div>
            )}
            {stats.offer > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }}></div>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Offers ({stats.offer})</span>
              </div>
            )}
            {stats.rejected > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ef4444' }}></div>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Rejected ({stats.rejected})</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>{stats.total}</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>Total</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9333ea' }}>{stats.pending}</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>Pending</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{stats.applied}</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>Applied</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.interview}</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>Interviews</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{stats.offer}</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>Offers</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>{stats.rejected}</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>Rejected</div>
        </div>
      </div>

      {/* Add Application Button */}
      <div style={{ marginBottom: '20px' }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{ fontSize: '16px', padding: '12px 24px' }}
        >
          {showForm ? '❌ Cancel' : '➕ Add New Application'}
        </button>
      </div>

      {/* Application Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>
            {editingId ? 'Edit Application' : 'New Application'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div className="form-group">
                <label className="form-label">Company *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Position *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date Applied *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dateApplied}
                  onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status *</label>
                <select
                  className="form-input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Application['status'] })}
                >
                  <option value="pending">Pending</option>
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Remote, San Francisco, CA"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Salary Range</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="e.g., $80k-$100k"
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label className="form-label">Job Posting URL</label>
              <input
                type="url"
                className="form-input"
                value={formData.jobUrl}
                onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            {/* Referral Section */}
            <div style={{ marginBottom: '15px', padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.hasReferral}
                    onChange={(e) => setFormData({ ...formData, hasReferral: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '500', color: '#1f2937' }}>
                    🤝 I have a referral or know someone at this company
                  </span>
                </label>
              </div>

              {formData.hasReferral && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Referral Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.referralName}
                      onChange={(e) => setFormData({ ...formData, referralName: e.target.value })}
                      placeholder="e.g., John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Referral Contact/LinkedIn</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.referralContact}
                      onChange={(e) => setFormData({ ...formData, referralContact: e.target.value })}
                      placeholder="e.g., linkedin.com/in/johndoe"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes about the application, interview process, etc."
                style={{ minHeight: '100px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Application' : 'Add Application'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Applications List */}
      <div>
        {applications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <h3 style={{ color: '#6b7280', marginBottom: '10px' }}>No Applications Yet</h3>
            <p style={{ color: '#9ca3af' }}>Click "Add New Application" to start tracking your job applications</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {applications.map((app) => (
              <div key={app.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#1f2937', fontSize: '18px' }}>
                      {app.position}
                    </h3>
                    <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px' }}>{app.company}</div>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#9ca3af', flexWrap: 'wrap' }}>
                      <span>📅 {new Date(app.dateApplied).toLocaleDateString()}</span>
                      {app.location && <span>📍 {app.location}</span>}
                      {app.salary && <span>💰 {app.salary}</span>}
                      {app.hasReferral && (
                        <span style={{
                          color: '#10b981',
                          fontWeight: '500',
                          background: '#ecfdf5',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          🤝 {app.referralName ? `Referred by ${app.referralName}` : 'Has Referral'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '500',
                        backgroundColor: getStatusColor(app.status) + '20',
                        color: getStatusColor(app.status)
                      }}
                    >
                      {getStatusLabel(app.status)}
                    </span>
                  </div>
                </div>

                {(app.notes || app.jobUrl) && (
                  <div style={{ marginBottom: '15px', paddingTop: '15px', borderTop: '1px solid #e5e7eb' }}>
                    {app.jobUrl && (
                      <div style={{ marginBottom: '8px' }}>
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px' }}
                        >
                          🔗 View Job Posting →
                        </a>
                      </div>
                    )}
                    {app.notes && (
                      <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                        {app.notes}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', paddingTop: '15px', borderTop: '1px solid #e5e7eb' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEdit(app)}
                    style={{ fontSize: '14px', padding: '6px 16px' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(app.id)}
                    style={{ fontSize: '14px', padding: '6px 16px' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default ApplicationTracker;
