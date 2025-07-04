
export enum MatchingType {
  TRADITIONAL = 'TRADITIONAL',
  ADVANCED = 'ADVANCED',
}

export interface ResumeDetails {
  name: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  address: string | null;
  fileName: string;
}

export interface MatchResult {
  details: ResumeDetails;
  score: number;
  justification: string;
}

export interface JobMatchResults {
  jobFileName: string;
  jobContent: string;
  results: MatchResult[];
}

export interface FileData {
  name: string;
  content: string;
}
