"use client";

// React hooks
import { useEffect, useState } from "react";

// Supabase client
import supabase from "@/lib/supabase";

// Navbar component
import Navbar from "@/components/Navbar";

// Next.js Link component
import Link from "next/link";

export default function FeedPage() {
  // Stores all recommendations shown in the feed
  const [recommendations, setRecommendations] =
    useState<any[]>([]);

  // ==========================================
  // LOAD FRIEND RECOMMENDATIONS
  // ==========================================
  async function loadRecommendations() {
    // Get currently logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Stop if user is not logged in
    if (!user) return;

    // ------------------------------------------
    // Get all friend IDs of current user
    // ------------------------------------------
    const {
      data: friendsData,
      error: friendsError,
    } = await supabase
      .from("friends")
      .select("friend_id")
      .eq("user_id", user.id);

    if (friendsError) {
      console.log(friendsError);
      return;
    }

    // Convert friend objects into array of IDs
    const friendIds =
      friendsData?.map(
        (friend) => friend.friend_id
      ) || [];

    // If user has no friends, show empty feed
    if (friendIds.length === 0) {
      setRecommendations([]);
      return;
    }

    // ------------------------------------------
    // Load recommendations created by friends
    // ------------------------------------------
    const {
      data,
      error,
    } = await supabase
      .from("recommendations")
      .select(`
        *,
        users (
          name
        )
      `)
      .in("user_id", friendIds)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log(error);
      return;
    }

    // Save recommendations into state
    setRecommendations(data || []);
  }

  // ==========================================
  // SAVE RECOMMENDATION TO VAULT
  // ==========================================
  async function handleSaveToVault(
    recommendationId: string
  ) {
    // Get logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      return;
    }

    // ------------------------------------------
    // Check if recommendation already exists
    // in user's vault
    // ------------------------------------------
    const {
      data: existingSave,
      error: checkError,
    } = await supabase
      .from("saved_recommendations")
      .select("*")
      .eq("user_id", user.id)
      .eq(
        "recommendation_id",
        recommendationId
      )
      .maybeSingle();

    if (checkError) {
      console.log(checkError);
      return;
    }

    // Prevent duplicate saves
    if (existingSave) {
      alert(
        "Recommendation already saved!"
      );
      return;
    }

    // ------------------------------------------
    // Insert recommendation into vault
    // ------------------------------------------
    const { error } = await supabase
      .from("saved_recommendations")
      .insert([
        {
          user_id: user.id,
          recommendation_id:
            recommendationId,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "Recommendation saved to vault!"
    );
  }

  // ==========================================
  // RUN ON PAGE LOAD
  // ==========================================
  useEffect(() => {
    loadRecommendations();
  }, []);

  // ==========================================
  // UI
  // ==========================================
  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      {/* Top navigation bar */}
      <Navbar />

      <h1>Friend Feed</h1>

      {/* Show message if feed is empty */}
      {recommendations.length === 0 ? (
        <p>
          No recommendations from friends
          yet.
        </p>
      ) : (
        // Loop through all recommendations
        recommendations.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid gray",
              padding: "15px",
              marginTop: "10px",
              borderRadius: "8px",
            }}
          >
            {/* Friend who posted recommendation */}
            <p>
              <strong>
                {item.users?.name}
              </strong>{" "}
              recommended
            </p>

            {/* Click title to open details page */}
            <h3>
              <Link
                href={`/recommendation/${item.id}`}
              >
                {item.title}
              </Link>
            </h3>

            {/* Recommendation category */}
            <p>
              Category: {item.category}
            </p>

            {/* Recommendation description */}
            <p>
              {item.description}
            </p>

            {/* Save recommendation to vault */}
            <button
              onClick={() =>
                handleSaveToVault(
                  item.id
                )
              }
              style={{
                padding:
                  "8px 15px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Save To Vault
            </button>
          </div>
        ))
      )}
    </div>
  );
}