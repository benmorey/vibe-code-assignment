import React, { useState, useRef } from 'react';
import { ProfileData } from '../types';
import { ResumeParsingService } from '../services/resumeParsingService';

interface ResumeUploadProps {
  onDataParsed: (data: ProfileData) => void;
  currentProfile: ProfileData;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onDataParsed, currentProfile }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const parsingService = new ResumeParsingService();

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type) && !file.name.endsWith('.docx')) {
      setUploadStatus({
        type: 'error',
        message: 'Please upload a PDF, DOCX, or TXT file only.'
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus({
        type: 'error',
        message: 'File size must be less than 10MB.'
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const parsedData = await parsingService.uploadAndParseResume(file);

      // Convert parsed data to ProfileData format and merge with existing profile
      const updatedProfile: ProfileData = {
        personalInfo: {
          ...currentProfile.personalInfo,
          ...parsedData.personalInfo
        },
        aboutMe: parsedData.aboutMe || currentProfile.aboutMe,
        education: parsedData.education.length > 0 ? parsedData.education as any[] : currentProfile.education,
        workExperience: parsedData.workExperience.length > 0 ? parsedData.workExperience as any[] : currentProfile.workExperience,
        projects: parsedData.projects.length > 0 ? parsedData.projects as any[] : currentProfile.projects,
        volunteerWork: parsedData.volunteerWork.length > 0 ? parsedData.volunteerWork as any[] : currentProfile.volunteerWork,
        skills: parsedData.skills.length > 0 ? parsedData.skills as any[] : currentProfile.skills
      };

      onDataParsed(updatedProfile);

      setUploadStatus({
        type: 'success',
        message: 'Resume parsed successfully! Your profile has been updated with the extracted information.'
      });

    } catch (error) {
      console.error('Upload/parsing error:', error);
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to parse resume. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>Upload Resume</h3>
      <p style={{ marginBottom: '20px', color: '#6b7280', fontSize: '14px' }}>
        Upload your existing resume (PDF or TXT) to automatically populate your profile with parsed information.
      </p>

      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        style={{
          border: dragActive ? '2px dashed #3b82f6' : '2px dashed #d1d5db',
          borderRadius: '8px',
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: dragActive ? '#eff6ff' : '#f9fafb',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '15px'
        }}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div style={{ fontSize: '48px', marginBottom: '10px', color: '#9ca3af' }}>
          📄
        </div>

        {isUploading ? (
          <div>
            <div style={{ fontSize: '16px', fontWeight: 500, color: '#1f2937', marginBottom: '5px' }}>
              Uploading and parsing...
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              This may take a moment while we extract information from your resume.
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '16px', fontWeight: 500, color: '#1f2937', marginBottom: '5px' }}>
              Drop your resume here or click to browse
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Supports PDF and TXT files up to 10MB
            </div>
          </div>
        )}
      </div>

      {uploadStatus.type && (
        <div
          style={{
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: uploadStatus.type === 'success' ? '#d1fae5' : '#fee2e2',
            border: `1px solid ${uploadStatus.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: uploadStatus.type === 'success' ? '#065f46' : '#dc2626',
            fontSize: '14px',
            marginBottom: '15px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>
              {uploadStatus.type === 'success' ? '✅' : '❌'}
            </span>
            <div>
              {uploadStatus.message}
            </div>
          </div>
        </div>
      )}

      <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
        <p><strong>What happens when you upload:</strong></p>
        <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
          <li>Your resume is securely uploaded to Supabase storage</li>
          <li>AI extracts and structures the information</li>
          <li>Your profile is automatically populated with the parsed data</li>
          <li>You can review and edit the information before saving</li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeUpload;