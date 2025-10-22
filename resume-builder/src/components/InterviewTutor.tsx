import React, { useState } from 'react';
import { ProfileData } from '../types';

interface InterviewTutorProps {
  profileData: ProfileData;
}

const InterviewTutor: React.FC<InterviewTutorProps> = ({ profileData }) => {
  const [selectedJobRole, setSelectedJobRole] = useState('');
  const [customJobRole, setCustomJobRole] = useState('');
  const [interviewType, setInterviewType] = useState<'behavioral' | 'technical' | 'mixed'>('mixed');
  const [difficulty, setDifficulty] = useState<'entry' | 'mid' | 'senior'>('mid');
  const [isSessionActive, setIsSessionActive] = useState(false);

  const commonRoles = [
    'Software Engineer',
    'Data Scientist',
    'Product Manager',
    'UX Designer',
    'Marketing Manager',
    'Sales Representative',
    'Business Analyst',
    'Other (Custom)'
  ];

  const startSession = () => {
    if (!selectedJobRole && !customJobRole) {
      alert('Please select or enter a job role');
      return;
    }
    setIsSessionActive(true);
  };

  const endSession = () => {
    setIsSessionActive(false);
  };

  if (isSessionActive) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
            AI Interview Practice
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
            Practicing for: {customJobRole || selectedJobRole} ({interviewType} interview)
          </p>
        </div>

        <div className="card">
          <div style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎯</div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
              Interview Session
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px', lineHeight: '1.8' }}>
              This feature is coming soon! You'll be able to practice mock interviews with AI-powered
              questions tailored to your profile and target role.
            </p>
            <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '8px', marginBottom: '32px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                What to expect:
              </h3>
              <ul style={{ fontSize: '14px', color: '#6b7280', lineHeight: '2', paddingLeft: '20px' }}>
                <li>Personalized questions based on your resume</li>
                <li>Real-time feedback on your answers</li>
                <li>AI-powered evaluation of communication skills</li>
                <li>Practice with common interview scenarios</li>
                <li>Track your progress over time</li>
              </ul>
            </div>
            <button className="btn btn-primary" onClick={endSession} style={{ fontSize: '16px', padding: '12px 32px' }}>
              Back to Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
          AI Interview Tutor
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
          Practice mock interviews with AI-powered questions tailored to your profile
        </p>
      </div>

      <div className="card">
        <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '16px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
            Setup Your Practice Session
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Configure your interview practice preferences
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">Target Job Role *</label>
          <select
            className="form-input"
            value={selectedJobRole}
            onChange={(e) => setSelectedJobRole(e.target.value)}
            style={{ marginBottom: '12px' }}
          >
            <option value="">Select a job role...</option>
            {commonRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          {selectedJobRole === 'Other (Custom)' && (
            <input
              type="text"
              className="form-input"
              value={customJobRole}
              onChange={(e) => setCustomJobRole(e.target.value)}
              placeholder="Enter custom job role"
            />
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Interview Type *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <button
              className={`btn ${interviewType === 'behavioral' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setInterviewType('behavioral')}
            >
              Behavioral
            </button>
            <button
              className={`btn ${interviewType === 'technical' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setInterviewType('technical')}
            >
              Technical
            </button>
            <button
              className={`btn ${interviewType === 'mixed' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setInterviewType('mixed')}
            >
              Mixed
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Experience Level *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <button
              className={`btn ${difficulty === 'entry' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDifficulty('entry')}
            >
              Entry Level
            </button>
            <button
              className={`btn ${difficulty === 'mid' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDifficulty('mid')}
            >
              Mid Level
            </button>
            <button
              className={`btn ${difficulty === 'senior' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDifficulty('senior')}
            >
              Senior Level
            </button>
          </div>
        </div>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={startSession}
            style={{ fontSize: '16px', padding: '14px 32px', borderRadius: '8px' }}
          >
            Start Practice Session
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '16px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
            How It Works
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Prepare for your next interview with AI-powered practice
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              📋 Personalized Questions
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
              Questions are generated based on your resume, target role, and experience level
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              💬 Real-Time Feedback
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
              Get instant feedback on your answers, communication style, and areas to improve
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              🎯 Practice Scenarios
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
              Practice common interview scenarios like STAR method, technical problems, and more
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              📊 Track Progress
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
              Monitor your improvement over time with detailed analytics and insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewTutor;
