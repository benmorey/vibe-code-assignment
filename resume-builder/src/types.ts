export interface ProfileData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  aboutMe: string;
  education: EducationItem[];
  workExperience: WorkExperienceItem[];
  projects: ProjectItem[];
  volunteerWork: VolunteerItem[];
  skills: SkillItem[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface WorkExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  startDate: string;
  endDate?: string;
}

export interface VolunteerItem {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface SkillItem {
  id: string;
  category: string;
  skills: string[];
}

export type ExperienceType = 'education' | 'workExperience' | 'projects' | 'volunteerWork' | 'skills';