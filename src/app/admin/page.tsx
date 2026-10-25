import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") notFound();
  const [userCount, transactions, providers, auditLogs] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        type: true,
        status: true,
        amount: true,
        simulated: true,
        createdAt: true,
        user: { select: { email: true } },
        asset: { select: { symbol: true } },
      },
    }),
    prisma.provider.findMany({
      select: { name: true, kind: true, enabled: true, lastHealthAt: true },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { action: true, resourceId: true, createdAt: true },
    }),
  ]);
  return (
    <main className="main" style={{ margin: "30px auto" }}>
      <div className="eyebrow">BITREX OPERATIONS</div>
      <h1 className="title">Admin overview</h1>
      <div className="notice">
        Access is checked on the server. This console shows operational metadata
        only; it never displays wallet keys or provider secrets.
      </div>
      <section className="panel section">
        <h2 className="section-title">Account overview</h2>
        <p className="muted-line">Users: {userCount}</p>
      </section>
      <section className="panel section">
        <h2 className="section-title">Recent transactions</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>TYPE</th>
                <th>ACCOUNT</th>
                <th>ASSET</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>MODE</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.type}</td>
                  <td>{tx.user.email}</td>
                  <td>{tx.asset.symbol}</td>
                  <td>{tx.amount.toString()}</td>
                  <td>{tx.status}</td>
                  <td>{tx.simulated ? "Simulated" : "Provider"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="blank">No transaction records.</div>
          )}
        </div>
      </section>
      <section className="panel section">
        <h2 className="section-title">Provider health</h2>
        {providers.length === 0 ? (
          <div className="blank">No providers configured.</div>
        ) : (
          providers.map((provider) => (
            <div
              className="asset-row"
              key={provider.name}
              style={{ gridTemplateColumns: "1fr auto" }}
            >
              <span>
                {provider.name}
                <div className="muted-line">{provider.kind}</div>
              </span>
              <span className="badge pending">
                {provider.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          ))
        )}
      </section>
      <section className="panel section">
        <h2 className="section-title">Audit log</h2>
        {auditLogs.length === 0 ? (
          <div className="blank">No audit events.</div>
        ) : (
          auditLogs.map((entry) => (
            <div
              className="asset-row"
              key={`${entry.action}-${entry.createdAt.toISOString()}`}
              style={{ gridTemplateColumns: "1fr auto" }}
            >
              <span>
                {entry.action}
                <div className="muted-line">
                  {entry.resourceId ?? "Account event"}
                </div>
              </span>
              <span className="muted-line">
                {entry.createdAt.toISOString()}
              </span>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
