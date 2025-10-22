import React, { useState } from 'react';
import { NetworkService } from '../services/networkService';
import { Application } from './ApplicationTracker';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  postedDate: string;
  source: string;
}

interface JobSearchProps {
  onJobSelect: (job: Job) => void;
  profileData?: any;
}

const JobSearch: React.FC<JobSearchProps> = ({ onJobSelect, profileData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [titleFilter, setTitleFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [networkFilter, setNetworkFilter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecommended, setShowRecommended] = useState(false);

  // Add job to application tracker with pending status
  const addToApplicationTracker = (job: Job) => {
    const applications = localStorage.getItem('jobApplications');
    const existingApps: Application[] = applications ? JSON.parse(applications) : [];

    // Check if already added
    const alreadyExists = existingApps.some(app =>
      app.company.toLowerCase() === job.company.toLowerCase() &&
      app.position.toLowerCase() === job.title.toLowerCase()
    );

    if (alreadyExists) {
      return; // Silently skip if already exists
    }

    const newApp: Application = {
      id: Date.now().toString(),
      company: job.company,
      position: job.title,
      dateApplied: new Date().toISOString().split('T')[0],
      status: 'pending',
      jobUrl: job.url,
      location: job.location,
      salary: job.salary,
      notes: job.description.substring(0, 200) + '...'
    };

    existingApps.unshift(newApp);
    localStorage.setItem('jobApplications', JSON.stringify(existingApps));
  };

  const getRecommendedJobs = async () => {
    if (!profileData) {
      setError('Please create a profile first to get recommendations');
      return;
    }

    setIsSearching(true);
    setError(null);
    setShowRecommended(true);

    try {
      // Extract skills and job titles from profile
      const skills: string[] = [];
      profileData.skills.forEach((skillGroup: any) => {
        skills.push(...skillGroup.skills);
      });

      // Get most recent job title
      let recommendedQuery = '';
      if (profileData.workExperience.length > 0) {
        recommendedQuery = profileData.workExperience[0].position;
      } else if (profileData.education.length > 0) {
        recommendedQuery = profileData.education[0].field;
      } else if (skills.length > 0) {
        recommendedQuery = skills[0];
      }

      if (!recommendedQuery) {
        setError('Unable to generate recommendations. Please add more information to your profile.');
        setIsSearching(false);
        return;
      }

      // Search using the recommended query
      setSearchQuery(recommendedQuery);

      const response = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(recommendedQuery)}`);

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();

      const transformedJobs: Job[] = data.jobs.map((job: any) => ({
        id: job.id.toString(),
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote',
        description: job.description,
        url: job.url,
        salary: job.salary || 'Not specified',
        postedDate: job.publication_date,
        source: 'Remotive'
      }));

      // Calculate match scores and sort by relevance
      const jobsWithScores = transformedJobs.map(job => ({
        ...job,
        matchScore: calculateMatchScore(job, profileData, skills)
      }));

      jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

      setJobs(jobsWithScores);
    } catch (err) {
      console.error('Recommendation error:', err);

      // Generate smart mock data based on profile
      const mockJobs = generateSmartMockJobs(profileData);
      setJobs(mockJobs);
    } finally {
      setIsSearching(false);
    }
  };

  const calculateMatchScore = (job: Job, profile: any, skills: string[]): number => {
    let score = 0;
    const jobText = `${job.title} ${job.description}`.toLowerCase();

    // Check skills match
    skills.forEach(skill => {
      if (jobText.includes(skill.toLowerCase())) {
        score += 10;
      }
    });

    // Check experience match
    profile.workExperience.forEach((work: any) => {
      if (jobText.includes(work.position.toLowerCase())) {
        score += 15;
      }
      if (jobText.includes(work.company.toLowerCase())) {
        score += 5;
      }
    });

    // Check education match
    profile.education.forEach((edu: any) => {
      if (jobText.includes(edu.field.toLowerCase())) {
        score += 8;
      }
    });

    return score;
  };

  const generateSmartMockJobs = (profile: any): Job[] => {
    const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Tesla', 'SpaceX'];
    const locations = ['Remote', 'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX'];

    // Get job title from profile
    const baseTitle = profile.workExperience.length > 0
      ? profile.workExperience[0].position
      : 'Software Engineer';

    const levels = ['Junior', 'Mid-Level', 'Senior', 'Lead', 'Principal'];

    return Array.from({ length: 20 }, (_, i) => ({
      id: `recommend-${i}`,
      title: `${levels[i % levels.length]} ${baseTitle}`,
      company: companies[i % companies.length],
      location: locations[i % locations.length],
      description: `We are seeking a talented professional to join our team. You will work on cutting-edge projects and collaborate with world-class engineers. Your background in ${profile.skills.length > 0 ? profile.skills[0].skills.slice(0, 3).join(', ') : 'technology'} would be a great fit.`,
      url: `https://example.com/jobs/${i}`,
      salary: `$${80 + i * 10}k - $${120 + i * 10}k`,
      postedDate: new Date(Date.now() - i * 86400000).toISOString(),
      source: 'Recommended',
      matchScore: 100 - i * 5
    }));
  };

  const searchJobs = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a job title or keyword');
      return;
    }

    setIsSearching(true);
    setError(null);
    setShowRecommended(false);

    try {
      // Using TheirStack API
      const response = await fetch('https://api.theirstack.com/v1/jobs/search', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhLmNvbXBhbnkuaWRlYS5mb3Iuc2FuZGJveEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6InVzZXIiLCJjcmVhdGVkX2F0IjoiMjAyNS0xMC0wM1QwMjoyNzowMi4yOTM4MjYrMDA6MDAifQ.Bh8e7hbXhdaXT60OcnZgBJG1wCzoGrdF8sKWCItWGBo'
        },
        body: JSON.stringify({
          page: 0,
          limit: 50,
          posted_at_max_age_days: 30,
          blur_company_data: false,
          order_by: [
            {
              desc: true,
              field: 'date_posted'
            }
          ],
          job_country_code_or: ['US'],
          include_total_results: false,
          job_title_or: [searchQuery],
          ...(locationQuery && { job_location_pattern_or: [locationQuery] })
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs from TheirStack API');
      }

      const data = await response.json();

      console.log('TheirStack API Response:', data);

      // Check if we have data
      if (!data || !data.data || data.data.length === 0) {
        setError('No jobs found. Try different keywords or location.');
        setJobs([]);
        return;
      }

      console.log('First job sample:', data.data[0]);

      // Transform TheirStack data to our format
      const transformedJobs: Job[] = data.data.map((job: any) => {
        console.log('Processing job:', job);

        return {
          id: job.id || Math.random().toString(),
          title: job.job_title || job.title || 'No title',
          company: job.company?.name || job.company_name || job.company || 'Unknown Company',
          location: job.job_location || job.location || 'Not specified',
          description: job.job_description || job.description || 'No description available',
          url: job.job_url || job.url || job.application_url || '#',
          salary: job.salary_range || job.salary || job.compensation || 'Not specified',
          postedDate: job.posted_at || job.date_posted || job.created_at || new Date().toISOString(),
          source: 'TheirStack'
        };
      });

      console.log('Transformed jobs:', transformedJobs);
      setJobs(transformedJobs);
    } catch (err) {
      console.error('Job search error:', err);
      setError('Failed to search jobs. Please try again.');

      // Fallback to mock data for demonstration
      setJobs(generateMockJobs(searchQuery));
    } finally {
      setIsSearching(false);
    }
  };

  const generateMockJobs = (query: string): Job[] => {
    const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Tesla', 'SpaceX'];
    const locations = ['Remote', 'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX'];

    return Array.from({ length: 20 }, (_, i) => ({
      id: `mock-${i}`,
      title: `${query} - Level ${Math.floor(i / 4) + 1}`,
      company: companies[i % companies.length],
      location: locations[i % locations.length],
      description: `We are seeking a talented ${query} to join our team. You will work on cutting-edge projects and collaborate with world-class engineers. Requirements include strong technical skills, excellent communication, and a passion for innovation.`,
      url: `https://example.com/jobs/${i}`,
      salary: `$${80 + i * 10}k - $${120 + i * 10}k`,
      postedDate: new Date(Date.now() - i * 86400000).toISOString(),
      source: 'Mock Data'
    }));
  };

  const filteredJobs = jobs.filter(job => {
    // Network filter - only show companies where you have connections
    if (networkFilter && !NetworkService.hasConnectionAt(job.company)) {
      return false;
    }

    // Title filter
    if (titleFilter.trim() !== '' && !job.title.toLowerCase().includes(titleFilter.toLowerCase())) {
      return false;
    }

    // Company filter
    if (companyFilter.trim() !== '' && !job.company.toLowerCase().includes(companyFilter.toLowerCase())) {
      return false;
    }

    // Location filter
    if (locationFilter.trim() !== '' && !job.location.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }

    // Salary filter
    if (salaryFilter !== 'all') {
      const salaryStr = job.salary?.toLowerCase() || '';
      const salaryNum = parseInt(salaryStr.replace(/\D/g, '')) || 0;

      if (salaryFilter === 'high' && salaryNum < 120000) return false;
      if (salaryFilter === 'medium' && (salaryNum < 80000 || salaryNum > 120000)) return false;
      if (salaryFilter === 'low' && salaryNum > 80000) return false;
    }

    // Date filter
    if (dateFilter !== 'all') {
      const postedDate = new Date(job.postedDate);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dateFilter === 'today' && diffDays > 0) return false;
      if (dateFilter === 'week' && diffDays > 7) return false;
      if (dateFilter === 'month' && diffDays > 30) return false;
    }

    return true;
  });

  const clearFilters = () => {
    setTitleFilter('');
    setCompanyFilter('');
    setLocationFilter('');
    setSalaryFilter('all');
    setDateFilter('all');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ padding: '20px' }}>
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1f2937' }}>🔍 Job Search</h2>
          <button
            className="btn btn-primary"
            onClick={getRecommendedJobs}
            disabled={isSearching || !profileData}
            style={{ fontSize: '14px', padding: '8px 16px', whiteSpace: 'nowrap' }}
          >
            {isSearching && showRecommended ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                Finding matches...
              </>
            ) : (
              '✨ Recommended Jobs for You'
            )}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '10px', marginBottom: '15px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Job Title or Keywords</label>
            <input
              type="text"
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., Software Engineer, Product Manager"
              onKeyPress={(e) => e.key === 'Enter' && searchJobs()}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Location (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="e.g., Remote, San Francisco"
              onKeyPress={(e) => e.key === 'Enter' && searchJobs()}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-primary"
              onClick={searchJobs}
              disabled={isSearching}
              style={{ height: '42px', whiteSpace: 'nowrap' }}
            >
              {isSearching ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                  Searching...
                </>
              ) : (
                '🔍 Search Jobs'
              )}
            </button>
          </div>
        </div>

        {jobs.length > 0 && (
          <>
            <div style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '15px',
              marginTop: '15px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#374151' }}>🔧 Filters</h3>
                <button
                  className="btn btn-secondary"
                  onClick={clearFilters}
                  style={{ fontSize: '13px', padding: '6px 12px' }}
                >
                  Clear All Filters
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Job Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={titleFilter}
                    onChange={(e) => setTitleFilter(e.target.value)}
                    placeholder="Filter by title..."
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Company</label>
                  <input
                    type="text"
                    className="form-input"
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    placeholder="Filter by company..."
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    placeholder="Filter by location..."
                  />
                </div>
              </div>

              {/* Network Filter Toggle */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px', background: networkFilter ? '#ecfdf5' : '#f9fafb', borderRadius: '8px', border: `2px solid ${networkFilter ? '#10b981' : '#e5e7eb'}` }}>
                  <input
                    type="checkbox"
                    checked={networkFilter}
                    onChange={(e) => setNetworkFilter(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '500', color: networkFilter ? '#10b981' : '#6b7280' }}>
                    🤝 Only show companies where I have connections
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                  <label className="form-label">Salary Range</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className={salaryFilter === 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
                      onClick={() => setSalaryFilter('all')}
                      style={{ fontSize: '13px', padding: '6px 12px', flex: 1 }}
                    >
                      All
                    </button>
                    <button
                      className={salaryFilter === 'low' ? 'btn btn-primary' : 'btn btn-secondary'}
                      onClick={() => setSalaryFilter('low')}
                      style={{ fontSize: '13px', padding: '6px 12px', flex: 1 }}
                    >
                      &lt;$80k
                    </button>
                    <button
                      className={salaryFilter === 'medium' ? 'btn btn-primary' : 'btn btn-secondary'}
                      onClick={() => setSalaryFilter('medium')}
                      style={{ fontSize: '13px', padding: '6px 12px', flex: 1 }}
                    >
                      $80k-$120k
                    </button>
                    <button
                      className={salaryFilter === 'high' ? 'btn btn-primary' : 'btn btn-secondary'}
                      onClick={() => setSalaryFilter('high')}
                      style={{ fontSize: '13px', padding: '6px 12px', flex: 1 }}
                    >
                      &gt;$120k
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                  <label className="form-label">Posted Date</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className={dateFilter === 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
                      onClick={() => setDateFilter('all')}
                      style={{ fontSize: '13px', padding: '6px 12px', flex: 1 }}
                    >
                      All Time
                    </button>
                    <button
                      className={dateFilter === 'today' ? 'btn btn-primary' : 'btn btn-secondary'}
                      onClick={() => setDateFilter('today')}
                      style={{ fontSize: '13px', padding: '6px 12px', flex: 1 }}
                    >
                      Today
                    </button>
                    <button
                      className={dateFilter === 'week' ? 'btn btn-primary' : 'btn btn-secondary'}
                      onClick={() => setDateFilter('week')}
                      style={{ fontSize: '13px', padding: '6px 12px', flex: 1 }}
                    >
                      This Week
                    </button>
                    <button
                      className={dateFilter === 'month' ? 'btn btn-primary' : 'btn btn-secondary'}
                      onClick={() => setDateFilter('month')}
                      style={{ fontSize: '13px', padding: '6px 12px', flex: 1 }}
                    >
                      This Month
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {error && (
          <div style={{
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            marginTop: '15px'
          }}>
            {error}
          </div>
        )}
      </div>

      {jobs.length > 0 && (
        <div className="card">
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#1f2937' }}>
                Found {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'}
              </h3>
              {filteredJobs.length < jobs.length && (
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Filtered from {jobs.length} total results
                </span>
              )}
            </div>

            {/* Active filters display */}
            {(titleFilter || companyFilter || locationFilter || salaryFilter !== 'all' || dateFilter !== 'all') && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Active filters:</span>
                {titleFilter && (
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}>
                    Title: {titleFilter}
                  </span>
                )}
                {companyFilter && (
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}>
                    Company: {companyFilter}
                  </span>
                )}
                {locationFilter && (
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}>
                    Location: {locationFilter}
                  </span>
                )}
                {salaryFilter !== 'all' && (
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}>
                    Salary: {salaryFilter === 'low' ? '<$80k' : salaryFilter === 'medium' ? '$80k-$120k' : '>$120k'}
                  </span>
                )}
                {dateFilter !== 'all' && (
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}>
                    Posted: {dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'This Week' : 'This Month'}
                  </span>
                )}
              </div>
            )}
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredJobs.map((job: any) => (
              <div
                key={job.id}
                className="profile-item"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid #e5e7eb',
                  ':hover': { borderColor: '#3b82f6' },
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.backgroundColor = '#f0f9ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = '#fafafa';
                }}
                onClick={() => onJobSelect(job)}
              >
                {showRecommended && job.matchScore !== undefined && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: job.matchScore > 70 ? '#d1fae5' : job.matchScore > 40 ? '#fef3c7' : '#fee2e2',
                    color: job.matchScore > 70 ? '#065f46' : job.matchScore > 40 ? '#92400e' : '#991b1b',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {job.matchScore > 70 ? '🔥' : job.matchScore > 40 ? '👍' : '💡'} {job.matchScore}% Match
                  </div>
                )}
                <div style={{ marginBottom: '8px' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#1f2937', fontSize: '16px' }}>
                    {job.title}
                  </h4>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    <strong>{job.company}</strong> • {job.location}
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px', lineHeight: '1.4' }}>
                  {job.description.substring(0, 200)}...
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ color: '#059669', fontWeight: '500' }}>💰 {job.salary}</span>
                    <span style={{ color: '#6b7280' }}>📅 {formatDate(job.postedDate)}</span>
                    <span style={{ color: '#6b7280' }}>🔗 {job.source}</span>
                  </div>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToApplicationTracker(job);
                      window.open(job.url, '_blank');
                    }}
                  >
                    View Job →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isSearching && jobs.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          <h3 style={{ marginBottom: '10px' }}>🔍 Find Your Next Opportunity</h3>
          <p>Enter a job title or keywords to search across job boards</p>
        </div>
      )}
    </div>
  );
};

export default JobSearch;
