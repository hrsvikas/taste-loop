"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav
        style={{
        padding: "15px",
        borderBottom: "1px solid #ddd",
        marginBottom: "25px",
        display: "flex",
        gap: "25px",
        fontWeight: "bold",
        }}
    >
      <Link href="/feed">
        Feed
      </Link>

      <Link href="/my-recommendations">
        My Recommendations
      </Link>

      <Link href="/vault">
        Vault
      </Link>

      <Link href="/friends">
        Friends
      </Link>

      <Link href="/profile">
        Profile
      </Link>
    </nav>
  );
}