import React, { useState } from 'react';
import { ProfileData } from '../types';
import { ComparisonService, ComparisonResult } from '../services/comparisonService';

interface ResumeComparisonProps {
  profileData: ProfileData;
}

const ResumeComparison: React.FC<ResumeComparisonProps> = ({ profileData }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const comparisonService = new ComparisonService();

  const analyzeCompatibility = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const comparisonResult = await comparisonService.compareResumeToJob(profileData, jobDescription);
      setResult(comparisonResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze compatibility');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const ScoreBar: React.FC<{ score: number; label: string }> = ({ score, label }) => (
    <div style={{ marginBottom: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontWeight: 500, fontSize: '14px' }}>{label}</span>
        <span style={{ fontWeight: 600, color: comparisonService.getScoreColor(score) }}>
          {score}%
        </span>
      </div>
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div
          style={{
            width: `${score}%`,
            height: '100%',
            backgroundColor: comparisonService.getScoreColor(score),
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );

  const SectionCard: React.FC<{
    title: string;
    score: number;
    matched: string[];
    missing: string[];
    feedback: string;
    matchedLabel: string;
    missingLabel: string;
  }> = ({ title, score, matched, missing, feedback, matchedLabel, missingLabel }) => (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '15px', color: '#1f2937', fontSize: '18px' }}>{title}</h3>

      <ScoreBar score={score} label="Section Score" />

      <div style={{ marginBottom: '15px' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '14px', lineHeight: '1.5', color: '#4b5563' }}>
          {feedback}
        </p>
      </div>

      {matched.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#059669',
            marginBottom: '8px'
          }}>
            ✓ {matchedLabel}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {matched.map((item, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#d1fae5',
                  color: '#059669',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div>
          <h4 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#dc2626',
            marginBottom: '8px'
          }}>
            ✗ {missingLabel}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {missing.map((item, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="card" style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Resume Compatibility Analysis</h2>
        <p style={{ marginBottom: '20px', color: '#6b7280', fontSize: '14px' }}>
          Analyze how well your resume matches a specific job description. Get detailed feedback and improvement suggestions.
        </p>

        <div className="form-group">
          <label className="form-label">Job Description *</label>
          <textarea
            className="form-textarea"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description here..."
            style={{ minHeight: '150px' }}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={analyzeCompatibility}
          disabled={isAnalyzing || !jobDescription.trim()}
          style={{ width: '100%' }}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Compatibility'}
        </button>

        {error && (
          <div style={{
            marginTop: '15px',
            padding: '12px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
      </div>

      {result && (
        <div>
          {/* Overall Score */}
          <div className="card" style={{ marginBottom: '30px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Overall Compatibility</h2>

            <div style={{
              display: 'inline-block',
              padding: '30px',
              borderRadius: '50%',
              backgroundColor: '#f9fafb',
              border: `4px solid ${comparisonService.getGradeColor(result.grade)}`,
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: comparisonService.getGradeColor(result.grade),
                lineHeight: 1
              }}>
                {result.grade}
              </div>
            </div>

            <div style={{ fontSize: '32px', fontWeight: 600, marginBottom: '10px' }}>
              {result.overallScore}%
            </div>

            <ScoreBar score={result.overallScore} label="Overall Match Score" />
          </div>

          {/* Section Breakdown */}
          <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Detailed Analysis</h2>

          <SectionCard
            title="Skills Match"
            score={result.sections.skills.score}
            matched={result.sections.skills.matchedSkills}
            missing={result.sections.skills.missingSkills}
            feedback={result.sections.skills.feedback}
            matchedLabel="Matched Skills"
            missingLabel="Missing Skills"
          />

          <SectionCard
            title="Experience Alignment"
            score={result.sections.experience.score}
            matched={result.sections.experience.relevantExperience}
            missing={result.sections.experience.missingExperience}
            feedback={result.sections.experience.feedback}
            matchedLabel="Relevant Experience"
            missingLabel="Missing Experience"
          />

          <SectionCard
            title="Education & Qualifications"
            score={result.sections.education.score}
            matched={result.sections.education.relevantEducation}
            missing={result.sections.education.missingRequirements}
            feedback={result.sections.education.feedback}
            matchedLabel="Relevant Qualifications"
            missingLabel="Missing Requirements"
          />

          <SectionCard
            title="Keyword Optimization"
            score={result.sections.keywords.score}
            matched={result.sections.keywords.matchedKeywords}
            missing={result.sections.keywords.missingKeywords}
            feedback={result.sections.keywords.feedback}
            matchedLabel="Matched Keywords"
            missingLabel="Missing Keywords"
          />

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>Improvement Recommendations</h3>
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                color: '#4b5563',
                lineHeight: '1.6'
              }}>
                {result.recommendations.map((rec, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeComparison;