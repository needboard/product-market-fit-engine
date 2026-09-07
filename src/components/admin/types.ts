export interface AdminStats {
  totalClustersCount: number;
  totalSolutionsCount: number;
  totalReviewsCount: number;
  totalTransactions: number;
  totalCostEstimated: number;
  avgProblemCharCount: number;
  avgProblemWordCount: number;
  avgProblemTokenCount: number;
  avgCostPerSubmission: number;
  costsByType: {
    submission: number;
    search: number;
    'me-too': number;
  };
  countsByType: {
    submission: number;
    search: number;
    'me-too': number;
  };
  categoryPopularity: Record<string, number>;
}

export interface ProblemRecord {
  id: string;
  rawText: string;
  category: string;
  clusterId: string;
  createdAt: string;
}

export interface ClusterRecord {
  id: string;
  category: string;
  categoryLabel: string;
  categoryDescription: string;
  canonicalText: string;
  memberCount: number;
  sampleVariants: string[];
  createdAt: string;
  lastUpdatedAt: string;
}
