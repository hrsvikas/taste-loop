"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function FriendsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [search, setSearch] =  useState("");

  async function loadUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("*");

    if (error) {
      console.log(error);
      return;
    }

    const {
  data: { user },
} = await supabase.auth.getUser();

const filteredUsers =
  (data || []).filter(
    (u) => u.id !== user?.id
  );

setUsers(filteredUsers);
  }

  async function loadFriends() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

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

  setFriends(data || []);
}

  async function addFriend(friendId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Please login first");
    return;
  }

  // Prevent adding yourself
  if (user.id === friendId) {
    alert("You cannot add yourself");
    return;
  }

  // Check if already friends
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

  if (existingFriend) {
    alert("Already friends");
    return;
  }

  // Add friend
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

  loadFriends();
}

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
      <Navbar/>
      <h1>Friends</h1>

      <hr />

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
          <p>
            <strong>{user.name}</strong>
          </p>

          <button
            onClick={() => addFriend(user.id)}
          >
            Add Friend
          </button>
        </div>
      ))}

      <hr />

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
    <strong>
      {friend.users?.name}
    </strong>
  </div>
))
      )}
    </div>
  );
}