import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabaseClient';

export interface ParsedResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  aboutMe: string;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    description?: string;
  }>;
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    startDate: string;
    endDate?: string;
  }>;
  volunteerWork: Array<{
    organization: string;
    role: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  skills: Array<{
    category: string;
    skills: string[];
  }>;
}

export class ResumeParsingService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async uploadAndParseResume(file: File): Promise<ParsedResumeData> {
    try {
      // Upload file to Supabase Storage
      const fileName = `resume_${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Failed to upload resume: ${uploadError.message}`);
      }

      // Extract text from the uploaded file
      let resumeText: string;

      if (file.type === 'application/pdf') {
        resumeText = await this.extractTextFromPDF(file);
      } else if (file.type === 'text/plain') {
        resumeText = await this.extractTextFromTxt(file);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or TXT file.');
      }

      // Parse the resume text using AI
      const parsedData = await this.parseResumeWithAI(resumeText);

      // Store the parsed data in Supabase (optional)
      const { error: dbError } = await supabase
        .from('parsed_resumes')
        .insert({
          file_name: fileName,
          file_path: uploadData.path,
          parsed_data: parsedData,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.warn('Failed to store parsed data in database:', dbError.message);
        // Don't throw error here - the parsing was successful
      }

      return parsedData;
    } catch (error) {
      console.error('Error parsing resume:', error);
      throw error;
    }
  }

  private async extractTextFromPDF(file: File): Promise<string> {
    try {
      // For PDF parsing, we'll use a simple approach
      // In a production app, you might want to use a more robust PDF parser
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Convert to base64 for AI processing
      const base64 = btoa(String.fromCharCode(...uint8Array));

      // Use AI to extract text from PDF
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: file.type,
            data: base64
          }
        },
        "Extract all text content from this PDF resume. Return only the plain text content, no formatting or analysis."
      ]);

      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error('Failed to extract text from PDF. Please try a different format.');
    }
  }

  private async extractTextFromTxt(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }

  private async parseResumeWithAI(resumeText: string): Promise<ParsedResumeData> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
Parse this resume text and extract structured information. Return the data in the following JSON format:

{
  "personalInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "city, state/country",
    "linkedin": "linkedin profile url (if found)",
    "portfolio": "portfolio/website url (if found)"
  },
  "aboutMe": "professional summary or objective statement",
  "education": [
    {
      "institution": "University/School name",
      "degree": "Degree type (Bachelor's, Master's, etc.)",
      "field": "Field of study",
      "startDate": "YYYY or MM/YYYY",
      "endDate": "YYYY or MM/YYYY or 'Present'",
      "gpa": "GPA if mentioned",
      "description": "additional details if any"
    }
  ],
  "workExperience": [
    {
      "company": "Company name",
      "position": "Job title",
      "startDate": "YYYY or MM/YYYY",
      "endDate": "YYYY or MM/YYYY or 'Present'",
      "location": "city, state",
      "description": ["bullet point 1", "bullet point 2", "bullet point 3"]
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Project description",
      "technologies": ["tech1", "tech2", "tech3"],
      "link": "project url if mentioned",
      "startDate": "YYYY or MM/YYYY",
      "endDate": "YYYY or MM/YYYY (if mentioned)"
    }
  ],
  "volunteerWork": [
    {
      "organization": "Organization name",
      "role": "Volunteer role",
      "startDate": "YYYY or MM/YYYY",
      "endDate": "YYYY or MM/YYYY (if mentioned)",
      "description": "Description of volunteer work"
    }
  ],
  "skills": [
    {
      "category": "Technical Skills",
      "skills": ["skill1", "skill2", "skill3"]
    },
    {
      "category": "Programming Languages",
      "skills": ["language1", "language2"]
    }
  ]
}

Guidelines:
- Extract all available information from the resume
- Group skills into logical categories (Technical Skills, Programming Languages, Tools, etc.)
- For work experience, break down job descriptions into bullet points
- Use consistent date formats
- If information is missing, use empty strings or empty arrays
- Be thorough and accurate in extraction

Resume Text:
${resumeText}
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from the response
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse AI response');
      }

      const jsonText = jsonMatch[1] || jsonMatch[0];
      const parsedData = JSON.parse(jsonText);

      // Add unique IDs to all items
      this.addUniqueIds(parsedData);

      return parsedData;
    } catch (error) {
      console.error('Error parsing resume with AI:', error);
      throw new Error('Failed to parse resume content. Please try again or check the file format.');
    }
  }

  private addUniqueIds(data: ParsedResumeData): void {
    // Add IDs to education items
    data.education.forEach((item: any) => {
      item.id = this.generateId();
    });

    // Add IDs to work experience items
    data.workExperience.forEach((item: any) => {
      item.id = this.generateId();
    });

    // Add IDs to project items
    data.projects.forEach((item: any) => {
      item.id = this.generateId();
    });

    // Add IDs to volunteer work items
    data.volunteerWork.forEach((item: any) => {
      item.id = this.generateId();
    });

    // Add IDs to skill categories
    data.skills.forEach((item: any) => {
      item.id = this.generateId();
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async getUploadedResumes(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('parsed_resumes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching uploaded resumes:', error);
      return [];
    }
  }

  async deleteUploadedResume(fileName: string): Promise<void> {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .remove([fileName]);

      if (storageError) {
        console.warn('Error deleting from storage:', storageError.message);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('parsed_resumes')
        .delete()
        .eq('file_name', fileName);

      if (dbError) {
        console.warn('Error deleting from database:', dbError.message);
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }
}