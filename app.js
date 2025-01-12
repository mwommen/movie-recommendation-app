const recommendBtn = document.getElementById('recommend-btn');
recommendBtn.addEventListener('click', () => {
  fetchMoviesWithFilters();
});
const movieInput = document.getElementById('movie-input');
const moviesContainer = document.getElementById('movies-container');

const OMDB_API_KEY = '35f44850'; // Your OMDb API key
const TMDB_API_KEY = 'f96122fb964a4a799f5554aa5bb361dd'; // Your TMDb API key
const OMDB_BASE_URL = 'https://www.omdbapi.com/';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

recommendBtn.addEventListener('click', fetchMovies);

function fetchMovies() {
  const query = movieInput.value.trim();
  if (!query) {
    alert('Please enter a genre or movie name.');
    return;
  }

  moviesContainer.innerHTML = '<p>Loading...</p>';

  axios
    .get(OMDB_BASE_URL, {
      params: {
        s: query,
        apikey: OMDB_API_KEY,
      },
    })
    .then((response) => {
      const movies = response.data.Search;
      if (movies) {
        renderMovies(movies);
      } else {
        moviesContainer.innerHTML = `<p>No movies found for "${query}".</p>`;
      }
    })
    .catch((error) => {
      console.error('Error fetching movie data:', error);
      moviesContainer.innerHTML = `<p>Error fetching movie data. Please try again later.</p>`;
    });
}

function renderMovies(movies) {
  moviesContainer.innerHTML = '';
  movies.forEach((movie) => {
    const movieCard = createMovieCard(movie);
    moviesContainer.appendChild(movieCard);
    fetchStreamingOptions(movie.Title, movieCard);
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

  const streamingContainer = document.createElement('div');
  streamingContainer.classList.add('streaming-options');
  streamingContainer.textContent = 'Fetching streaming options...';
  card.appendChild(streamingContainer);

  return card;
}

function fetchStreamingOptions(movieTitle, card) {
    axios
      .get(`${TMDB_BASE_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query: movieTitle,
        },
      })
      .then((response) => {
        const movie = response.data.results[0];
        if (movie) {
          const movieId = movie.id;
          return axios.get(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers`, {
            params: { api_key: TMDB_API_KEY },
          });
        } else {
          throw new Error(`No details found for "${movieTitle}".`);
        }
      })
      .then((response) => {
        const providers = response.data.results?.US; // Fetch providers for the US
        const streamingContainer = card.querySelector('.streaming-options');
        streamingContainer.innerHTML = ''; // Clear previous options
  
        if (providers && providers.flatrate) {
          const uniqueProviders = new Map(); // Use a Map to store unique providers
          providers.flatrate.forEach((provider) => {
            if (!uniqueProviders.has(provider.provider_name)) {
              uniqueProviders.set(provider.provider_name, provider);
            }
          });
  
          streamingContainer.innerHTML = 'Available on: ';
          uniqueProviders.forEach((provider) => {
            // Use TMDb's link field if available, otherwise generate a custom link
            const providerLink =
              response.data.results.US.link ||
              generateStreamingURL(provider.provider_name, movieTitle);
  
            const link = document.createElement('a');
            link.href = providerLink;
            link.target = '_blank'; // Open in a new tab
            link.title = `Watch on ${provider.provider_name}`;
  
            const logo = document.createElement('img');
            logo.src = `https://image.tmdb.org/t/p/original${provider.logo_path}`;
            logo.alt = provider.provider_name;
            logo.style.width = '50px';
            logo.style.margin = '5px';
            logo.style.borderRadius = '5px';
  
            link.appendChild(logo);
            streamingContainer.appendChild(link);
          });
        } else {
          streamingContainer.textContent = 'Not available for streaming.';
        }
      })
      .catch((error) => {
        console.error('Error fetching streaming options:', error);
        const streamingContainer = card.querySelector('.streaming-options');
        streamingContainer.textContent = 'Error fetching streaming options.';
      });
  }
  
  // Existing JavaScript code in your file

