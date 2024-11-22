import React from "react";

export function useGeoLocation(
  callback = function () {
    return null;
  }
) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [position, setPosition] = React.useState({});
  const [error, setError] = React.useState(null);

  const { lat, lng } = position;

  function getPosition() {
    callback();
    if (!navigator.geolocation)
      return setError("Your browser does not support geolocation");

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLoading(false);
      },
      (error) => {
        setError(error.message);
        setIsLoading(false);
      }
    );
  }
  return { getPosition, isLoading, error, lat, lng };
}
