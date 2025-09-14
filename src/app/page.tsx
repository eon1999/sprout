"use client";
import Link from "next/link";

function FeatureCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-emerald-100 p-4 rounded-lg shadow-md text-center">
      <h2 className="text-5xl mb-3">{emoji}</h2>
      <h2 className="text-3xl font-bold text-green-700 mb-3">
        {title}
      </h2>
      <p className="text-green-800">
        {description}
      </p>
    </div>
  );
}

export default function Home() {
  const handleSpotifyLogin = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/spotify`);
      const data = await response.json();
      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (error) {
      console.error("Error during Spotify login:", error);
    }
  };

  const features = [
    {
      emoji: "💎",
      title: "discover hidden gems",
      description: "find underrated artists that make good music. like really good music."
    },
    {
      emoji: "🎸",
      title: "farm aura points",
      description: "impress your friends or that special someone with your unique music taste."
    },
    {
      emoji: "🔥",
      title: "be ahead of the curve",
      description: "discover tomorrows star&apos;s. before they blow up on everyone&apos;s for you page."
    }
  ]

  return (
    <main className="p-8 bg-lime-100 min-h-screen">
      <div className="max-w-4xl mx-auto text-center bg-green-200 p-8 rounded-2xl shadow-md">
        <h1 className="text-4xl font-bold text-green-700 mb-4">
          Welcome to Sprout! 🌱
        </h1>

        <p className="text-lg text-green-800 mb-2">
          Find underground artists on Spotify to impress your friends.
          <br />
          We know you wanna be cool. Sprout%apos;s here to help.
        </p>
      </div>

      <div className="max-w-4xl mx-auto mt-8 bg-green-200 p-8 rounded-2xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex flex-col items-center">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              emoji={feature.emoji}
              title={feature.title}
              description={feature.description}
            />
          ))

          }
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 bg-green-200 p-8 rounded-2xl shadow-md flex flex-col items-center">
        <h1 className="text-2xl font-bold text-green-700 mb-4 text-center">
          👇 Get started below 👇
        </h1>
        <button
          onClick={handleSpotifyLogin}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-500 ease-in-out"
        >
          Sign in with Spotify
        </button>
      </div>

      <div className="mt-9 text-s text-green-600 text-center flex flex-col items-center">
        <p>
          made with ❤️ by{" "}
          <Link
            href="https://github.com/eon1999"
            className="text-green-600 hover:text-green-800 hover:underline"
          >
            viet dang
          </Link>
        </p>
        &copy; 2025 Sprout Platform. All rights reserved.
      </div>
    </main>
  );
}
