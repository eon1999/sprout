"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("spotify_token", token);
      router.push("/recommendations");
    }
  }, [searchParams, router]);

  return (
      <div className="p-8 bg-lime-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-700">
            Logging you in...
          </h1>
          <p className="text-green-600">
            Please wait while we set up your account
          </p>
        </div>
      </div>
  );
}

export default function Callback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent/>
    </Suspense>
  )
}