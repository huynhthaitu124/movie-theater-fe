export interface Movie {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  subtitleId: string;
  categories: string[]; // Liên kết với MovieCategories
  releaseDate: string;
  director: string;
  cast: string[];
  posterUrl: string;
  trailerUrl?: string;
  rating: number;
  status: 'coming-soon' | 'now-showing';
  language: string;
  createdAt: string;
  updatedAt: string;
  backdropUrl?: string;
  genre: string[];
}

export interface MovieCategory {
  movieId: string;
  categoryId: string;
}

export interface Subtitle {
  id: string;
  language: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}