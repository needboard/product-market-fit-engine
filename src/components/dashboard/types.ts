export interface ProblemRecord {
  id: string;
  clusterId: string;
  category: string;
  rawText: string;
  createdAt: string;
}

export interface ClusterRecord {
  id: string;
  category: string;
  categoryLabel: string;
  canonicalText: string;
  memberCount: number;
  variantCount?: number;
}

export interface SolutionRecord {
  id: string;
  clusterId: string;
  name: string;
  url: string;
  description: string;
  upvotes: number;
  reviewsCount: number;
  averageRating: number;
}

export interface ReviewRecord {
  clusterId: string;
  solutionId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  role: 'reporter' | 'builder' | 'admin';
  createdAt: string;
  customBio?: string;
  githubUrl?: string;
  websiteUrl?: string;
}

export interface RolePerks {
  role: 'reporter' | 'builder' | 'admin';
  label: string;
  badgeColor: string;
  rateLimitPerMin: number;
  rateLimitPerDay: number;
  canListSolutions: boolean;
  canEditSolutions: boolean;
  allowExternalLinks: boolean;
  customLinksEnabled: boolean;
  launchNotificationsQuota: number;
  perksHighlights: string[];
}
