"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
export default function Signup() {
  const [email, setEmail] = useState(""),
    [name, setName] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create account.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main
      className="app-shell"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <section className="panel" style={{ width: "min(440px,100%)" }}>
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Wallet size={18} />
          </span>
          BITREX
        </Link>
        <h1 className="title" style={{ marginTop: 34 }}>
          Create your account
        </h1>
        <p className="muted-line">A secure profile to get started.</p>
        <form onSubmit={submit}>
          <label className="form-label">Full name</label>
          <input
            className="field"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="form-label">Email address</label>
          <input
            className="field"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="form-label">Password</label>
          <input
            className="field"
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <small className="muted-line">Use at least 12 characters.</small>
          {error && (
            <p role="alert" className="negative" style={{ fontSize: 12 }}>
              {error}
            </p>
          )}
          <button
            className="action primary"
            style={{ width: "100%", justifyContent: "center", marginTop: 20 }}
            disabled={busy}
          >
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>
        <div
          className="muted-line"
          style={{ marginTop: 18, textAlign: "center" }}
        >
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#79a4ff" }}>
            Sign in
          </Link>
        </div>
        <div className="notice">
          New here? Complete this form to create your account. After
          registration, you will be signed in automatically. Demo balances are
          for display only and cannot be withdrawn.
        </div>
      </section>
    </main>
  );
}
