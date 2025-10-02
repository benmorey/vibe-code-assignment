import React, { useState, useRef } from 'react';
import { ProfileData } from '../types';
import { PDFTextExtractor } from '../services/pdfTextExtractor';

interface PDFImporterProps {
  onProfileImported: (profile: Partial<ProfileData>) => void;
}

interface ImportStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

const PDFImporter: React.FC<PDFImporterProps> = ({ onProfileImported }) => {
  const [importStatus, setImportStatus] = useState<ImportStatus>({ type: 'idle', message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfExtractor = new PDFTextExtractor();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      await processFile(file);
    } else {
      setImportStatus({
        type: 'error',
        message: 'Please drop a PDF file only.'
      });
    }
  };

  const processFile = async (file: File) => {
    try {
      // Validate file
      if (file.type !== 'application/pdf') {
        setImportStatus({
          type: 'error',
          message: 'Please select a PDF file only.'
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setImportStatus({
          type: 'error',
          message: 'File size must be less than 10MB.'
        });
        return;
      }

      setImportStatus({
        type: 'loading',
        message: 'Extracting text from PDF...'
      });

      // Extract text from PDF
      const extractedText = await pdfExtractor.extractTextFromPDF(file);

      setImportStatus({
        type: 'loading',
        message: 'Using AI to parse resume data...'
      });

      // Parse text to profile data using AI
      const profileData = await pdfExtractor.parseTextToProfile(extractedText);

      // Import the profile
      onProfileImported(profileData);

      setImportStatus({
        type: 'success',
        message: `✅ Successfully imported resume data from ${file.name}!`
      });

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error importing PDF:', error);
      setImportStatus({
        type: 'error',
        message: `Failed to import PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="card">
      <h3>📄 Populate with Resume</h3>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Upload your existing resume PDF and we'll automatically extract the information to populate your profile.
      </p>

      <div
        className="pdf-drop-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: '#fafafa',
          transition: 'all 0.3s ease'
        }}
      >
        <div>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>
            Drop your PDF here or click to select
          </h4>
          <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
            Supports PDF files up to 10MB
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {importStatus.type !== 'idle' && (
        <div
          style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor:
              importStatus.type === 'error'
                ? '#fef2f2'
                : importStatus.type === 'success'
                ? '#f0fdf4'
                : '#eff6ff',
            color:
              importStatus.type === 'error'
                ? '#dc2626'
                : importStatus.type === 'success'
                ? '#059669'
                : '#2563eb',
            border: `1px solid ${
              importStatus.type === 'error'
                ? '#fecaca'
                : importStatus.type === 'success'
                ? '#bbf7d0'
                : '#bfdbfe'
            }`
          }}
        >
          {importStatus.type === 'loading' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
              {importStatus.message}
            </div>
          )}
          {importStatus.type !== 'loading' && importStatus.message}
        </div>
      )}

      <div style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>
        <strong>What gets imported:</strong>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>Personal information (name, email, phone)</li>
          <li>Skills and technologies</li>
          <li>Work experience and job titles</li>
          <li>Education background</li>
          <li>Summary/about me section</li>
        </ul>
        <em>Note: You can edit and refine all imported data after import.</em>
      </div>
    </div>
  );
};

export default PDFImporter;