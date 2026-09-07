export interface Solution {
  id: string;
  name: string;
  url: string;
  description: string;
  builderId: string;
  builderName: string;
  builderBio?: string;
  builderGithub?: string;
  builderWebsite?: string;
  upvotes: number;
  votesUserIds: string[];
  downvotedUserIds?: string[];
  createdAt: string;
  iconUrl?: string;
}

export interface Review {
  _id?: string;
  clusterId: string;
  solutionId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface Cluster {
  id: string;
  category: string;
  categoryLabel: string;
  categoryDescription: string;
  canonicalText: string;
  memberCount: number;
  sampleVariants: string[];
  createdAt: string;
  lastUpdatedAt: string;
  userIds?: string[];
  creatorId?: string;
  solutions?: Solution[];
}
