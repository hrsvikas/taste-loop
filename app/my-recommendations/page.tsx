"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function MyRecommendationsPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [description, setDescription] =  useState("");

  async function loadRecommendations() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("recommendations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    setRecommendations(data || []);
  }

  async function handlePostRecommendation() {
    if (
  !title ||
  !category ||
  !description
) {
      alert("Please enter title and category");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      return;
    }

    const { error } = await supabase
      .from("recommendations")
  .insert([
  {
    user_id: user.id,
    title,
    category,
    description,
  },
]);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    alert("Recommendation posted!");

    setTitle("");
    setCategory("");
    setDescription("");
    loadRecommendations();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from("recommendations")
      .delete()
      .eq("id", id);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    alert("Recommendation deleted!");

    loadRecommendations();
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
        <Navbar/>
      <h1>My Recommendations</h1>

      <br />

      <input
        type="text"
        placeholder="Enter Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
        }}
      />

      <br />
      <br />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{
          padding: "10px",
          width: "320px",
        }}
      >
        <option value="">
          Select Category
        </option>

        <option value="Movie">
          Movie
        </option>

        <option value="Anime">
          Anime
        </option>

        <option value="Game">
          Game
        </option>

        <option value="Book">
          Book
        </option>

        <option value="Manga">
          Manga
        </option>
      </select>
      <textarea
  placeholder="Enter Description"
  value={description}
  onChange={(e) =>
    setDescription(e.target.value)
  }
  rows={5}
  style={{
    width: "320px",
    padding: "10px",
  }}
/>

      <br />
      <br />

      <button
        onClick={handlePostRecommendation}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Post Recommendation
      </button>

      <hr
        style={{
          marginTop: "30px",
          marginBottom: "30px",
        }}
      />

      <h2>Recommendations Posted By Me</h2>

      <h3>
        Total Recommendations:{" "}
        {recommendations.length}
      </h3>

      {recommendations.length === 0 ? (
        <p>No recommendations found.</p>
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
            <h3>{item.title}</h3>

            <p>
              <strong>Category:</strong>{" "}
              {item.category}
            </p>
            <p>
  {item.description}
</p>

            <button
              onClick={() =>
                handleDelete(item.id)
              }
              style={{
                padding: "8px 15px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}