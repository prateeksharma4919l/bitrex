import Dashboard from "@/components/dashboard";
import { currentUser, demoMode } from "@/lib/server-auth";
import { redirect } from "next/navigation";
export default async function Home() {
  if (demoMode()) return <Dashboard />;
  const user = await currentUser();
  if (!user) redirect("/login");
  return (
    <main className="main" style={{ margin: "60px auto" }}>
      <div className="brand">
        <span className="brand-mark">B</span>BITREX
      </div>
      <section className="panel section">
        <h1 className="title">Wallet services are unavailable</h1>
        <p className="muted-line">
          This environment has no verified custody, price, or transaction
          provider configured. Real balances and money operations are disabled.
        </p>
        <form action="/api/auth/logout" method="post">
          <button className="action" type="submit">
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
