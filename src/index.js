import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// import StarRating from "./StarRating";
import TextExpander from "./TextExpander";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating
      maxRating={5}
      defaultSize={20}
      messages={["Terriable", "Bad", "Okay", "Good", "Amazing"]}
      defaultRating={3} */}
    {/* <TextExpander /> */}
  </React.StrictMode>
);
