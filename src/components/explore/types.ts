export interface ExploreCluster {
  id: string;
  categoryLabel: string;
  canonicalText: string;
  memberCount: number;
  lastUpdatedAt: string;
  solutions?: { id: string }[];
  sourceUrl?: string;
}