// Autocomplete for Movies/Genres
const searchSuggestions = document.createElement('ul');
searchSuggestions.id = 'suggestions';
searchSuggestions.style.position = 'absolute';
searchSuggestions.style.zIndex = '1000';
searchSuggestions.style.listStyle = 'none';
searchSuggestions.style.padding = '0';
searchSuggestions.style.margin = '0';
searchSuggestions.style.backgroundColor = '#fff';
searchSuggestions.style.border = '1px solid #ccc';
document.querySelector('.input-container').appendChild(searchSuggestions);

movieInput.addEventListener('input', fetchSuggestions);

function fetchSuggestions() {
  const query = movieInput.value.trim();
  if (!query) {
    searchSuggestions.innerHTML = '';
    return;
  }

  axios
    .get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
      },
    })
    .then((response) => {
      const results = response.data.results;
      if (results && results.length > 0) {
        displaySuggestions(results);
      } else {
        searchSuggestions.innerHTML = '<li>No results found</li>';
      }
    })
    .catch((error) => {
      console.error('Error fetching suggestions:', error);
      searchSuggestions.innerHTML = '<li>Error fetching suggestions</li>';
    });
}

function displaySuggestions(results) {
  searchSuggestions.innerHTML = '';
  results.slice(0, 5).forEach((movie) => {
    const suggestionItem = document.createElement('li');
    suggestionItem.textContent = movie.title;
    suggestionItem.style.cursor = 'pointer';
    suggestionItem.style.padding = '5px 10px';
    suggestionItem.style.borderBottom = '1px solid #ccc';
    suggestionItem.addEventListener('click', () => {
      movieInput.value = movie.title;
      searchSuggestions.innerHTML = '';
      fetchMovies(); // Trigger the movie search
    });
    searchSuggestions.appendChild(suggestionItem);
  });
}

// Search Filters
const yearFilter = document.getElementById('year-filter');
const ratingFilter = document.getElementById('rating-filter');
const languageFilter = document.getElementById('language-filter');

recommendBtn.addEventListener('click', () => {
  fetchMoviesWithFilters();
});

// Populate Year and Rating Dropdowns Dynamically
document.addEventListener('DOMContentLoaded', () => {
  const recommendBtn = document.getElementById('recommend-btn');
  const yearFilter = document.getElementById('year-filter');
  const ratingFilter = document.getElementById('rating-filter');

  recommendBtn.addEventListener('click', () => {
    console.log('Recommend button clicked!');
    fetchMoviesWithFilters();
  });

  // Populate Year Dropdown
  const currentYear = new Date().getFullYear();
  const startYear = 1900;
  const yearOptions = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

  yearOptions.forEach((year) => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });

  // Populate Rating Dropdown
  const ratingOptions = Array.from({ length: 20 }, (_, i) => (i + 1) / 2);

  ratingOptions.forEach((rating) => {
    const option = document.createElement('option');
    option.value = rating;
    option.textContent = rating.toFixed(1);
    ratingFilter.appendChild(option);
  });
});

function fetchMoviesWithFilters() {
  const query = document.getElementById('movie-input').value.trim();
  const year = document.getElementById('year-filter').value;
  const rating = document.getElementById('rating-filter').value;
  const language = 'en';

  console.log('Query:', query, 'Year:', year, 'Rating:', rating, 'Language:', language);

  if (!query) {
    alert('Please enter a movie name or genre.');
    return;
  }

  document.getElementById('movies-container').innerHTML = '<p>Loading...</p>';

  // Prepare parameters
  const params = {
    api_key: TMDB_API_KEY,
    query,
    language,
  };

  // Add filters conditionally
  if (year) {
    console.log('Year Filter:', year);  // Debugging: Check the value of year filter
    params.primary_release_year = year;
  }
  if (rating) params['vote_average.gte'] = rating;

  console.log('Params:', params);  // Debugging: Check the final params object

  axios
    .get(`${TMDB_BASE_URL}/discover/movie`, { params })
    .then((response) => {
      console.log('API Response:', response.data);
      const movies = response.data.results || [];
      if (movies.length > 0) {
        renderMovies(movies);
      } else {
        document.getElementById('movies-container').innerHTML = `<p>No movies found for your filters.</p>`;
      }
    })
    .catch((error) => {
      console.error('Error fetching filtered movies:', error);
      document.getElementById('movies-container').innerHTML = `<p>Failed to fetch movies. Please try again later.</p>`;
    });
}






