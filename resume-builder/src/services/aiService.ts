import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProfileData } from '../types';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

if (!API_KEY) {
  console.warn('Google AI API key not found. Please set VITE_GOOGLE_API_KEY in your .env file');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

export async function generateCustomizedResume(profileData: ProfileData, jobDescription: string): Promise<ProfileData> {
  if (!API_KEY) {
    throw new Error('Google AI API key not configured. Please add VITE_GOOGLE_API_KEY to your .env file');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
You are an expert resume writer and career coach. I will provide you with a person's profile data and a job description. Your task is to customize the resume to better match the job requirements while keeping all information truthful and accurate.

PROFILE DATA:
${JSON.stringify(profileData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Please customize the resume by:
1. Rewriting the "About Me" section to emphasize skills and experience relevant to this specific job
2. Adjusting work experience descriptions to highlight relevant achievements and responsibilities
3. Reordering and emphasizing skills that match the job requirements
4. Modifying project descriptions to showcase relevant technologies and outcomes
5. Ensuring keywords from the job description are naturally incorporated

IMPORTANT RULES:
- Do NOT fabricate any experience, skills, or qualifications
- Do NOT change dates, company names, or degree information
- Only enhance and reframe existing information
- Keep the same JSON structure as provided
- Make the language more impactful and ATS-friendly
- Focus on quantifiable achievements when possible

Return ONLY the modified JSON object with the same structure as the input, with no additional text or explanations.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Clean the response to extract just the JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const customizedProfile = JSON.parse(jsonMatch[0]);

    // Validate that the structure is correct
    if (!customizedProfile.personalInfo || !customizedProfile.workExperience) {
      throw new Error('Invalid profile structure returned from AI');
    }

    return customizedProfile;
  } catch (error) {
    console.error('Error generating customized resume:', error);
    throw new Error('Failed to generate customized resume. Please try again.');
  }
}

export async function generateCoverLetter(profileData: ProfileData, jobDescription: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('Google AI API key not configured. Please add VITE_GOOGLE_API_KEY to your .env file');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
You are an expert cover letter writer. I will provide you with a person's profile data and a job description. Write a compelling, professional cover letter that demonstrates how the candidate's background aligns with the job requirements.

PROFILE DATA:
${JSON.stringify(profileData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Write a cover letter that:
1. Has a professional greeting (use "Hiring Manager" if no specific name is provided)
2. Opens with a strong hook that mentions the specific position
3. Highlights 2-3 most relevant experiences/achievements that match the job requirements
4. Shows enthusiasm for the company and role
5. Includes specific examples and quantifiable results when possible
6. Ends with a professional closing and call to action
7. Is approximately 3-4 paragraphs long
8. Uses keywords from the job description naturally
9. Maintains a confident but not arrogant tone

The letter should be formatted as plain text, ready to be copied into an email or document.

Do not include the candidate's address or the company's address - just the letter content.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return response.trim();
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error('Failed to generate cover letter. Please try again.');
  }
}