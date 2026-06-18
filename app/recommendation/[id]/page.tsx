"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function RecommendationDetailsPage() {
  const params = useParams();

  const [recommendation, setRecommendation] =
    useState<any>(null);

  async function loadRecommendation() {
    const { data, error } =
      await supabase
        .from("recommendations")
        .select(`
          *,
          users (
            name
          )
        `)
        .eq("id", params.id)
        .single();

    if (error) {
      console.log(error);
      return;
    }

    setRecommendation(data);
  }

  useEffect(() => {
    loadRecommendation();
  }, []);

  if (!recommendation) {
    return (
      <div>
        <Navbar />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <Navbar />

      <h1>
        {recommendation.title}
      </h1>

      <p>
        <strong>Category:</strong>{" "}
        {recommendation.category}
      </p>
<p>
  {recommendation.description}
</p>
      <p>
        <strong>Recommended by:</strong>{" "}
        {recommendation.users?.name}
      </p>
    </div>
  );
}