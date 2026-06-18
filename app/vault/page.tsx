"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function VaultPage() {
  const [savedRecommendations, setSavedRecommendations] =
    useState<any[]>([]);

  async function loadSavedRecommendations() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("saved_recommendations")
      .select(`
        id,
        recommendations (
          id,
          title,
          category,
            description
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    setSavedRecommendations(data || []);
  }

  async function handleDelete(
    savedRecommendationId: string
  ) {
    const { error } = await supabase
      .from("saved_recommendations")
      .delete()
      .eq("id", savedRecommendationId);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Removed from vault");

    loadSavedRecommendations();
  }

  useEffect(() => {
    loadSavedRecommendations();
  }, []);

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <Navbar/>
      <h1>My Saved Vault</h1>

      <h3>
        Total Saved:{" "}
        {savedRecommendations.length}
      </h3>

      {savedRecommendations.length === 0 ? (
        <p>No saved recommendations.</p>
      ) : (
        savedRecommendations.map(
          (item: any) => (
            <div
              key={item.id}
              style={{
                border:
                  "1px solid gray",
                padding: "15px",
                marginTop: "10px",
                borderRadius: "8px",
              }}
            >
              <h3>
                {
                  item.recommendations
                    ?.title
                }
              </h3>

              <p>
                Category:{" "}
                {
                  item.recommendations
                    ?.category
                }
              </p>
              <p>
  {
    item.recommendations
      ?.description
  }
</p>

              <button
                onClick={() =>
                  handleDelete(
                    item.id
                  )
                }
              >
                Remove
              </button>
            </div>
          )
        )
      )}
    </div>
  );
}