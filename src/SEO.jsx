"use client";

import { useEffect } from "react";

const seoData = {
  home: {
    title: "SeaFish Bogura | Buy Sea Fish Online in Bangladesh",
  },
  contact: {
    title: "Contact Us | SeaFish Bogura",
  },
  privacy: {
    title: "Privacy Policy | SeaFish Bogura",
  },
};

export default function SEO({ page = "home" }) {
  const data = seoData[page] || seoData.home;

  useEffect(() => {
    if (typeof document !== "undefined" && data?.title) {
      document.title = data.title;
    }
  }, [data]);

  return null;
}
