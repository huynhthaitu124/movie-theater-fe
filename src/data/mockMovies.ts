export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  duration: number;
  rating: number;
  genre: string[];
  status: 'now-showing' | 'coming-soon';
  releaseDate: string;
  director: string;
  cast: string[];
  language: string;
}

export const mockMovies: Movie[] = [
  {
    id: '1',
    title: 'Inception',
    description: 'A thief who enters the dreams of others to steal their secrets gets a chance to regain his old life in exchange for a task considered impossible.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    duration: 148,
    rating: 4.8,
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    status: 'now-showing',
    releaseDate: '2024-03-15',
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Ellen Page'],
    language: 'English'
  },
  {
    id: '2',
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    duration: 152,
    rating: 4.9,
    genre: ['Action', 'Crime', 'Drama'],
    status: 'now-showing',
    releaseDate: '2024-03-10',
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    language: 'English'
  },
  {
    id: '3',
    title: 'Pulp Fiction',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    duration: 154,
    rating: 4.7,
    genre: ['Crime', 'Drama'],
    status: 'now-showing',
    releaseDate: '2024-03-20',
    director: 'Quentin Tarantino',
    cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson'],
    language: 'English'
  },
  {
    id: '4',
    title: 'Spirited Away',
    description: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, where humans are changed into beasts.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    duration: 125,
    rating: 4.8,
    genre: ['Animation', 'Adventure', 'Family'],
    status: 'now-showing',
    releaseDate: '2024-03-25',
    director: 'Hayao Miyazaki',
    cast: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki'],
    language: 'Japanese'
  },
  {
    id: '5',
    title: 'The Matrix',
    description: 'A computer programmer discovers that reality as he knows it is a simulation created by machines, and joins a rebellion to break free.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    duration: 136,
    rating: 4.6,
    genre: ['Action', 'Sci-Fi'],
    status: 'now-showing',
    releaseDate: '2024-03-12',
    director: 'The Wachowskis',
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
    language: 'English'
  },
  {
    id: '6',
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    duration: 166,
    rating: 4.7,
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    status: 'now-showing',
    releaseDate: '2024-02-28',
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson'],
    language: 'English'
  },
  {
    id: '7',
    title: 'Deadpool & Wolverine',
    description: 'The merc with the mouth joins the MCU in an adventure that will change both his life and the MCU forever.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/3aduJY8JwfdVwQxmKQrVvQ3RaY0.jpg',
    duration: 150,
    rating: 4.5,
    genre: ['Action', 'Comedy', 'Superhero'],
    status: 'coming-soon',
    releaseDate: '2024-07-26',
    director: 'Shawn Levy',
    cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin'],
    language: 'English'
  },
  {
    id: '8',
    title: 'Inside Out 2',
    description: 'Follow Riley as a teenager as new emotions join Joy, Sadness, Anger, Fear, and Disgust in her mind.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/2AXxc5qrYsiiV8abdYUMI8nGlAj.jpg',
    duration: 135,
    rating: 4.4,
    genre: ['Animation', 'Adventure', 'Comedy'],
    status: 'coming-soon',
    releaseDate: '2024-06-14',
    director: 'Kelsey Mann',
    cast: ['Amy Poehler', 'Phyllis Smith', 'Maya Hawke'],
    language: 'English'
  }
];