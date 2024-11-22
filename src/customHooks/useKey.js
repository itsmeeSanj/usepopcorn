import React from "react";

export function useKey(action, key) {
  React.useEffect(
    function () {
      function ESC(e) {
        if (e.code.toLowerCase() === key.toLowerCase()) {
          action();
        }
      }
      document.addEventListener("keydown", ESC);
      // cleanUp
      return function () {
        document.removeEventListener("keydown", ESC);
      };
    },
    [action, key]
  );
}
