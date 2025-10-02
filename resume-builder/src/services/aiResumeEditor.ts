import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProfileData } from '../types';

export interface ResumeImprovementSuggestion {
  section: string;
  original: string;
  improved: string;
  reason: string;
  impact: 'low' | 'medium' | 'high';
}

export interface ResumeAnalysis {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: ResumeImprovementSuggestion[];
  improvedProfile: ProfileData;
}

export interface DetailedResumeAnalysis {
  overallScore: number;
  sectionScores: {
    personalInfo: number;
    aboutMe: number;
    workExperience: number;
    education: number;
    skills: number;
    projects: number;
  };
  keywordMatches: {
    jobKeywords: string[];
    matched: string[];
    missing: string[];
    matchPercentage: number;
  };
  measurements: {
    totalWords: number;
    quantifiedAchievements: number;
    actionVerbs: number;
    technicalSkills: number;
    relevantExperience: number;
  };
  criticalIssues: string[];
  improvements: ResumeImprovementSuggestion[];
  improvedProfile: ProfileData;
  atsCompatibility: number;
  relevanceScore: number;
}

export interface CoverLetterAnalysis {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improvedCoverLetter: string;
}

export class AIResumeEditor {
  private genAI: GoogleGenerativeAI;
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
    console.log('AI Resume Editor - API Key loaded:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'NOT FOUND');

    if (!this.apiKey) {
      throw new Error('Google AI API key not found. Please set VITE_GEMINI_API_KEY or VITE_GOOGLE_API_KEY in your .env file');
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  async analyzeAndImproveResume(profileData: ProfileData, targetJob?: string): Promise<ResumeAnalysis> {
    try {
      console.log('Starting AI resume analysis and improvement...');

      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.3,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 8192,
        }
      });

      const targetJobContext = targetJob ? `Target Job: ${targetJob}` : 'General resume improvement';

      const prompt = `
You are an expert resume writer and career coach. Analyze this resume and provide comprehensive improvement suggestions.

${targetJobContext}

Current Resume Data:
${JSON.stringify(profileData, null, 2)}

Please analyze this resume and return ONLY valid JSON in the following format:

{
  "overallScore": 85,
  "strengths": [
    "Strong technical skills section",
    "Quantified achievements in work experience"
  ],
  "weaknesses": [
    "Weak professional summary",
    "Missing keywords for target role"
  ],
  "suggestions": [
    {
      "section": "aboutMe",
      "original": "Current about me text",
      "improved": "Enhanced about me text with stronger impact",
      "reason": "Why this improvement helps",
      "impact": "high"
    }
  ],
  "improvedProfile": {
    // Complete improved ProfileData object with all sections enhanced
    "personalInfo": {
      "name": "Enhanced name presentation",
      "email": "same email",
      "phone": "same phone",
      "location": "same location",
      "linkedin": "same linkedin",
      "portfolio": "same portfolio"
    },
    "aboutMe": "Improved professional summary that is compelling and ATS-friendly",
    "education": [
      // Enhanced education entries with better descriptions
    ],
    "workExperience": [
      // Enhanced work experience with stronger action verbs, quantified results, and relevant keywords
    ],
    "projects": [
      // Enhanced projects with clearer impact and technical details
    ],
    "volunteerWork": [
      // Enhanced volunteer work descriptions
    ],
    "skills": [
      // Reorganized and enhanced skills with better categorization
    ]
  }
}

Instructions:
- Provide an overall score out of 100
- Identify 3-5 key strengths and weaknesses
- Give specific improvement suggestions for each major section
- Enhance ALL content to be more impactful, ATS-friendly, and professional
- Use strong action verbs and quantify achievements where possible
- Improve formatting and organization
- Add relevant keywords for the target job (if specified)
- Make descriptions more compelling and results-oriented
- Ensure consistent formatting and professional tone
- Preserve all original data structure and IDs
- Return ONLY the JSON object, no additional text

Focus on making the resume:
1. More impactful and results-driven
2. ATS (Applicant Tracking System) friendly
3. Tailored to the target role (if specified)
4. Professional and polished
5. Keyword-optimized
`;

      console.log('Sending resume analysis request to AI...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      console.log('=== AI RESUME ANALYSIS RESPONSE ===');
      console.log(responseText);
      console.log('=== END AI RESPONSE ===');

      // Parse the JSON response
      let jsonText = responseText.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      // Extract JSON object
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      console.log('Parsing AI analysis JSON...');
      const analysis = JSON.parse(jsonText);

      console.log('✅ AI resume analysis complete!');
      console.log('Overall Score:', analysis.overallScore);
      console.log('Suggestions count:', analysis.suggestions?.length || 0);

      return analysis;

    } catch (error) {
      console.error('Error in AI resume analysis:', error);
      throw new Error('Failed to analyze and improve resume. Please try again.');
    }
  }

