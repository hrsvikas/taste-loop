"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function FeedPage() {
  const [recommendations, setRecommendations] =
    useState<any[]>([]);

  async function loadRecommendations() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Load my friends
  const { data: friendsData, error: friendsError } =
    await supabase
      .from("friends")
      .select("friend_id")
      .eq("user_id", user.id);

  if (friendsError) {
    console.log(friendsError);
    return;
  }

  const friendIds =
    friendsData?.map(
      (friend) => friend.friend_id
    ) || [];

  if (friendIds.length === 0) {
    setRecommendations([]);
    return;
  }

  // Load recommendations from friends only
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

  setRecommendations(data || []);
}

  async function handleSaveToVault(
  recommendationId: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Please login first");
    return;
  }

  // Check if already saved
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

  if (existingSave) {
    alert(
      "Recommendation already saved!"
    );
    return;
  }

  // Save recommendation
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

  useEffect(() => {
    loadRecommendations();
  }, []);

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <Navbar />
      <h1>Friend Feed</h1>

      {recommendations.length === 0 ? (
        <p>No recommendations from friends yet.</p>
      ) : (
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
            <p>
              <strong>
                {item.users?.name}
              </strong>{" "}
              recommended
            </p>

            <h3>
  <Link
    href={`/recommendation/${item.id}`}
  >
    {item.title}
  </Link>
</h3>

            <p>
              Category: {item.category}
            </p>
            <p>
  {item.description}
</p>

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