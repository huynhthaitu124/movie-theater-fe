// Add this hook to your component or a utils file
import React from 'react';
import { FastAverageColor } from 'fast-average-color';
import { Movie } from '../types'; // Adjust the import path as necessary


export const useMoviesWithColor = (movies: Movie[]) => {
  const [moviesWithColor, setMoviesWithColor] = React.useState<Movie[]>([]);


  React.useEffect(() => {
    let isMounted = true;
    const fac = new FastAverageColor();

    Promise.all(
      movies.map(
        movie =>
          new Promise<Movie>(resolve => {
            if (!movie.image) return resolve({ ...movie, color: '#3B82F6' });
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.src = movie.image;
            img.onload = () => {
              const color = fac.getColor(img).hex;
              resolve({ ...movie, color });
            };
            img.onerror = () => resolve({ ...movie, color: '#3B82F6' });
          })
      )
    ).then(results => {
      if (isMounted) setMoviesWithColor(results);
    });

    return () => {
      isMounted = false;
    };
  }, [movies]);

  return moviesWithColor;
};