  async improveSpecificSection(
    sectionName: string,
    sectionData: any,
    context: ProfileData,
    targetJob?: string
  ): Promise<any> {
    try {
      console.log(`Improving specific section: ${sectionName}`);

      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        }
      });

      const targetJobContext = targetJob ? `Target Job: ${targetJob}` : 'General improvement';

      const prompt = `
You are an expert resume writer. Improve this specific section of a resume.

${targetJobContext}

Section to improve: ${sectionName}
Current section data: ${JSON.stringify(sectionData, null, 2)}
Full resume context: ${JSON.stringify(context, null, 2)}

Please return ONLY the improved section data in the same JSON format, with:
- Stronger action verbs
- Quantified achievements where possible
- Better keyword optimization
- More professional and impactful language
- ATS-friendly formatting
- Relevant skills and technologies highlighted

Return ONLY the improved JSON data for this section, no additional text.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Parse the JSON response
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      const jsonMatch = jsonText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const improvedSection = JSON.parse(jsonText);
      console.log(`✅ Section ${sectionName} improved successfully`);

      return improvedSection;

    } catch (error) {
      console.error(`Error improving section ${sectionName}:`, error);
      throw new Error(`Failed to improve ${sectionName} section. Please try again.`);
    }
  }

  async generateJobSpecificResume(profileData: ProfileData, jobDescription: string): Promise<ProfileData> {
    try {
      console.log('Generating job-specific resume...');

      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 8192,
        }
      });

      const prompt = `
You are an expert ATS (Applicant Tracking System) specialist and resume writer.
Tailor this resume specifically for the following job description.

Job Description:
${jobDescription}

Current Resume:
${JSON.stringify(profileData, null, 2)}

Return ONLY a complete ProfileData JSON object that is optimized for this specific job:

1. Extract key requirements and skills from the job description
2. Highlight relevant experience and skills
3. Add missing keywords naturally throughout the resume
4. Reorder sections and bullet points to emphasize most relevant items first
5. Enhance descriptions to match job requirements
6. Ensure high ATS compatibility
7. Maintain professional tone and factual accuracy

Return ONLY the complete improved ProfileData JSON object, no additional text.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Parse the JSON response
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const optimizedProfile = JSON.parse(jsonText);
      console.log('✅ Job-specific resume generated successfully');

      return optimizedProfile;

    } catch (error) {
      console.error('Error generating job-specific resume:', error);
      throw new Error('Failed to generate job-specific resume. Please try again.');
    }
  }

  async generateEnhancedCoverLetter(profileData: ProfileData, jobDescription: string, companyName?: string): Promise<string> {
    try {
      console.log('Generating enhanced cover letter...');

      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.4,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 4096,
        }
      });

      const prompt = `
You are an expert cover letter writer and career coach. Create a compelling, personalized cover letter.

Profile Data:
${JSON.stringify(profileData, null, 2)}

Job Description:
${jobDescription}

${companyName ? `Company Name: ${companyName}` : ''}

Create a professional cover letter that:
1. Opens with a strong, attention-grabbing hook
2. Demonstrates clear understanding of the role and company
3. Highlights most relevant experience and achievements from the profile
4. Shows genuine enthusiasm and cultural fit
5. Includes specific examples with quantified results where possible
6. Ends with a confident call to action
7. Uses professional yet personable tone
8. Is ATS-friendly and well-formatted
9. Is approximately 3-4 paragraphs, 250-400 words

Format the response as a complete cover letter with proper structure.
Return ONLY the cover letter text, no additional commentary.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const coverLetter = response.text().trim();

      console.log('✅ Enhanced cover letter generated successfully');
      return coverLetter;

    } catch (error) {
      console.error('Error generating enhanced cover letter:', error);
      throw new Error('Failed to generate cover letter. Please try again.');
    }
  }

  async analyzeCoverLetter(coverLetter: string, jobDescription: string, profileData: ProfileData): Promise<CoverLetterAnalysis> {
    try {
      console.log('Starting cover letter analysis...');

      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        }
      });

      const prompt = `
