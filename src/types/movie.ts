export interface Movie {
  movieID: string;
  movieName: string;
  description: string;
  actor: string;
  director: string;
  productionCompany: string;
  duration: number;
  image: string; // <-- match backend: "image"
  trailer: string; // <-- match backend: "trailer"
  minimumAge: number;
  dubbing: boolean;
  movieTypes: string; // <-- match backend: comma separated string
  subtitleID: string; // <-- match backend: "subtitleID"
  movieLanguage: string;
  status: string; // 'ACTIVE' | 'INACTIVE' or string if backend allows
  // Remove: subtitleId, categories, imageUrl, trailerUrl
  createdAt?: string;
  updatedAt?: string;
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