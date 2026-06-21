// ==========================================
// FRIENDS PAGE
// ==========================================

"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function FriendsPage() {

  // Stores all users
  const [users, setUsers] = useState<any[]>([]);

  // Stores current user's friends
  const [friends, setFriends] = useState<any[]>([]);

  // Stores search text
  const [search, setSearch] = useState("");

  // ==========================================
  // LOAD ALL USERS
  // ==========================================
  async function loadUsers() {

    // Get all users from database
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

    // Remove current user from list
    const filteredUsers =
      (data || []).filter(
        (u) => u.id !== user?.id
      );

    setUsers(filteredUsers);
  }

  // ==========================================
  // LOAD MY FRIENDS
  // ==========================================
  async function loadFriends() {

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Get all friends and their names
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

    // Save friends in state
    setFriends(data || []);
  }

  // ==========================================
  // ADD NEW FRIEND
  // ==========================================
  async function addFriend(friendId: string) {

    // Get current user
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

    // Check if friendship already exists
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

    // Prevent duplicate friends
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
  // RUN WHEN PAGE LOADS
  // ==========================================
  useEffect(() => {
    loadUsers();
    loadFriends();
  }, []);

  return (
    <div>
      {/* Top navigation */}
      <Navbar />

      {/* Search box */}
      <input
        type="text"
        placeholder="Search users..."
      />

      {/* All users section */}
      {/* Filter users based on search text */}
      {/* Show Add Friend button */}

      {/* Friends section */}
      {/* Show all added friends */}
    </div>
  );
}