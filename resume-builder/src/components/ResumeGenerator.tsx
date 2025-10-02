import React, { useState } from 'react';
import { ProfileData } from '../types';
import EditableResumePreview from './EditableResumePreview';
import CoverLetterPreview from './CoverLetterPreview';
import { AIResumeEditor, DetailedResumeAnalysis } from '../services/aiResumeEditor';

interface ResumeGeneratorProps {
  profileData: ProfileData;
  onProfileUpdated: (profileData: ProfileData) => void;
}

const ResumeGenerator: React.FC<ResumeGeneratorProps> = ({ profileData, onProfileUpdated }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'resume' | 'cover-letter'>('resume');
  const [error, setError] = useState<string | null>(null);
  const [detailedAnalysis, setDetailedAnalysis] = useState<DetailedResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const aiEditor = new AIResumeEditor();

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description first.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Use the enhanced AI cover letter generator
      const letter = await aiEditor.generateEnhancedCoverLetter(profileData, jobDescription, companyName.trim() || undefined);
      setCoverLetter(letter);
      setActiveTab('cover-letter');
    } catch (err) {
      setError('Failed to generate cover letter. Please check your API key and try again.');
      console.error('Cover letter generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeResume = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description first for detailed analysis.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await aiEditor.analyzeResumeDetailed(profileData, jobDescription);
      setDetailedAnalysis(result);
    } catch (err) {
      setError('Failed to analyze resume. Please check your API key and try again.');
      console.error('Resume analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyAllImprovements = async () => {
    console.log('Apply improvements clicked');
    console.log('Detailed analysis:', detailedAnalysis);
    console.log('Has improved profile:', !!detailedAnalysis?.improvedProfile);

    if (detailedAnalysis?.improvedProfile) {
      try {
        // Validate the improved profile has required structure
        const improvedProfile = detailedAnalysis.improvedProfile;
        if (!improvedProfile.personalInfo || !improvedProfile.workExperience || !improvedProfile.education || !improvedProfile.skills) {
          throw new Error('Improved profile is missing required sections');
        }

        console.log('Applying improvements to profile:', improvedProfile);
        onProfileUpdated(improvedProfile);
        setError(null);

        // Show success message temporarily
        const successMsg = '✅ All AI improvements applied! Re-analyzing...';
        setError(successMsg);

        // Clear current analysis and automatically re-run analysis with updated profile
        setDetailedAnalysis(null);

        // Auto re-run analysis after a short delay to show the updated results
        setTimeout(async () => {
          if (jobDescription.trim()) {
            setIsAnalyzing(true);
            try {
              const result = await aiEditor.analyzeResumeDetailed(improvedProfile, jobDescription);
              setDetailedAnalysis(result);
              setError('✅ Profile updated and re-analyzed successfully!');
              setTimeout(() => setError(null), 3000);
            } catch (err) {
              setError('❌ Applied improvements but failed to re-analyze. Please run analysis manually.');
              setTimeout(() => setError(null), 5000);
            } finally {
              setIsAnalyzing(false);
            }
          } else {
            setError('✅ Profile updated successfully!');
            setTimeout(() => setError(null), 3000);
          }
        }, 1000);

      } catch (error) {
        console.error('Error applying improvements:', error);
        setError('❌ Error applying improvements. Please try running analysis again.');
        setTimeout(() => setError(null), 5000);
      }
    } else {
      console.log('No improved profile found in analysis');
      setError('❌ No improvements available to apply. Please run analysis first.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleImproveCoverLetter = async () => {
    if (!coverLetter.trim()) {
      setError('Please generate a cover letter first.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const improvedLetter = await aiEditor.improveCoverLetter(coverLetter, jobDescription, profileData);
      setCoverLetter(improvedLetter);
      setActiveTab('cover-letter');
      const successMsg = '✅ Cover letter improved successfully!';
      setError(successMsg);
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError('Failed to improve cover letter. Please try again.');
      console.error('Cover letter improvement error:', err);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 200px)' }}>
      {/* Top Panel - Job Description & Analysis Controls */}
      <div className="card" style={{ flex: '0 0 auto' }}>
        <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>🎯 ATS Resume Analysis</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '15px', alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Company (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Google"
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <button
              className="btn btn-primary"
              onClick={handleAnalyzeResume}
              disabled={isAnalyzing || !jobDescription.trim()}
              style={{ width: '100%', height: '42px' }}
            >
              {isAnalyzing ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                  Analyzing...
                </>
              ) : (
                '🔍 Run ATS Analysis'
              )}
            </button>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Job Description *</label>
            <textarea
              className="form-textarea"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description here for ATS keyword analysis..."
              style={{ minHeight: '42px', fontSize: '14px', resize: 'vertical' }}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px', flex: 1, overflow: 'hidden' }}>
        {/* Left - Resume Preview */}
        <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="tabs" style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '20px', flexShrink: 0 }}>
            <button
              className={`tab ${activeTab === 'resume' ? 'active' : ''}`}
              onClick={() => setActiveTab('resume')}
            >
              📄 Resume Preview
            </button>
            <button
              className={`tab ${activeTab === 'cover-letter' ? 'active' : ''}`}
              onClick={() => setActiveTab('cover-letter')}
            >
              📝 Cover Letter
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'auto', opacity: isGenerating ? 0.5 : 1 }}>
            {activeTab === 'resume' && (
              <EditableResumePreview
                profileData={profileData}
                isCustomized={false}
                onProfileUpdate={onProfileUpdated}
                improvements={detailedAnalysis?.improvements || []}
              />
            )}
            {activeTab === 'cover-letter' && (
              <div>
                {!coverLetter ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <h4>📝 Cover Letter</h4>
                    <p>Generate a cover letter using the button above</p>
                  </div>
                ) : (
                  <CoverLetterPreview coverLetter={coverLetter} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right - ATS Analysis Results */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!detailedAnalysis ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: '#666' }}>
              <h4 style={{ marginBottom: '10px' }}>🎯 ATS Analysis</h4>
              <p style={{ marginBottom: '20px' }}>Paste a job description and click "Run ATS Analysis" to see:</p>
              <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
                <li>Exact keyword matches vs. missing</li>
                <li>ATS compatibility score</li>
                <li>Quantified achievements count</li>
                <li>Critical issues HR filters catch</li>
                <li>Consistent, deterministic scoring</li>
              </ul>
            </div>
          ) : (
            <div style={{ flex: 1, overflow: 'auto' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#dc2626' }}>🚨 ATS Screening Results</h3>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  HR filtering software analysis
                </div>
              </div>

              {/* ATS Scores */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  textAlign: 'center',
                  padding: '15px',
                  background: detailedAnalysis.atsCompatibility < 50 ? '#fef2f2' : '#fffbeb',
                  border: `2px solid ${detailedAnalysis.atsCompatibility < 50 ? '#dc2626' : '#d97706'}`,
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>ATS SCORE</div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: detailedAnalysis.atsCompatibility < 50 ? '#dc2626' : '#d97706'
                  }}>
                    {detailedAnalysis.atsCompatibility}/100
                  </div>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: '15px',
                  background: detailedAnalysis.relevanceScore < 50 ? '#fef2f2' : '#fffbeb',
                  border: `2px solid ${detailedAnalysis.relevanceScore < 50 ? '#dc2626' : '#d97706'}`,
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>RELEVANCE</div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: detailedAnalysis.relevanceScore < 50 ? '#dc2626' : '#d97706'
                  }}>
                    {detailedAnalysis.relevanceScore}/100
                  </div>
                </div>
              </div>

              {/* Keyword Analysis */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#374151', marginBottom: '10px', fontSize: '16px' }}>
                  🎯 KEYWORD MATCHING ({detailedAnalysis.keywordMatches.matchPercentage}%)
                </h4>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#059669', marginBottom: '5px' }}>
                    ✓ FOUND ({detailedAnalysis.keywordMatches.matched.length})
                  </div>
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '4px',
                    padding: '8px',
                    fontSize: '12px',
                    maxHeight: '80px',
                    overflow: 'auto'
                  }}>
                    {detailedAnalysis.keywordMatches.matched.length > 0
                      ? detailedAnalysis.keywordMatches.matched.join(', ')
                      : 'None found'}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#dc2626', marginBottom: '5px' }}>
                    ✗ MISSING ({detailedAnalysis.keywordMatches.missing.length})
                  </div>
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '4px',
                    padding: '8px',
                    fontSize: '12px',
                    maxHeight: '80px',
                    overflow: 'auto'
                  }}>
                    {detailedAnalysis.keywordMatches.missing.length > 0
                      ? detailedAnalysis.keywordMatches.missing.join(', ')
                      : 'All keywords found!'}
                  </div>
                </div>
              </div>

              {/* Measurements */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#374151', marginBottom: '10px', fontSize: '16px' }}>📊 MEASUREMENTS</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                  <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 'bold' }}>Total Words</div>
                    <div style={{ fontSize: '18px', color: '#374151' }}>{detailedAnalysis.measurements.totalWords}</div>
                  </div>
                  <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 'bold' }}>Quantified Results</div>
                    <div style={{ fontSize: '18px', color: detailedAnalysis.measurements.quantifiedAchievements === 0 ? '#dc2626' : '#059669' }}>
                      {detailedAnalysis.measurements.quantifiedAchievements}
                    </div>
                  </div>
                  <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 'bold' }}>Action Verbs</div>
                    <div style={{ fontSize: '18px', color: '#374151' }}>{detailedAnalysis.measurements.actionVerbs}</div>
                  </div>
                  <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 'bold' }}>Tech Skills</div>
                    <div style={{ fontSize: '18px', color: '#374151' }}>{detailedAnalysis.measurements.technicalSkills}</div>
                  </div>
                </div>
              </div>

              {/* Critical Issues */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#dc2626', marginBottom: '10px', fontSize: '16px' }}>🚨 CRITICAL ISSUES</h4>
                {detailedAnalysis.criticalIssues.map((issue, index) => (
                  <div key={index} style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '4px',
                    padding: '10px',
                    marginBottom: '8px',
                    fontSize: '13px',
                    color: '#7f1d1d'
                  }}>
                    {issue}
                  </div>
                ))}
              </div>

              {/* Specific Improvements Needed */}
              {detailedAnalysis.improvements && detailedAnalysis.improvements.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#dc2626', marginBottom: '10px', fontSize: '16px' }}>🔧 SPECIFIC CHANGES NEEDED</h4>
                  <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                    {detailedAnalysis.improvements.map((improvement, index) => (
                      <div key={index} style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '10px',
                        fontSize: '12px'
                      }}>
                        <div style={{
                          fontWeight: 'bold',
                          color: '#7f1d1d',
                          marginBottom: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>{improvement.section.toUpperCase()}</span>
                          <span style={{
                            background: improvement.impact === 'high' ? '#dc2626' : improvement.impact === 'medium' ? '#d97706' : '#84cc16',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '10px'
                          }}>
                            {improvement.impact.toUpperCase()}
                          </span>
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666', marginBottom: '3px' }}>CURRENT:</div>
                          <div style={{
                            background: '#fee2e2',
                            border: '1px solid #dc2626',
                            borderRadius: '3px',
                            padding: '6px',
                            color: '#7f1d1d',
                            wordBreak: 'break-word'
                          }}>
                            {improvement.original}
                          </div>
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666', marginBottom: '3px' }}>IMPROVED:</div>
                          <div style={{
                            background: '#f0fdf4',
                            border: '1px solid #22c55e',
                            borderRadius: '3px',
                            padding: '6px',
                            color: '#15803d',
                            wordBreak: 'break-word'
                          }}>
                            {improvement.improved}
                          </div>
                        </div>

                        <div style={{
                          fontSize: '11px',
                          color: '#6b7280',
                          fontStyle: 'italic',
                          lineHeight: '1.4'
                        }}>
                          📝 {improvement.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply Changes Button */}
              <button
                className="btn btn-primary"
                onClick={handleApplyAllImprovements}
                disabled={!detailedAnalysis?.improvedProfile}
                style={{
                  width: '100%',
                  fontSize: '16px',
                  padding: '15px',
                  marginBottom: '10px',
                  opacity: detailedAnalysis?.improvedProfile ? 1 : 0.6
                }}
              >
                {detailedAnalysis?.improvedProfile
                  ? '✨ Apply All AI Improvements'
                  : '⏳ Generating Improvements...'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cover Letter Quick Actions */}
      {activeTab === 'cover-letter' && (
        <div className="card" style={{ flex: '0 0 auto' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={handleGenerateCoverLetter}
              disabled={isGenerating || !jobDescription.trim()}
              style={{ flex: 1 }}
            >
              {isGenerating ? 'Generating...' : '📝 Generate Enhanced Cover Letter'}
            </button>
            {coverLetter && (
              <button
                className="btn btn-secondary"
                onClick={handleImproveCoverLetter}
                disabled={isGenerating}
                style={{ flex: 1 }}
              >
                ✨ Improve Letter with AI
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: error.includes('✅') ? '#f0fdf4' : '#fef2f2',
          color: error.includes('✅') ? '#059669' : '#dc2626',
          border: `1px solid ${error.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
          flex: '0 0 auto'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ResumeGenerator;