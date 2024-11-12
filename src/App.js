import React from "react";
import StarRating from "./StarRating";

// element - explict props

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "f84fc31d";

export default function App() {
  const [query, setQuery] = React.useState("");
  const [movies, setMovies] = React.useState([]);
  const [watched, setWatched] = React.useState([]);

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, SetError] = React.useState("");

  const [selectedId, setSelectedId] = React.useState(null);

  function handleSelectMovie(id) {
    setSelectedId((curId) => (id === curId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddMovie(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  React.useEffect(() => {
    async function fetchMovies() {
      try {
        setIsLoading(true);
        SetError("");
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
        );

        if (!res.ok) {
          throw new Error("Something went wrong while fetching movies!");
        }

        const data = await res.json();
        if (data?.Response === "False") throw new Error("Movie Not Found!");

        setMovies(data);
      } catch (error) {
        SetError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    if (query.length < 3) {
      setMovies([]);
      SetError("");
      return;
    }

    fetchMovies();
  }, [query]);

  return (
    <>
      <Header>
        <Search query={query} setQuery={setQuery} />
        <NumResults>{movies ? movies?.Search?.length : 0}</NumResults>
      </Header>

      <Main>
        {/* explicit props */}
        {/* <Box element={<MovieList movies={movies} />} /> */}

        {/* component composition */}
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectedMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              error={error}
              onAddWatchMovie={handleAddMovie}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchMovie watched={watched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className='loader'>Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className='error'>
      <span>⛔</span>
      {message}
    </p>
  );
}

function Main({ children }) {
  return <main className='main'>{children}</main>;
}

function Header({ children }) {
  return (
    <nav className='nav-bar'>
      <Logo />
      {children}
    </nav>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div className='box'>
      <button className='btn-toggle' onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

function MovieDetails({
  selectedId,
  onCloseMovie,
  setIsLoading,
  isLoading,
  error,
  onAddWatchMovie,
}) {
  const [movieDetail, setMovieDetail] = React.useState({});

  // destructor

  const {
    Title: title,
    year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movieDetail;

  React.useEffect(() => {
    async function loadMovieDetails() {
      try {
        // setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovieDetail(data);
      } catch (error) {
        console.log(error.message);
      } finally {
        // setIsLoading(false);
      }
    }

    loadMovieDetails();
  }, [selectedId, setIsLoading]);

  function handleAdd() {
    const newWacthedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
    };

    onAddWatchMovie(newWacthedMovie);
    onCloseMovie();
  }

  return isLoading ? (
    <Loader />
  ) : (
    <div className='details'>
      <header>
        <button className='btn-back' onClick={() => onCloseMovie()}>
          &larr;
        </button>
        <img src={poster} alt={`Poster of ${poster}`} />
        <div className='details-overview'>
          <h2>{title}</h2>
          <p>
            {released}
            <span>&bull;</span>
            {runtime}
          </p>
          <p>{genre}</p>
          <Rating>⭐️{imdbRating} IMDb rating</Rating>
        </div>
      </header>

      <section>
        <div className='rating'>
          <StarRating maxRating={10} />
          <button className='btn-add' onClick={handleAdd}>
            Add to list
          </button>
        </div>

        <p>
          <em>{plot}</em>
        </p>
        <p>Starring {actors}</p>
        <p>Directed by {director}</p>
      </section>
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className='summary'>
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length}movies</span>
        </p>
        <Rating>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </Rating>
        <Rating>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </Rating>
        <Rating>
          <span>⏳</span>
          <span>{avgRuntime}min</span>
        </Rating>
      </div>
    </div>
  );
}

function WatchMovie({ watched }) {
  return (
    <ul className='list'>
      {watched.map((movie) => (
        <WatchMovieList movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function WatchMovieList({ movie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className='search'
      type='text'
      placeholder='Search movies...'
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function Logo() {
  return (
    <div className='logo'>
      <span role='img'>🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function NumResults({ children }) {
  return (
    <p className='num-results'>
      Found <strong>{children}</strong> results
    </p>
  );
}

function MovieList({ movies, onSelectedMovie }) {
  return (
    <ul className='list list-movies'>
      {movies?.Search?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          onSelectedMovie={onSelectedMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectedMovie }) {
  return (
    <li key={movie.imdbID} onClick={() => onSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Rating({ children }) {
  return <p>{children}</p>;
}
