const recommendBtn = document.getElementById('recommend-btn');
const movieInput = document.getElementById('movie-input');
const moviesContainer = document.getElementById('movies-container');

const API_KEY = '35f44850';  // Your valid OMDb API key
const BASE_URL = 'https://www.omdbapi.com/';

recommendBtn.addEventListener('click', fetchMovies);

function fetchMovies() {
  const query = movieInput.value.trim();
  if (!query) {
    alert('Please enter a genre or movie name.');
    return;
  }

  // Clear any previous results and show loading
  moviesContainer.innerHTML = '<p>Loading...</p>';

  // Fetch movies from OMDb API
  axios.get(BASE_URL, {
    params: {
      s: query,
      apikey: API_KEY,
    }
  })
    .then(response => {
      const movies = response.data.Search;
      if (movies) {
        renderMovies(movies);
      } else {
        moviesContainer.innerHTML = `<p>No movies found for "${query}".</p>`;
      }
    })
    .catch(error => {
      console.error('Error fetching movie data:', error);
      moviesContainer.innerHTML = `<p>Error fetching movie data. Please try again later.</p>`;
    });
}

function renderMovies(movies) {
  moviesContainer.innerHTML = ''; // Clear loading message
  movies.forEach(movie => {
    const movieCard = createMovieCard(movie);
    moviesContainer.appendChild(movieCard);
  });
}

function createMovieCard(movie) {
  const card = document.createElement('div');
  card.classList.add('movie-card');

  const movieImage = document.createElement('img');
  movieImage.src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300';
  card.appendChild(movieImage);

  const info = document.createElement('div');
  info.classList.add('info');

  const movieTitle = document.createElement('h3');
  movieTitle.textContent = movie.Title;
  info.appendChild(movieTitle);

  const movieYear = document.createElement('p');
  movieYear.textContent = `Year: ${movie.Year}`;
  info.appendChild(movieYear);

  card.appendChild(info);
  return card;
}
