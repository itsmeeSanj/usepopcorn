import React from "react";

// element - explict props

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "f84fc31d";

export default function App() {
  const [query, setQuery] = React.useState("z");
  const [movies, setMovies] = React.useState([]);
  const [watched, setWatched] = React.useState([]);

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, SetError] = React.useState("");

  React.useEffect(function () {}, []);

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
          {!isLoading && !error && <MovieList movies={movies} />}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          <WatchedSummary watched={watched} />
          <WatchMovie watched={watched} />
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
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
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

function MovieList({ movies }) {
  return (
    <ul className='list'>
      {movies?.Search?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function Movie({ movie }) {
  return (
    <li key={movie.imdbID}>
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
