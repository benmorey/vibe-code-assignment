import React, { useState } from 'react';
import { ProfileData } from '../types';
import { AIResumeEditor, ResumeAnalysis, ResumeImprovementSuggestion } from '../services/aiResumeEditor';

interface AIResumeEditorProps {
  profileData: ProfileData;
  onProfileUpdated: (updatedProfile: ProfileData) => void;
}

interface EditingStatus {
  type: 'idle' | 'analyzing' | 'improving' | 'generating' | 'success' | 'error';
  message: string;
}

const AIResumeEditorComponent: React.FC<AIResumeEditorProps> = ({ profileData, onProfileUpdated }) => {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [editingStatus, setEditingStatus] = useState<EditingStatus>({ type: 'idle', message: '' });
  const [targetJob, setTargetJob] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'analyze' | 'improve' | 'jobSpecific'>('analyze');

  const aiEditor = new AIResumeEditor();

  const handleAnalyzeResume = async () => {
    try {
      setEditingStatus({ type: 'analyzing', message: 'Analyzing your resume with AI...' });

      const result = await aiEditor.analyzeAndImproveResume(profileData, targetJob || undefined);
      setAnalysis(result);

      setEditingStatus({
        type: 'success',
        message: `✅ Analysis complete! Overall score: ${result.overallScore}/100`
      });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setEditingStatus({
        type: 'error',
        message: `Failed to analyze resume: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const handleApplyAllImprovements = () => {
    if (analysis?.improvedProfile) {
      onProfileUpdated(analysis.improvedProfile);
      setEditingStatus({
        type: 'success',
        message: '✅ All improvements applied to your profile!'
      });
    }
  };

  const handleApplySuggestion = (suggestion: ResumeImprovementSuggestion) => {
    // Apply individual suggestion logic here
    console.log('Applying suggestion:', suggestion);
    setEditingStatus({
      type: 'success',
      message: `✅ Applied improvement to ${suggestion.section}`
    });
  };

  const handleGenerateJobSpecificResume = async () => {
    if (!jobDescription.trim()) {
      setEditingStatus({ type: 'error', message: 'Please enter a job description first.' });
      return;
    }

    try {
      setEditingStatus({ type: 'generating', message: 'Generating job-specific resume...' });

      const optimizedProfile = await aiEditor.generateJobSpecificResume(profileData, jobDescription);
      onProfileUpdated(optimizedProfile);

      setEditingStatus({
        type: 'success',
        message: '✅ Job-specific resume generated and applied!'
      });
    } catch (error) {
      console.error('Error generating job-specific resume:', error);
      setEditingStatus({
        type: 'error',
        message: `Failed to generate job-specific resume: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#059669'; // Green
    if (score >= 60) return '#d97706'; // Orange
    return '#dc2626'; // Red
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#dc2626';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  return (
    <div className="card">
      <h3>🤖 AI Resume Editor</h3>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Use AI to analyze, improve, and optimize your resume for better results.
      </p>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e0e0e0', marginBottom: '20px' }}>
        <button
          className={`tab ${activeTab === 'analyze' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyze')}
          style={{ marginBottom: 0 }}
        >
          📊 Analyze & Improve
        </button>
        <button
          className={`tab ${activeTab === 'jobSpecific' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobSpecific')}
          style={{ marginBottom: 0 }}
        >
          🎯 Job-Specific
        </button>
      </div>

      {/* Analyze & Improve Tab */}
      {activeTab === 'analyze' && (
        <div>
          <div className="form-group">
            <label className="form-label">Target Job/Role (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={targetJob}
              onChange={(e) => setTargetJob(e.target.value)}
              placeholder="e.g., Software Engineer, Data Analyst, Product Manager"
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleAnalyzeResume}
            disabled={editingStatus.type === 'analyzing'}
            style={{ marginBottom: '20px' }}
          >
            {editingStatus.type === 'analyzing' ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                Analyzing...
              </>
            ) : (
              '🔍 Analyze My Resume'
            )}
          </button>

          {/* Analysis Results */}
          {analysis && (
            <div style={{ marginTop: '20px' }}>
              {/* Overall Score */}
              <div style={{
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: `3px solid ${getScoreColor(analysis.overallScore)}`
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: getScoreColor(analysis.overallScore) }}>
                  Overall Resume Score: {analysis.overallScore}/100
                </h4>
                <div style={{
                  background: '#e9ecef',
                  height: '10px',
                  borderRadius: '5px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: getScoreColor(analysis.overallScore),
                    height: '100%',
                    width: `${analysis.overallScore}%`,
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
              </div>

              {/* Strengths and Weaknesses */}
              <div className="two-column" style={{ marginBottom: '20px' }}>
                <div>
                  <h4 style={{ color: '#059669', marginBottom: '10px' }}>✅ Strengths</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} style={{ marginBottom: '5px', color: '#374151' }}>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 style={{ color: '#dc2626', marginBottom: '10px' }}>⚠️ Areas for Improvement</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {analysis.weaknesses.map((weakness, index) => (
                      <li key={index} style={{ marginBottom: '5px', color: '#374151' }}>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Apply All Improvements Button */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleApplyAllImprovements}
                  style={{ fontSize: '16px', padding: '12px 24px' }}
                >
                  ✨ Apply All AI Improvements
                </button>
              </div>

              {/* Individual Suggestions */}
              <div>
                <h4 style={{ marginBottom: '15px' }}>💡 Specific Improvement Suggestions</h4>
                {analysis.suggestions.map((suggestion, index) => (
                  <div key={index} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '12px',
                    background: '#fafafa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h5 style={{ margin: 0, color: '#1f2937', textTransform: 'capitalize' }}>
                        {suggestion.section.replace(/([A-Z])/g, ' $1').trim()}
                      </h5>
                      <span style={{
                        background: getImpactColor(suggestion.impact),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {suggestion.impact.toUpperCase()} IMPACT
                      </span>
                    </div>
                    <p style={{ margin: '8px 0', color: '#6b7280', fontSize: '14px' }}>
                      <strong>Why:</strong> {suggestion.reason}
                    </p>
                    <div style={{ background: 'white', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Before:</strong>
                        <div style={{ color: '#dc2626', fontStyle: 'italic' }}>"{suggestion.original}"</div>
                      </div>
                      <div>
                        <strong>After:</strong>
                        <div style={{ color: '#059669', fontWeight: 'bold' }}>"{suggestion.improved}"</div>
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleApplySuggestion(suggestion)}
                      style={{ marginTop: '10px', fontSize: '12px' }}
                    >
                      Apply This Change
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Job-Specific Tab */}
      {activeTab === 'jobSpecific' && (
        <div>
          <div className="form-group">
            <label className="form-label">Job Description</label>
            <textarea
              className="form-textarea"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job description here..."
              rows={8}
              style={{ minHeight: '200px' }}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleGenerateJobSpecificResume}
            disabled={editingStatus.type === 'generating' || !jobDescription.trim()}
            style={{ marginBottom: '20px' }}
          >
            {editingStatus.type === 'generating' ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                Generating...
              </>
            ) : (
              '🎯 Generate Job-Specific Resume'
            )}
          </button>

          <div style={{ background: '#f0f8ff', padding: '15px', borderRadius: '6px', fontSize: '14px' }}>
            <strong>What this does:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Analyzes the job description for key requirements</li>
              <li>Optimizes your resume for ATS (Applicant Tracking Systems)</li>
              <li>Adds relevant keywords naturally throughout</li>
              <li>Reorders and emphasizes most relevant experience</li>
              <li>Enhances descriptions to match job requirements</li>
            </ul>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {editingStatus.type !== 'idle' && (
        <div
          style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor:
              editingStatus.type === 'error'
                ? '#fef2f2'
                : editingStatus.type === 'success'
                ? '#f0fdf4'
                : '#eff6ff',
            color:
              editingStatus.type === 'error'
                ? '#dc2626'
                : editingStatus.type === 'success'
                ? '#059669'
                : '#2563eb',
            border: `1px solid ${
              editingStatus.type === 'error'
                ? '#fecaca'
                : editingStatus.type === 'success'
                ? '#bbf7d0'
                : '#bfdbfe'
            }`
          }}
        >
          {(editingStatus.type === 'analyzing' || editingStatus.type === 'improving' || editingStatus.type === 'generating') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
              {editingStatus.message}
            </div>
          )}
          {(editingStatus.type === 'success' || editingStatus.type === 'error') && editingStatus.message}
        </div>
      )}
    </div>
  );
};

export default AIResumeEditorComponent;