You are an expert hiring manager and cover letter analyst. Analyze this cover letter and provide comprehensive feedback.

Cover Letter:
${coverLetter}

Job Description:
${jobDescription}

Profile Context:
${JSON.stringify(profileData, null, 2)}

Analyze the cover letter and return ONLY valid JSON in this format:

{
  "overallScore": 85,
  "strengths": [
    "Strong opening that captures attention",
    "Specific examples with quantified results"
  ],
  "weaknesses": [
    "Could better address company culture fit",
    "Missing reference to specific job requirements"
  ],
  "suggestions": [
    "Add a specific example of leadership experience",
    "Include mention of the company's recent achievements",
    "Strengthen the call to action in the closing"
  ],
  "improvedCoverLetter": "Complete improved version of the cover letter with all suggestions applied"
}

Instructions:
- Score out of 100 based on: relevance, personalization, impact, professionalism, ATS-friendliness
- Identify 3-5 key strengths and areas for improvement
- Provide specific, actionable suggestions
- Create an improved version that addresses all weaknesses
- Ensure the improved version maintains the original tone and personality
- Return ONLY the JSON object, no additional text
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Parse JSON response
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const analysis = JSON.parse(jsonText);
      console.log('✅ Cover letter analysis complete!');
      console.log('Overall Score:', analysis.overallScore);

      return analysis;

    } catch (error) {
      console.error('Error analyzing cover letter:', error);
      throw new Error('Failed to analyze cover letter. Please try again.');
    }
  }

  async improveCoverLetter(coverLetter: string, jobDescription: string, profileData: ProfileData, specificFeedback?: string): Promise<string> {
    try {
      console.log('Improving cover letter...');

      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.3,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 4096,
        }
      });

      const prompt = `
You are an expert cover letter writer. Improve this cover letter to be more compelling and effective.

Current Cover Letter:
${coverLetter}

Job Description:
${jobDescription}

Profile Context:
${JSON.stringify(profileData, null, 2)}

${specificFeedback ? `Specific Feedback to Address: ${specificFeedback}` : ''}

Improve the cover letter by:
1. Strengthening the opening hook
2. Adding more specific, quantified examples
3. Better aligning with job requirements
4. Improving flow and readability
5. Enhancing the closing call to action
6. Ensuring ATS-friendly language
7. Maintaining professional yet personable tone

Return ONLY the improved cover letter text, no additional commentary.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const improvedLetter = response.text().trim();

      console.log('✅ Cover letter improved successfully');
      return improvedLetter;

    } catch (error) {
      console.error('Error improving cover letter:', error);
      throw new Error('Failed to improve cover letter. Please try again.');
    }
  }

  async analyzeResumeDetailed(profileData: ProfileData, jobDescription: string): Promise<DetailedResumeAnalysis> {
    try {
      console.log('Starting detailed resume analysis with harsh grading...');

      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.0, // Make completely deterministic
          topP: 1.0,
          topK: 1,
          maxOutputTokens: 8192,
        }
      });

      const prompt = `
You are an ATS (Applicant Tracking System) software analyzing a resume. Be CONSISTENT and SYSTEMATIC like real ATS software.

STEP 1: Extract all keywords from job description
STEP 2: Count exact matches in resume (case-insensitive)
STEP 3: Calculate scores using FIXED formulas
STEP 4: Be brutally honest about what HR filters would catch

Job Description:
${jobDescription}

Resume Data:
${JSON.stringify(profileData, null, 2)}

RETURN ONLY VALID JSON:

