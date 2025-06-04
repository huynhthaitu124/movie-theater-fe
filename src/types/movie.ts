export interface Movie {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  genre: string[];
  releaseDate: string;
  director: string;
  cast: string[];
  posterUrl: string;
  trailerUrl?: string;
  rating: number;
  status: 'coming-soon' | 'now-showing' | 'ended';
  language: string;
  createdAt: string;
  updatedAt: string;
}