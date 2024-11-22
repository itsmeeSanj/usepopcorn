import { useState } from "react";
import { useGeoLocation } from "./customHooks/useGeoLocation";

export default function Geolocation() {
  const [countClicks, setCountClicks] = useState(0);
  const { getPosition, isLoading, error, lat, lng } = useGeoLocation();

  function handleClick() {
    setCountClicks((counts) => counts + 1);
    getPosition();
  }

  return (
    <div>
      <button onClick={handleClick} disabled={isLoading}>
        Get my position
      </button>

      {isLoading && <p>Loading position...</p>}
      {error && <p>{error}</p>}
      {!isLoading && !error && lat && lng && (
        <p>
          Your GPS position:{" "}
          <a
            target='_blank'
            rel='noreferrer'
            href={`https://www.openstreetmap.org/#map=16/${lat}/${lng}`}
          >
            {lat}, {lng}
          </a>
        </p>
      )}

      <p>You requested position {countClicks ? countClicks : null} times</p>
    </div>
  );
}
