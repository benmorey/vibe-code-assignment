import React, { useState } from 'react';
import { ProfileData } from '../types';
import JobDescriptionInput from './JobDescriptionInput';
import ResumePreview from './ResumePreview';
import CoverLetterPreview from './CoverLetterPreview';
import { generateCustomizedResume, generateCoverLetter } from '../services/aiService';

interface ResumeGeneratorProps {
  profileData: ProfileData;
}

const ResumeGenerator: React.FC<ResumeGeneratorProps> = ({ profileData }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [customizedResume, setCustomizedResume] = useState<ProfileData | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'resume' | 'cover-letter'>('resume');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateResume = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description first.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const customized = await generateCustomizedResume(profileData, jobDescription);
      setCustomizedResume(customized);
    } catch (err) {
      setError('Failed to generate resume. Please check your API key and try again.');
      console.error('Resume generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description first.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const letter = await generateCoverLetter(profileData, jobDescription);
      setCoverLetter(letter);
      setActiveTab('cover-letter');
    } catch (err) {
      setError('Failed to generate cover letter. Please check your API key and try again.');
      console.error('Cover letter generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const isEmpty = !profileData.personalInfo.name &&
                 profileData.education.length === 0 &&
                 profileData.workExperience.length === 0;

  if (isEmpty) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
        <h2 style={{ color: '#6b7280', marginBottom: '20px' }}>No Profile Data</h2>
        <p style={{ color: '#9ca3af' }}>
          Please go to the "Build Profile" tab first to add your information before generating a resume.
        </p>
      </div>
    );
  }

  return (
    <div className="two-column">
      <div>
        <JobDescriptionInput
          value={jobDescription}
          onChange={setJobDescription}
          onGenerateResume={handleGenerateResume}
          onGenerateCoverLetter={handleGenerateCoverLetter}
          isGenerating={isGenerating}
        />

        {error && (
          <div className="card" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', marginTop: '20px' }}>
            <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}
      </div>

      <div>
        <div className="card">
          <div className="tabs" style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
            <button
              className={`tab ${activeTab === 'resume' ? 'active' : ''}`}
              onClick={() => setActiveTab('resume')}
            >
              Resume Preview
            </button>
            <button
              className={`tab ${activeTab === 'cover-letter' ? 'active' : ''}`}
              onClick={() => setActiveTab('cover-letter')}
            >
              Cover Letter
            </button>
          </div>

          {isGenerating && (
            <div className="loading">
              <div className="spinner"></div>
              <span style={{ marginLeft: '10px' }}>Generating with AI...</span>
            </div>
          )}

          {!isGenerating && activeTab === 'resume' && (
            <ResumePreview
              profileData={customizedResume || profileData}
              isCustomized={!!customizedResume}
            />
          )}

          {!isGenerating && activeTab === 'cover-letter' && (
            <CoverLetterPreview
              coverLetter={coverLetter}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeGenerator;