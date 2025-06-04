export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  duration: number;
  rating: number;
  releaseDate: string;
  status: 'now-showing' | 'coming-soon';
}