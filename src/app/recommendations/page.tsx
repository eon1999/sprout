"use client";

import { useState, useEffect } from "react";

export default function RecommendationsPage() {
  type Recommendation = {
    artist_genres: [];
    artist_name: string;
    artist_popularity: number;
    track_external_url: string;
    track_name: string;
  };

  const [token, setToken] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadingMessages = [
    "fetching recommendations...",
    "farming your aura for you...",
    "discovering hidden gems...",
  ];

  const [loadingMsgIndex, setLoadingMsgIndex] = useState(
    Math.floor(Math.random() * loadingMessages.length)
  );

  console.log("Current recommendations:", recommendations);

  useEffect(() => {
    const storedToken = localStorage.getItem("spotify_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!loading) {
      setLoadingMsgIndex(Math.floor(Math.random() * loadingMessages.length));
      return;
    }

    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [loading, loadingMessages.length]);

  const handleRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recommendations?access_token=${token}`
      );
      const data = await response.json();
      setRecommendations(data.recommendations);
      console.log(data);

      if (data.error) {
        console.error("Backend error: ", data.error);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error occurred when loading recommendations:", error);
    }
    setLoading(false);
  };

  return (
    <main className="p-8 bg-lime-100 min-h-screen">
      <div
        className={`fixed inset-0 z-40 flex items-center justify-center bg-emerald-100 bg-opacity-30
        transition-opacity duration-500 ${
          loading
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-row items-center space-x-6">
          <div className="w-12 h-12 border-4 border-t-green-500 border-green-200 rounded-full animate-spin" />
          <span className="text-green-700 text-lg font-medium">
            {loadingMessages[loadingMsgIndex]}
          </span>
        </div>
      </div>

      {recommendations.length === 0 && (
        <div className="max-w-4xl mx-auto text-center bg-green-200 p-8 rounded-2xl shadow-md">
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full
        shadow-lg transition duration-500 ease-in-out"
            onClick={handleRecommendations}
            disabled={loading}
          >
            Get Your Recommendations!
          </button>
        </div>
      )}

      {recommendations.length > 0 && (
        <div
          className="max-w-3xl mx-auto my-8 bg-green-200 p-4 rounded-lg shadow-md text-center
        transition-opacity duration-500"
        >
          <div className="max-w-4xl mx-auto text-center bg-green-300 p-8 rounded-2xl shadow-md">
            <h1 className="text-white font-bold text-4xl">Found it!</h1>
          </div>
          {recommendations.map((rec, index) => {
            console.log("Track URL:", rec.track_external_url);
            return (
              <div
                key={index}
                className="p-2 bg-emerald-100 rounded-lg shadow-md text-center my-4"
              >
                <h2 className="text-2xl font-bold text-green-700">
                  {rec.artist_name}
                </h2>
                <div className="flex flex-row items-center flex-wrap justify-center gap-2">
                  {rec.artist_genres.map((genre, idx) => (
                    <div key={idx}>
                      <p className="text-green-800">{genre}</p>
                    </div>
                  ))}
                </div>

                <iframe
                  src={`https://open.spotify.com/embed/track/${
                    rec.track_external_url.split("/track/")[1]
                  }`}
                  width="100%"
                  height="90"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  loading="lazy"
                  className="my-2 rounded"
                />
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
