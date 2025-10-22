export interface NetworkContact {
  id: string;
  name: string;
  company: string;
  title?: string;
  linkedin?: string;
  email?: string;
  notes?: string;
}

export class NetworkService {
  private static STORAGE_KEY = 'networkContacts';

  static getContacts(): NetworkContact[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  static saveContacts(contacts: NetworkContact[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contacts));
  }

  static getCompaniesWithConnections(): string[] {
    const contacts = this.getContacts();
    const companies = new Set(contacts.map(c => c.company.toLowerCase().trim()));
    return Array.from(companies);
  }

  static hasConnectionAt(companyName: string): boolean {
    const companies = this.getCompaniesWithConnections();
    return companies.some(c => c === companyName.toLowerCase().trim());
  }

  static getContactsAtCompany(companyName: string): NetworkContact[] {
    const contacts = this.getContacts();
    return contacts.filter(c =>
      c.company.toLowerCase().trim() === companyName.toLowerCase().trim()
    );
  }
}
