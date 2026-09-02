export interface Cluster {
  id: string;
  category: string;
  categoryLabel: string;
  categoryDescription: string;
  canonicalText: string;
  memberCount: number;
  sampleVariants: string[];
}

export interface DraftResult {
  mode: 'match' | 'new';
  proposedCategory: string;
  proposedCategoryLabel: string;
  proposedCategoryDescription: string;
  proposedCanonicalText: string;
  cluster?: Cluster;
}
