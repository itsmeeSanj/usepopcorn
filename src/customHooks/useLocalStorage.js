import React from "react";

export function useLocalStorage(initialState, key) {
  const [value, setValue] = React.useState(function () {
    const storedWatchMovie = localStorage.getItem(key);
    return storedWatchMovie ? JSON.parse(storedWatchMovie) : initialState; // because we have used stringify while setting items in localStorage
  });

  React.useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  );

  return [value, setValue];
}
