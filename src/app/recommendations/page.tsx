"use client";

import {useState, useEffect} from "react";

export default function RecommendationsPage() {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("spotify_token");
        setToken(storedToken);
    }, []);

    return (
        
    );
}