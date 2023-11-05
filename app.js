const express = require('express'); // require -> commonJS
const crypto = require('node:crypto');
const cors = require('cors');

const movies = require('./movies.json');
const { validateMovie, validatePartialMovie } = require('./schemes/movies');

const app = express();
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:54321',
      'http://movies.com',
      'http://midu.dev'
    ];

    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
      return callback(null, true);
    }

    return callback(new Error('Not Allowed CORS'));
  }
}));

app.disable('x-powered-by');

// /Todos recursos que sean MOVIES se identifican con /movies
app.get('/movies', (req, res) => {
  const { genre } = req.query;
  if (genre) {
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(filteredMovies);
  }
  res.json(movies);
});

app.get('/movies/:id', (req, res) => {
  const { id } = req.params;
  const movie = movies.find(movie => movie.id === id);
  if (movie) return res.json(movie);
  res.status(404).json({ message: 'Movie not Found. Sorry 🤷‍♂️' });
});

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body);

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const newMovie = {
    id: crypto.randomUUID(), // uuid v4
    ...result.data
  };

  movies.push(newMovie);

  res.status(201).json(newMovie);
});

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params;
  const movieIndex = movies.findIndex(movie => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not Found. Sorry 🤷‍♂️' });
  }

  movies.splice(movieIndex, 1);

  return res.json({ message: 'Movie Deleted 🗑' });
});

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params;
  const result = validatePartialMovie(req.body);

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const movieIndex = movies.findIndex(movie => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found, sorry 🤷‍♂️' });
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  };

  movies[movieIndex] = updateMovie;

  return res.json(updateMovie);
});

app.options('/movies/:id', (req, res) => {
  console.log('jaja');
  res.sendStatus(200);
});

const PORT = process.env.PORT ?? 54321;

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});
