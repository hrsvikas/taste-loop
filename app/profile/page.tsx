"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || "");
      } else {
        router.push("/login");
      }
    }

    getUser();
  }, [router]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    alert("Logged out successfully!");

    router.push("/login");
  }

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <Navbar/>
      <h1>Profile</h1>

      <br />

      <p>
        <strong>Email:</strong> {email}
      </p>

      <br />

      <button
        onClick={handleLogout}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}