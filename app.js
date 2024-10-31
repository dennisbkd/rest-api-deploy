import express, { json } from 'express';
import { randomUUID } from 'node:crypto';
import { validateMovie, validatePartialMovie } from './Schema/movies.js';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const movies = require('./movies.json')

const app = express()

app.use(json())

app.disable('x-powered-by')

app.get('/movies', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')

  const { genre } = req.query
  if (genre) {
    const filterdMovies = movies.filter(movie => {
      return movie.genre.some(g => g.toLowerCase() === genre.toLocaleLowerCase())
    })
    return res.json(filterdMovies)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const {id} = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)

  res.status(404).json({message: 'movie not found'})
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    return res.status(400).json({error: JSON.parse(result.error.message)})
  }
  const newMovies = {
    id: randomUUID(),
    ...result.data
  }

  movies.push(newMovies)

  res.status(201).json(newMovies)
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)
  if (!result.success) {
    return res.status(400).json({error: JSON.parse(result.error.message)})
  }

  const {id} = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) {
    return res.status(404).json({message: 'movie not found'})
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  return res.json(updateMovie)
})

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`server listening on por http://localhost:${PORT}`)
})
