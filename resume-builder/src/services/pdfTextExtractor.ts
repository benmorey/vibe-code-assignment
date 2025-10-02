import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProfileData } from '../types';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export class PDFTextExtractor {
  private genAI: GoogleGenerativeAI;
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
    console.log('PDF Extractor - API Key loaded:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'NOT FOUND');

    if (!this.apiKey) {
      throw new Error('Google AI API key not found. Please set VITE_GEMINI_API_KEY or VITE_GOOGLE_API_KEY in your .env file');
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey);
    console.log('GoogleGenerativeAI instance created with key:', this.apiKey.substring(0, 10) + '...');
  }

  async extractTextFromPDF(file: File): Promise<string> {
    try {
      console.log('Starting PDF text extraction...');

      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer();
      console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);

      // Load PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log(`PDF loaded. Pages: ${pdf.numPages}`);

      let fullText = '';

      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`Processing page ${pageNum}...`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ') + '\n\n';

        fullText += pageText;
      }

      console.log('PDF text extraction complete. Text length:', fullText.length);
      console.log('=== EXTRACTED PDF TEXT ===');
      console.log(fullText.substring(0, 1000) + (fullText.length > 1000 ? '\n...[truncated]' : ''));
      console.log('=== END EXTRACTED PDF TEXT ===');
      return fullText;

    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF. Please try a different file.');
    }
  }

  async parseTextToProfile(text: string): Promise<Partial<ProfileData>> {
    try {
      console.log('Using Google AI to parse extracted text to profile data...');

      // Use the latest Gemini 2.0 Flash model
      console.log('Creating model instance...');
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192,
        }
      });
      console.log('Model instance created successfully with gemini-2.0-flash-exp');

      const prompt = `
Parse this resume text and extract structured information. Return ONLY valid JSON in the following exact format:

{
  "personalInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "city, state/country",
    "linkedin": "linkedin profile url (if found)",
    "portfolio": "portfolio/website url (if found)"
  },
  "aboutMe": "Brief professional summary or objective statement",
  "education": [
    {
      "id": "unique_id",
      "institution": "University/School Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "startDate": "YYYY or MM/YYYY",
      "endDate": "YYYY or MM/YYYY or Present",
      "gpa": "GPA if mentioned",
      "description": "Any additional details"
    }
  ],
  "workExperience": [
    {
      "id": "unique_id",
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "YYYY or MM/YYYY",
      "endDate": "YYYY or MM/YYYY or Present",
      "location": "City, State/Country",
      "description": ["Bullet point 1", "Bullet point 2", "Bullet point 3"]
    }
  ],
  "projects": [
    {
      "id": "unique_id",
      "name": "Project Name",
      "description": "Project description",
      "technologies": ["Tech1", "Tech2", "Tech3"],
      "link": "project url if available",
      "startDate": "YYYY or MM/YYYY",
      "endDate": "YYYY or MM/YYYY or Present"
    }
  ],
  "volunteerWork": [
    {
      "id": "unique_id",
      "organization": "Organization Name",
      "role": "Volunteer Role",
      "startDate": "YYYY or MM/YYYY",
      "endDate": "YYYY or MM/YYYY or Present",
      "description": "Description of volunteer work"
    }
  ],
  "skills": [
    {
      "id": "unique_id",
      "category": "Category Name (e.g., Programming Languages, Tools, etc.)",
      "skills": ["Skill1", "Skill2", "Skill3"]
    }
  ]
}

Instructions:
- Extract ALL available information accurately
- For IDs, use format like "exp_1", "edu_1", "proj_1", etc.
- Group skills into logical categories (Programming Languages, Frameworks, Tools, etc.)
- Convert job descriptions into clear bullet points
- Use consistent date formats (prefer MM/YYYY)
- If information is missing, use empty strings or empty arrays
- Ensure all JSON is valid and properly formatted
- Return ONLY the JSON object, no additional text

Resume Text:
${text}
`;

      console.log('Sending request to Google AI...');
      console.log('API Key (first 10 chars):', this.apiKey.substring(0, 10));
      console.log('GoogleGenerativeAI instance API key available:', !!this.apiKey);
      console.log('Prompt being sent to AI:', prompt.substring(0, 500) + '...[truncated]');

      console.log('Proceeding with resume parsing request...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      console.log('=== RAW AI RESPONSE ===');
      console.log(responseText);
      console.log('=== END RAW AI RESPONSE ===');

      // Extract JSON from the response
      let jsonText = responseText.trim();

      console.log('Raw response length:', responseText.length);
      console.log('Initial jsonText:', jsonText.substring(0, 200) + '...[truncated]');

      // Remove any markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        console.log('Removing ```json markdown blocks...');
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        console.log('Removing ``` markdown blocks...');
        jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      // Try to find JSON object
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('Found JSON match using regex...');
        jsonText = jsonMatch[0];
      }

      console.log('=== CLEANED JSON TEXT ===');
      console.log(jsonText);
      console.log('=== END CLEANED JSON TEXT ===');

      console.log('Attempting to parse JSON...');
      const parsedData = JSON.parse(jsonText);

      console.log('=== PARSED DATA STRUCTURE ===');
      console.log('Personal Info:', parsedData.personalInfo);
      console.log('About Me:', parsedData.aboutMe);
      console.log('Education count:', parsedData.education?.length || 0);
      console.log('Work Experience count:', parsedData.workExperience?.length || 0);
      console.log('Projects count:', parsedData.projects?.length || 0);
      console.log('Skills count:', parsedData.skills?.length || 0);
      console.log('Volunteer Work count:', parsedData.volunteerWork?.length || 0);
      console.log('=== END PARSED DATA STRUCTURE ===');

      console.log('✅ AI-powered profile parsing complete!');
      return parsedData;

    } catch (error) {
      console.error('Error using AI to parse resume:', error);
      console.log('Falling back to basic text parsing...');

      // Fallback to basic parsing if AI fails
      return this.fallbackParseTextToProfile(text);
    }
  }

  private fallbackParseTextToProfile(text: string): Partial<ProfileData> {
    console.log('Using fallback text parsing...');

    const profile: Partial<ProfileData> = {
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        portfolio: ''
      },
      aboutMe: '',
      education: [],
      workExperience: [],
      projects: [],
      volunteerWork: [],
      skills: []
    };

    // Basic regex-based extraction (simplified version of original)
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      profile.personalInfo!.email = emailMatch[0];
    }

    const phoneRegex = /(\+?1?[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      profile.personalInfo!.phone = phoneMatch[0];
    }

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    for (const line of lines) {
      if (line.length > 3 &&
          !emailRegex.test(line) &&
          !phoneRegex.test(line) &&
          !line.toLowerCase().includes('resume') &&
          line.split(' ').length <= 4) {
        profile.personalInfo!.name = line;
        break;
      }
    }

    return profile;
  }

}