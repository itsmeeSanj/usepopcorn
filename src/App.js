import React from "react";
import StarRating from "./StarRating";
import { useMovies } from "./customHooks/useMovies";
import { useLocalStorage } from "./customHooks/useLocalStorage";
import { useKey } from "./customHooks/useKey";
import Geolocation from "./Geolocation";

// element - explict props

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "f84fc31d";

export default function App() {
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState(null);
  const { movies, isLoading, error } = useMovies(query, handleCloseMovie); //custom hooks
  const [watched, setWatched] = useLocalStorage([], "watchedMovies");

  function handleSelectMovie(id) {
    setSelectedId((curId) => (id === curId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddMovie(movie) {
    setWatched((watched) => [...watched, movie]);

    // localStorage.setItem("watchedMovies", JSON.stringify([...watched, movie]));
  }

  function handleRemoveWatchMovie(ID) {
    setWatched((movies) => movies.filter((movie) => movie.imdbID !== ID));
  }

  function handleSearchQuery(e) {
    setQuery(e.target.value);
    handleCloseMovie();
  }

  return (
    <>
      {/* <Header>
        <Search
          query={query}
          setQuery={setQuery}
          onSearchQuery={handleSearchQuery}
        />
        <NumResults>{movies ? movies?.Search?.length : 0}</NumResults>
      </Header> */}

      {/* <Main>
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
      </Main> */}

      <Geolocation />
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

  const countRef = React.useRef(0);

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

  function handleAdd() {
    const newWacthedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };

    onAddWatchMovie(newWacthedMovie);
    onCloseMovie();
  }

  useKey(onCloseMovie, "Escape"); // hooks

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

  React.useEffect(
    function () {
      if (userRating) countRef.current = countRef.current++;
    },
    [userRating]
  );

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

function Search({ query, onSearchQuery, setQuery }) {
  const inputEl = React.useRef(null);

  useKey(function () {
    if (document.activeElement === inputEl.current) {
      return;
    }
    inputEl.current.focus();
    setQuery("");
  }, "Enter");

  // can be added custom callback function

  return (
    <input
      className='search'
      type='text'
      placeholder='Search movies...'
      value={query}
      onChange={(e) => onSearchQuery(e)}
      ref={inputEl}
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
