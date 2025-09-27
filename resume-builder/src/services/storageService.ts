import { ProfileData } from '../types';

const STORAGE_KEY = 'resumeProfile';
const BACKUP_PREFIX = 'resumeProfile_backup_';

export class StorageService {
  static saveProfile(profileData: ProfileData): void {
    try {
      // Save main profile
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));

      // Create backup with timestamp
      const timestamp = new Date().getTime();
      localStorage.setItem(`${BACKUP_PREFIX}${timestamp}`, JSON.stringify(profileData));

      // Clean up old backups (keep only last 5)
      this.cleanupBackups();

      console.log('Profile saved successfully at', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw new Error('Failed to save profile. Storage might be full.');
    }
  }

  static loadProfile(): ProfileData | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch (error) {
      console.error('Failed to load profile:', error);
      return null;
    }
  }

  static exportProfile(profileData: ProfileData): void {
    const dataStr = JSON.stringify(profileData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `resume_profile_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  static async importProfile(file: File): Promise<ProfileData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);

          // Validate the imported data structure
          if (this.validateProfileData(imported)) {
            resolve(imported);
          } else {
            reject(new Error('Invalid profile data structure'));
          }
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  static getBackups(): Array<{ timestamp: number; date: string }> {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(BACKUP_PREFIX)) {
        const timestamp = parseInt(key.replace(BACKUP_PREFIX, ''));
        backups.push({
          timestamp,
          date: new Date(timestamp).toLocaleString()
        });
      }
    }
    return backups.sort((a, b) => b.timestamp - a.timestamp);
  }

  static restoreBackup(timestamp: number): ProfileData | null {
    try {
      const backup = localStorage.getItem(`${BACKUP_PREFIX}${timestamp}`);
      if (backup) {
        const profileData = JSON.parse(backup);
        this.saveProfile(profileData);
        return profileData;
      }
      return null;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      return null;
    }
  }

  static clearAllData(): void {
    // Remove main profile and all backups
    Object.keys(localStorage)
      .filter(key => key === STORAGE_KEY || key.startsWith(BACKUP_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }

  private static cleanupBackups(): void {
    const backups = this.getBackups();
    if (backups.length > 5) {
      const toDelete = backups.slice(5);
      toDelete.forEach(backup => {
        localStorage.removeItem(`${BACKUP_PREFIX}${backup.timestamp}`);
      });
    }
  }

  private static validateProfileData(data: any): data is ProfileData {
    return (
      data &&
      typeof data === 'object' &&
      data.personalInfo &&
      typeof data.personalInfo === 'object' &&
      Array.isArray(data.education) &&
      Array.isArray(data.workExperience) &&
      Array.isArray(data.projects) &&
      Array.isArray(data.volunteerWork) &&
      Array.isArray(data.skills)
    );
  }

  static getStorageInfo(): { used: string; available: string; total: string } {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Estimate total localStorage capacity (usually 5-10MB)
    const total = 5 * 1024 * 1024; // 5MB estimate
    const available = total - used;

    return {
      used: this.formatBytes(used),
      available: this.formatBytes(available),
      total: this.formatBytes(total)
    };
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}