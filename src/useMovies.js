import React from "react";

export function useMovies(query) {
  const KEY = "f84fc31d";
  const [movies, setMovies] = React.useState([]);
  // const [watched, setWatched] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, SetError] = React.useState("");
  // localStorage

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

    // handleCloseMovie();
    fetchMovies();

    return function () {
      controller.abort();
    };
  }, [query]);

  return { movies, isLoading, error };
}
