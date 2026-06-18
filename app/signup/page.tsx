"use client";

import { useState } from "react";
import supabase from "@/lib/supabase";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      console.log(error);
      return;
    }

    const userId = data.user?.id;

    const { error: dbError } = await supabase
      .from("users")
      .insert([
        {
          id: userId,
          name,
          email,
        },
      ]);

    if (dbError) {
      alert(dbError.message);
      console.log(dbError);
      return;
    }

    alert("Account created successfully!");

    setName("");
    setEmail("");
    setPassword("");
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Signup</h1>

      <br />

      <input
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br />
      <br />

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleSignup}>
        Signup
      </button>
    </div>
  );
}