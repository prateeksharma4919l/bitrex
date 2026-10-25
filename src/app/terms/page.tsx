import Link from "next/link";
export default function Terms() {
  return (
    <main className="main" style={{ margin: "40px auto" }}>
      <Link href="/">← Back to BITREX</Link>
      <section className="panel" style={{ marginTop: 20 }}>
        <h1>Terms of use</h1>
        <p className="muted-line">
          This demonstration is for software evaluation only. Sample balances,
          prices, and activity are illustrative and have no monetary value. No
          real trading, custody, deposits, or withdrawals are offered. Obtain
          legal review and publish complete terms before enabling any financial
          service.
        </p>
      </section>
    </main>
  );
}
