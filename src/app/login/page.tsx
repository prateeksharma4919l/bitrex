"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
export default function Login() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in.");
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
      <section className="panel" style={{ width: "min(420px,100%)" }}>
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Wallet size={18} />
          </span>
          BITREX
        </Link>
        <h1 className="title" style={{ marginTop: 34 }}>
          Welcome back
        </h1>
        <p className="muted-line">Sign in to your BITREX account.</p>
        <form onSubmit={submit}>
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div
          className="muted-line"
          style={{ marginTop: 18, textAlign: "center" }}
        >
          New to BITREX?{" "}
          <Link href="/signup" style={{ color: "#79a4ff" }}>
            Create an account
          </Link>
        </div>
        <div className="notice" style={{ marginTop: 20 }}>
          Sign in requires an account and configured PostgreSQL. To preview the
          wallet without signing in, {" "}
          <Link href="/demo" style={{ color: "#79a4ff" }}>
            explore the demo
          </Link>
          .
        </div>
      </section>
    </main>
  );
}
