"use client";

import { useState, useEffect } from "react";

export default function RecommendationsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState([]);
  console.log("Current recommendations:", recommendations);

  useEffect(() => {
    const storedToken = localStorage.getItem("spotify_token");
    setToken(storedToken);
  }, []);

  const handleRecommendations = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/recommendations?access_token=${token}`
      );
      const data = await response.json();
      setRecommendations(data.recommendations);
      console.log(data);

      if (data.error) {
        console.error("Backend error: ", data.error)
        return
      }
    } catch (error) {
      console.error("Error occurred when loading recommendations:", error);
    }
  };

  return (
    <main className="p-8 bg-lime-100 min-h-screen">
      <div className="max-w-4xl mx-auto text-center bg-green-200 p-8 rounded-2xl shadow-md">
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full
        shadow-lg transition duration-500 ease-in-out"
          onClick={handleRecommendations}
        >
          Get Your Recommendations!
        </button>
      </div>
      {recommendations.length > 0 && (
        <div className="max-w-3xl mx-auto my-8 bg-emerald-100 p-4 rounded-lg shadow-md text-center">
          {recommendations.map((rec,index) => (
            <div key={index} className="bg-emerald-100 rounded-lg shadow-md text-center">
                <h2 className="text-2xl font-bold text-green-700">
                    {rec.artist_name}
                </h2>
                <p className="text-lg text-green-600">
                    
                </p>
                <a href = {rec.track_external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 underline">
                    {rec.track_name}
                </a>
            </div>
          ))

          }
        </div>
      )}
    </main>
  );
}
