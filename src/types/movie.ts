export interface Movie {
  movieID: string; // renamed from movieId
  movieName: string;
  description: string;
  duration: number;
  subtitleId: string; 
  categories: string[];
  actor: string;
  director: string;
  dubbing: boolean;
  imageUrl: string;
  minimumAge: number;
  movieLanguage: string;
  movieTypes: string[];
  productionCompany: string;
  status: 'ACTIVE' | 'INACTIVE';
  trailerUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface MovieCategory {
  movieID: string; // renamed from movieId
  categoryId: string;
}

export interface Subtitle {
  id: string;
  language: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}