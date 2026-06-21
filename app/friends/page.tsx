"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function FriendsPage() {
  // Stores all users from database
  const [users, setUsers] = useState<any[]>([]);

  // Stores current user's friends
  const [friends, setFriends] = useState<any[]>([]);

  // Stores search input text
  const [search, setSearch] = useState("");

  // ==========================================
  // LOAD ALL USERS
  // ==========================================
  async function loadUsers() {
    // Get all users
    const { data, error } = await supabase
      .from("users")
      .select("*");

    if (error) {
      console.log(error);
      return;
    }

    // Get current logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Remove current user from user list
    const filteredUsers =
      (data || []).filter(
        (u) => u.id !== user?.id
      );

    // Save users into state
    setUsers(filteredUsers);
  }

  // ==========================================
  // LOAD FRIENDS
  // ==========================================
  async function loadFriends() {
    // Get current logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Fetch all friends and their names
    const { data, error } = await supabase
      .from("friends")
      .select(`
        id,
        friend_id,
        users!friends_friend_id_fkey (
          id,
          name
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      console.log(error);
      return;
    }

    // Save friends into state
    setFriends(data || []);
  }

  // ==========================================
  // ADD FRIEND
  // ==========================================
  async function addFriend(friendId: string) {
    // Get current logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      return;
    }

    // Prevent user from adding themselves
    if (user.id === friendId) {
      alert("You cannot add yourself");
      return;
    }

    // Check if friend already exists
    const {
      data: existingFriend,
      error: checkError,
    } = await supabase
      .from("friends")
      .select("*")
      .eq("user_id", user.id)
      .eq("friend_id", friendId)
      .maybeSingle();

    if (checkError) {
      console.log(checkError);
      return;
    }

    // Prevent duplicate friendships
    if (existingFriend) {
      alert("Already friends");
      return;
    }

    // Insert new friend record
    const { error } = await supabase
      .from("friends")
      .insert([
        {
          user_id: user.id,
          friend_id: friendId,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Friend added!");

    // Refresh friend list
    loadFriends();
  }

  // ==========================================
  // RUN ON PAGE LOAD
  // ==========================================
  useEffect(() => {
    loadUsers();
    loadFriends();
  }, []);

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      {/* Navigation Bar */}
      <Navbar />

      <h1>Friends</h1>

      <hr />

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        style={{
          padding: "10px",
          width: "300px",
          marginBottom: "20px",
        }}
      />

      {/* =======================================
          ALL USERS SECTION
      ======================================= */}
      <h2>All Users</h2>

      {users
        .filter((user) =>
          user.name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )
        )
        .map((user) => (
          <div
            key={user.id}
            style={{
              border: "1px solid gray",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            {/* User name */}
            <p>
              <strong>
                {user.name}
              </strong>
            </p>

            {/* Add friend button */}
            <button
              onClick={() =>
                addFriend(user.id)
              }
            >
              Add Friend
            </button>
          </div>
        ))}

      <hr />

      {/* =======================================
          MY FRIENDS SECTION
      ======================================= */}
      <h2>My Friends</h2>

      {friends.length === 0 ? (
        <p>No friends yet.</p>
      ) : (
        friends.map((friend) => (
          <div
            key={friend.id}
            style={{
              border: "1px solid gray",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            {/* Friend name */}
            <strong>
              {friend.users?.name}
            </strong>
          </div>
        ))
      )}
    </div>
  );
}