"use client";

import ReactDOM from "react-dom";

export function PreloadResources() {
  ReactDOM.preload("/images/backgrounds/troko-bg-top-fade.webp", {
    as: "image",
    fetchPriority: "high",
    type: "image/webp",
  });

  return null;
}
