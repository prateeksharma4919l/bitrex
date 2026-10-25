import Link from "next/link";
export default function Privacy() {
  return (
    <main className="main" style={{ margin: "40px auto" }}>
      <Link href="/">← Back to BITREX</Link>
      <section className="panel" style={{ marginTop: 20 }}>
        <h1>Privacy</h1>
        <p className="muted-line">
          Demo environment: this local application only processes details you
          submit to its configured server. No email, analytics, market, or
          custody provider is configured by default. Before launch, replace this
          placeholder with reviewed jurisdiction-specific privacy disclosures
          describing retention, processors, and user rights.
        </p>
      </section>
    </main>
  );
}
