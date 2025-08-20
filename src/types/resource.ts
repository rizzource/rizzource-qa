export interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  difficulty_level: DifficultyLevel;
  tags: string[];
  file_url?: string;
  created_at: string;
  updated_at?: string;
  downloads: number;
  rating: number;
  author: string;
}

export type ResourceCategory = 
  | 'Case Law'
  | 'Statutes'
  | 'Study Guides'
  | 'Practice Exams'
  | 'Legal Writing'
  | 'Bar Prep'
  | 'Research Tools';

export type DifficultyLevel = 
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'Expert';

export interface SearchFilters {
  query: string;
  categories: ResourceCategory[];
  difficultyLevels: DifficultyLevel[];
  tags: string[];
  sortBy: 'relevance' | 'date' | 'popularity' | 'rating';
  sortOrder: 'asc' | 'desc';
}

export interface SearchResult {
  resources: Resource[];
  totalCount: number;
  facets: {
    categories: { [key in ResourceCategory]: number };
    difficultyLevels: { [key in DifficultyLevel]: number };
    tags: { [key: string]: number };
  };
}