{
  "overallScore": 42,
  "sectionScores": {
    "personalInfo": 85,
    "aboutMe": 25,
    "workExperience": 45,
    "education": 70,
    "skills": 30,
    "projects": 55
  },
  "keywordMatches": {
    "jobKeywords": ["ALL keywords extracted from job description"],
    "matched": ["Keywords found in resume"],
    "missing": ["Keywords NOT found in resume"],
    "matchPercentage": 35
  },
  "measurements": {
    "totalWords": 247,
    "quantifiedAchievements": 1,
    "actionVerbs": 6,
    "technicalSkills": 8,
    "relevantExperience": 2
  },
  "criticalIssues": [
    "ZERO quantified achievements with numbers/percentages",
    "Missing 65% of required keywords - ATS auto-reject",
    "Summary contains no job-specific terms",
    "Experience lacks metrics that prove impact",
    "Skills section missing 8 required technologies"
  ],
  "improvements": [
    {
      "section": "aboutMe",
      "original": "Current weak summary",
      "improved": "Enhanced summary with job keywords and impact",
      "reason": "Why this improvement helps with ATS and hiring managers",
      "impact": "high"
    }
  ],
  "improvedProfile": {
    "personalInfo": {
      "name": "Same name",
      "email": "Same email",
      "phone": "Same phone",
      "location": "Same location",
      "linkedin": "Same linkedin",
      "portfolio": "Same portfolio"
    },
    "aboutMe": "IMPROVED summary with job keywords, quantified achievements, and compelling value proposition",
    "education": [
      // ENHANCED education entries with better descriptions
    ],
    "workExperience": [
      // ENHANCED work experience with stronger action verbs, quantified results, and relevant keywords from job description
    ],
    "projects": [
      // ENHANCED projects with clearer impact, technical details, and job-relevant keywords
    ],
    "volunteerWork": [
      // ENHANCED volunteer work descriptions with impact and relevance
    ],
    "skills": [
      // REORGANIZED and ENHANCED skills with missing keywords added and better categorization
    ]
  },
  "atsCompatibility": 28,
  "relevanceScore": 35
}

SCORING FORMULAS (APPLY CONSISTENTLY):
1. Keyword Match %: (matched keywords / total job keywords) * 100
2. ATS Score: (keyword% * 0.4) + (quantified achievements * 10) + (action verbs * 2)
3. Relevance Score: (keyword% * 0.6) + (relevant experience years * 10)
4. Overall Score: Average of all section scores

CRITICAL ISSUES RULES:
- If quantified achievements = 0: "ZERO quantified achievements"
- If keyword match < 40%: "Missing X% of required keywords - ATS auto-reject"
- If no action verbs: "No strong action verbs - appears passive"
- If skills don't match: "Skills section missing X required technologies"

COUNT EVERYTHING EXACTLY:
- Words: Count all words in resume text
- Quantified: Count numbers, %, $, metrics in descriptions
- Action verbs: Count strong verbs starting bullet points
- Tech skills: Count technical terms mentioned

BE CONSISTENT - Same resume = Same scores every time.

CRITICAL: You MUST generate the complete "improvedProfile" section with:
1. ALL sections enhanced with missing keywords naturally integrated
2. Quantified achievements added where possible (numbers, %, $, metrics)
3. Stronger action verbs in work experience
4. Better descriptions that match job requirements
5. Skills section reorganized with missing keywords added
6. Preserve ALL original IDs and structure
7. Return the COMPLETE ProfileData object, not abbreviated

The improved profile will be applied directly to the user's resume, so make it comprehensive and job-ready.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      console.log('=== DETAILED ANALYSIS RESPONSE ===');
      console.log(responseText);
      console.log('=== END DETAILED ANALYSIS ===');

      // Parse JSON response
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const analysis = JSON.parse(jsonText);
      console.log('✅ Detailed analysis complete!');
      console.log('Overall Score:', analysis.overallScore);
      console.log('Critical Issues:', analysis.criticalIssues?.length || 0);
      console.log('Has improved profile:', !!analysis.improvedProfile);
      console.log('Improved profile keys:', analysis.improvedProfile ? Object.keys(analysis.improvedProfile) : 'none');

      return analysis;

    } catch (error) {
      console.error('Error in detailed resume analysis:', error);
      throw new Error('Failed to analyze resume. Please try again.');
    }
  }
}