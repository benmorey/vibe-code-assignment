import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProfileData } from '../types';

export interface ComparisonResult {
  overallScore: number;
  sections: {
    skills: {
      score: number;
      matchedSkills: string[];
      missingSkills: string[];
      feedback: string;
    };
    experience: {
      score: number;
      relevantExperience: string[];
      missingExperience: string[];
      feedback: string;
    };
    education: {
      score: number;
      relevantEducation: string[];
      missingRequirements: string[];
      feedback: string;
    };
    keywords: {
      score: number;
      matchedKeywords: string[];
      missingKeywords: string[];
      feedback: string;
    };
  };
  recommendations: string[];
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
}

export class ComparisonService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async compareResumeToJob(profileData: ProfileData, jobDescription: string): Promise<ComparisonResult> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const resumeText = this.formatProfileAsText(profileData);

    const prompt = `
You are an expert ATS (Applicant Tracking System) and recruiter. Analyze how well this resume matches the given job description and provide a detailed scoring breakdown.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Please provide a comprehensive analysis in the following JSON format:

{
  "overallScore": number (0-100),
  "sections": {
    "skills": {
      "score": number (0-100),
      "matchedSkills": ["skill1", "skill2"],
      "missingSkills": ["missing1", "missing2"],
      "feedback": "detailed feedback about skills alignment"
    },
    "experience": {
      "score": number (0-100),
      "relevantExperience": ["relevant experience 1", "relevant experience 2"],
      "missingExperience": ["missing experience type 1", "missing experience type 2"],
      "feedback": "detailed feedback about experience alignment"
    },
    "education": {
      "score": number (0-100),
      "relevantEducation": ["relevant degree/cert 1", "relevant degree/cert 2"],
      "missingRequirements": ["missing requirement 1", "missing requirement 2"],
      "feedback": "detailed feedback about education alignment"
    },
    "keywords": {
      "score": number (0-100),
      "matchedKeywords": ["keyword1", "keyword2"],
      "missingKeywords": ["missing1", "missing2"],
      "feedback": "detailed feedback about keyword optimization"
    }
  },
  "recommendations": [
    "specific recommendation 1",
    "specific recommendation 2",
    "specific recommendation 3"
  ],
  "grade": "letter grade (A+, A, B+, B, C+, C, D, F)"
}

Scoring Guidelines:
- 95-100: A+ (Exceptional match, highly qualified)
- 90-94: A (Strong match, well qualified)
- 85-89: B+ (Good match, qualified)
- 80-84: B (Decent match, mostly qualified)
- 75-79: C+ (Fair match, some qualifications)
- 70-74: C (Basic match, minimal qualifications)
- 60-69: D (Poor match, few qualifications)
- Below 60: F (Very poor match, not qualified)

Focus on:
1. Skills alignment with job requirements
2. Relevant work experience and achievements
3. Education/certification requirements
4. Industry keywords and terminology
5. Years of experience if specified
6. Specific tools/technologies mentioned

Provide actionable, specific recommendations for improvement.
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
      const parsedResult = JSON.parse(jsonText);

      return parsedResult;
    } catch (error) {
      console.error('Error comparing resume to job:', error);
      throw new Error('Failed to analyze resume compatibility. Please try again.');
    }
  }

  private formatProfileAsText(profile: ProfileData): string {
    let text = `PERSONAL INFORMATION:\n`;
    text += `Name: ${profile.personalInfo.name}\n`;
    text += `Email: ${profile.personalInfo.email}\n`;
    text += `Phone: ${profile.personalInfo.phone}\n`;
    text += `Location: ${profile.personalInfo.location}\n`;
    if (profile.personalInfo.linkedin) text += `LinkedIn: ${profile.personalInfo.linkedin}\n`;
    if (profile.personalInfo.portfolio) text += `Portfolio: ${profile.personalInfo.portfolio}\n`;

    if (profile.aboutMe) {
      text += `\nABOUT ME:\n${profile.aboutMe}\n`;
    }

    if (profile.workExperience.length > 0) {
      text += `\nWORK EXPERIENCE:\n`;
      profile.workExperience.forEach(exp => {
        text += `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate})\n`;
        text += `Location: ${exp.location}\n`;
        exp.description.forEach(desc => text += `• ${desc}\n`);
        text += `\n`;
      });
    }

    if (profile.education.length > 0) {
      text += `EDUCATION:\n`;
      profile.education.forEach(edu => {
        text += `${edu.degree} in ${edu.field} from ${edu.institution} (${edu.startDate} - ${edu.endDate})\n`;
        if (edu.gpa) text += `GPA: ${edu.gpa}\n`;
        if (edu.description) text += `${edu.description}\n`;
        text += `\n`;
      });
    }

    if (profile.projects.length > 0) {
      text += `PROJECTS:\n`;
      profile.projects.forEach(project => {
        text += `${project.name} (${project.startDate}${project.endDate ? ` - ${project.endDate}` : ''})\n`;
        text += `${project.description}\n`;
        text += `Technologies: ${project.technologies.join(', ')}\n`;
        if (project.link) text += `Link: ${project.link}\n`;
        text += `\n`;
      });
    }

    if (profile.skills.length > 0) {
      text += `SKILLS:\n`;
      profile.skills.forEach(skillGroup => {
        text += `${skillGroup.category}: ${skillGroup.skills.join(', ')}\n`;
      });
    }

    if (profile.volunteerWork.length > 0) {
      text += `\nVOLUNTEER WORK:\n`;
      profile.volunteerWork.forEach(vol => {
        text += `${vol.role} at ${vol.organization} (${vol.startDate}${vol.endDate ? ` - ${vol.endDate}` : ''})\n`;
        text += `${vol.description}\n\n`;
      });
    }

    return text;
  }

  getGradeColor(grade: string): string {
    switch (grade) {
      case 'A+':
      case 'A':
        return '#22c55e'; // green
      case 'B+':
      case 'B':
        return '#3b82f6'; // blue
      case 'C+':
      case 'C':
        return '#f59e0b'; // yellow
      case 'D':
        return '#f97316'; // orange
      case 'F':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  }

  getScoreColor(score: number): string {
    if (score >= 90) return '#22c55e'; // green
    if (score >= 80) return '#3b82f6'; // blue
    if (score >= 70) return '#f59e0b'; // yellow
    if (score >= 60) return '#f97316'; // orange
    return '#ef4444'; // red
  }
}