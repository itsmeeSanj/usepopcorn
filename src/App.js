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

  function handleRemoveWatchMovie(ID) {
    setWatched((movies) => movies.filter((movie) => movie.imdbID !== ID));
  }

  React.useEffect(() => {
    const controller = new AbortController();

    async function fetchMovies() {
      try {
        setIsLoading(true);
        SetError("");
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error("Something went wrong while fetching movies!");
        }

        const data = await res.json();
        if (data?.Response === "False") throw new Error("Movie Not Found!");

        setMovies(data);
        SetError("");
      } catch (error) {
        if (error.name !== "AbortError") {
          SetError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    if (query.length < 3) {
      setMovies([]);
      SetError("");
      return;
    }

    handleCloseMovie();
    fetchMovies();

    return function () {
      controller.abort();
    };
  }, [query]);

  function handleSearchQuery(e) {
    setQuery(e.target.value);
    handleCloseMovie();
  }

  return (
    <>
      <Header>
        <Search query={query} onSearchQuery={handleSearchQuery} />
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
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchMovie
                watched={watched}
                onRemoveMovie={handleRemoveWatchMovie}
              />
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

function MovieDetails({ selectedId, onCloseMovie, onAddWatchMovie, watched }) {
  const [movieDetail, setMovieDetail] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [userRating, setUserRating] = React.useState("");

  const isWatched = watched.map((watch) => watch.imdbID).includes(selectedId);
  const watchUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  // destructor
  const {
    Title: title,
    Year: year,
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
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovieDetail(data);
      } catch (error) {
        console.log(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadMovieDetails();
  }, [selectedId]);

  // close modal using esc key
  React.useEffect(
    function () {
      function ESC(e) {
        if (e.code === "Escape") {
          onCloseMovie();
        }
      }
      document.addEventListener("keydown", ESC);

      // cleanUp
      return function () {
        document.removeEventListener("keydown", ESC);
      };
    },

    [onCloseMovie]
  );

  React.useEffect(
    function () {
      if (!title) return;
      document.title = `Movie - ${title}`;

      return function () {
        document.title = "usePopCorn";
      };
    },
    [title]
  );

  function handleAdd() {
    const newWacthedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    onAddWatchMovie(newWacthedMovie);
    onCloseMovie();
  }

  return (
    <>
      {isLoading ? (
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
              {!isWatched ? (
                <>
                  <StarRating maxRating={10} onSetRating={setUserRating} />
                  {userRating > 0 && (
                    <button className='btn-add' onClick={handleAdd}>
                      Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>You rated movie with {watchUserRating} stars</p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </div>
      )}
    </>
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
          <span>{watched.length} movies</span>
        </p>
        <Rating>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </Rating>
        <Rating>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </Rating>
        <Rating>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </Rating>
      </div>
    </div>
  );
}

function WatchMovie({ watched, onRemoveMovie }) {
  return (
    <ul className='list'>
      {watched.map((movie) => (
        <WatchMovieList
          movie={movie}
          key={movie.imdbID}
          onHandleRemove={() => onRemoveMovie(movie.imdbID)}
        />
      ))}
    </ul>
  );
}

function WatchMovieList({ movie, onHandleRemove }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <button
        className='btn-delete'
        onClick={() => onHandleRemove(movie.imdbID)}
      >
        &#10006;
      </button>
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
          <span>{movie.runtime ? movie.runtime : 0} min</span>
        </p>
      </div>
    </li>
  );
}

function Search({ query, onSearchQuery }) {
  return (
    <input
      className='search'
      type='text'
      placeholder='Search movies...'
      value={query}
      onChange={(e) => onSearchQuery(e)}
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
