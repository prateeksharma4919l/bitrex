"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  Activity,
  ArrowDownLeft,
  ArrowDownUp,
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Download,
  Eye,
  EyeOff,
  Grid2X2,
  History,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings,
  Shield,
  Sun,
  Wallet as WalletIcon,
  X,
} from "lucide-react";
import { assets, demoTransactions, portfolioTotal } from "@/lib/assets";
const data = [
  { d: "Oct 20", v: 11720 },
  { d: "Oct 21", v: 12080 },
  { d: "Oct 22", v: 11840 },
  { d: "Oct 23", v: 12320 },
  { d: "Oct 24", v: 12600 },
  { d: "Oct 25", v: 12180 },
  { d: "Oct 26", v: 12754 },
];
const nav = [
  ["Overview", Grid2X2],
  ["My assets", WalletIcon],
  ["Activity", History],
  ["Security", Shield],
] as const;
type Mode = "Buy" | "Sell" | "Send" | "Receive" | "Swap";
export default function Dashboard() {
  const router = useRouter();
  const [active, setActive] = useState("Overview"),
    [mode, setMode] = useState<Mode | null>(null),
    [notice, setNotice] = useState(""),
    [query, setQuery] = useState(""),
    [hide, setHide] = useState(false),
    [light, setLight] = useState(false),
    [amount, setAmount] = useState(""),
    [asset, setAsset] = useState("USDT"),
    [network, setNetwork] = useState("Ethereum"),
    [address, setAddress] = useState(""),
    [review, setReview] = useState(false),
    [busy, setBusy] = useState(false),
    [recent, setRecent] = useState(demoTransactions);
  const filtered = useMemo(
    () =>
      assets.filter((a) =>
        `${a.symbol} ${a.name}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  function toast(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(""), 3200);
  }
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }
  function open(m: Mode) {
    setMode(m);
    setReview(false);
    setAmount("");
    setAddress("");
  }
  function chooseAsset(symbol: string) {
    setAsset(symbol);
    const firstNetwork = assets.find((item) => item.symbol === symbol)
      ?.networks[0];
    if (firstNetwork) setNetwork(firstNetwork);
  }
  async function confirm() {
    if (!review) {
      if (!/^(?=.*[1-9])\d*(?:\.\d+)?$/.test(amount)) {
        toast("Enter an amount greater than zero.");
        return;
      }
      if (mode === "Send" && !address.trim()) {
        toast("Enter a recipient address.");
        return;
      }
      setReview(true);
      return;
    }
    if (!mode) return;
    setBusy(true);
    try {
      const r = await fetch("/api/transactions/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type:
            mode === "Buy"
              ? "BUY"
              : mode === "Sell"
                ? "SELL"
                : mode === "Send"
                  ? "WITHDRAWAL"
                  : "SWAP",
          asset,
          network,
          amount,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const result = await r.json();
      if (!r.ok) throw Error(result.error || "Request unavailable.");
      setRecent((current) => [
        {
          type:
            mode === "Buy"
              ? "Bought"
              : mode === "Sell"
                ? "Sold"
                : mode === "Send"
                  ? "Sent"
                  : "Swapped",
          symbol: asset,
          amount: `${mode === "Buy" ? "" : ""} ${amount}`,
          network,
          date: "Just now",
          status: "Simulated",
        },
        ...current,
      ]);
      toast("Simulated request recorded. No real funds moved.");
      setMode(null);
      setReview(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Request unavailable.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={`app-shell ${light ? "light" : ""}`}>
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brand-mark">
            <WalletIcon size={19} />
          </span>
          BITREX
        </a>
        <div className="navgroup desktop-nav">
          <div className="navlabel">WORKSPACE</div>
          {nav.map(([label, Icon]) => (
            <button
              key={label}
              onClick={() => setActive(label)}
              className={`navlink ${active === label ? "active" : ""}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
        <div className="navgroup desktop-nav">
          <div className="navlabel">PREFERENCES</div>
          <button className="navlink" onClick={() => setActive("Settings")}>
            <Settings size={16} />
            Settings
          </button>
          <button
            className="navlink"
            onClick={() => toast("Help center is not configured in this demo.")}
          >
            <CircleHelp size={16} />
            Help center
          </button>
        </div>
        <div className="sidebottom desktop-nav">
          <div className="panel" style={{ padding: 14 }}>
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <Shield size={16} color="#72a0ff" />
              <b style={{ fontSize: 12 }}>Your security matters</b>
            </div>
            <p className="muted-line" style={{ lineHeight: 1.6 }}>
              Demo wallets do not hold or transfer real assets.
            </p>
            <button
              className="action"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() =>
                toast("Security preferences are available in settings.")
              }
            >
              Security settings <ArrowUpRight size={13} />
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 20,
            }}
          >
            <div className="avatar">JD</div>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 12 }}>Jordan Davis</b>
              <div className="muted-line">Personal account</div>
            </div>
            <ChevronDown size={15} />
          </div>
        </div>
        <div className="mobile-nav">
          {nav.slice(0, 4).map(([label, Icon]) => (
            <a
              href="#"
              key={label}
              onClick={(e) => {
                e.preventDefault();
                setActive(label);
              }}
              className={active === label ? "active" : ""}
            >
              <Icon size={18} />
              {label === "Overview"
                ? "Home"
                : label === "My assets"
                  ? "Assets"
                  : label === "Activity"
                    ? "Activity"
                    : "Security"}
            </a>
          ))}
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div>
            <div className="eyebrow">
              Monday, October 26, 2026{" "}
              <span style={{ margin: "0 7px", color: "#414b5b" }}></span>{" "}
              Welcome back, Jordan
            </div>
            <h1 className="title">
              {active === "Overview" ? "Your portfolio" : active}
            </h1>
          </div>
          <div className="topright">
            <span className="demo-pill">
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#e4bd58",
                }}
              />
              DEMO MODE
            </span>
            <Link className="action" href="/login">
              Sign in
            </Link>
            <Link className="action primary" href="/signup">
              Create account
            </Link>
            <button aria-label="Log out" className="iconbtn" onClick={logout}>
              <LogOut size={16} />
            </button>
            <button
              aria-label="Toggle theme"
              className="iconbtn"
              onClick={() => setLight(!light)}
            >
              {light ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              aria-label="Notifications"
              className="iconbtn"
              onClick={() => toast("Youre all caught up.")}
            >
              <Bell size={16} />
            </button>
            <div className="avatar">JD</div>
          </div>
        </div>
        <div className="notice" role="status">
          <b>DEMO ENVIRONMENT</b> &nbsp;Balances, prices and activity below are
          illustrative samples. No funds are deposited, withdrawable, or
          on-chain.
        </div>
        {active === "Activity" ? (
          <ActivityView transactions={recent} />
        ) : active === "Security" ? (
          <SecurityView toast={toast} />
        ) : active === "Settings" ? (
          <SettingsView toast={toast} light={light} setLight={setLight} />
        ) : (
          <>
            <div className="grid hero-grid" style={{ marginTop: 18 }}>
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <div className="metric-label">
                      Total portfolio value{" "}
                      <span style={{ color: "#657185" }}>
                        indicative demo value
                      </span>
                    </div>
                    <div className="metric-value">
                      {hide
                        ? ""
                        : `$${portfolioTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </div>
                    <div className="trend">
                      4.28% <span className="muted-line"> this week</span>
                    </div>
                  </div>
                  <button
                    className="iconbtn"
                    aria-label="Hide balances"
                    onClick={() => setHide(!hide)}
                  >
                    {hide ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                <div className="chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data}
                      margin={{ top: 10, right: 5, bottom: 0, left: 0 }}
                    >
                      <defs>
                        <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor="#598cff"
                            stopOpacity={0.29}
                          />
                          <stop
                            offset="95%"
                            stopColor="#598cff"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        stroke="#28303d"
                        strokeDasharray="4 5"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="d"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#748094", fontSize: 10 }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#111722",
                          border: "1px solid #2a3545",
                          borderRadius: 10,
                          fontSize: 12,
                        }}
                        formatter={(v) => [
                          `$${Number(v).toLocaleString()}`,
                          "Demo portfolio",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke="#6998ff"
                        strokeWidth={2.5}
                        fill="url(#fill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="quick-actions">
                  <button
                    className="action primary"
                    onClick={() => open("Buy")}
                  >
                    <Plus size={15} />
                    Buy
                  </button>
                  <button className="action" onClick={() => open("Sell")}>
                    <ArrowDownUp size={15} />
                    Sell
                  </button>
                  <button className="action" onClick={() => open("Send")}>
                    <ArrowUpRight size={15} />
                    Send
                  </button>
                  <button className="action" onClick={() => open("Receive")}>
                    <ArrowDownLeft size={15} />
                    Receive
                  </button>
                  <button className="action" onClick={() => open("Swap")}>
                    <ArrowLeftRight size={15} />
                    Swap
                  </button>
                </div>
              </section>
              <div className="grid" style={{ gridTemplateRows: "1fr 1fr" }}>
                <div className="panel">
                  <div className="panel-head">
                    <div className="metric-label">Available balance</div>
                    <span className="badge">Demo</span>
                  </div>
                  <div className="metric-value" style={{ fontSize: 24 }}>
                    {hide
                      ? ""
                      : `$${portfolioTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </div>
                  <div className="muted-line">
                    Illustrative not withdrawable
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-head">
                    <div className="metric-label">Pending balance</div>
                    <Activity size={16} color="#8390a4" />
                  </div>
                  <div className="metric-value" style={{ fontSize: 24 }}>
                    $0.00
                  </div>
                  <div className="muted-line">No pending demo requests</div>
                </div>
              </div>
            </div>
            <div className="grid metric-grid section">
              <div className="panel">
                <div className="metric-label">Assets held</div>
                <div className="metric-value">4</div>
                <div className="muted-line">Across 4 demo assets</div>
              </div>
              <div className="panel">
                <div className="metric-label">Indicative market prices</div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    margin: "12px 0 8px",
                  }}
                >
                  Unavailable in demo
                </div>
                <div className="muted-line">
                  No live price provider configured
                </div>
              </div>
              <div className="panel">
                <div className="metric-label">Wallet security</div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    margin: "12px 0 8px",
                  }}
                >
                  Demo account
                </div>
                <div className="muted-line">No real wallet infrastructure</div>
              </div>
            </div>
            <div className="grid hero-grid section">
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <div className="section-title">Your assets</div>
                    <div className="muted-line" style={{ marginTop: 5 }}>
                      Sample balances informational only
                    </div>
                  </div>
                  <button
                    className="action"
                    onClick={() => setActive("My assets")}
                  >
                    View assets <ArrowUpRight size={14} />
                  </button>
                </div>
                <label
                  style={{
                    position: "relative",
                    display: "block",
                    marginTop: 15,
                  }}
                >
                  <Search
                    size={15}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: 12,
                      color: "#718096",
                    }}
                  />
                  <input
                    className="search"
                    style={{ paddingLeft: 36 }}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search assets"
                    aria-label="Search assets"
                  />
                </label>
                <div className="asset-row muted-line" style={{ paddingTop: 2 }}>
                  <span>ASSET</span>
                  <span className="right">PRICE*</span>
                  <span className="right">BALANCE</span>
                  <span className="right hide-mobile">VALUE</span>
                </div>
                {filtered.map((a) => (
                  <div className="asset-row" key={a.symbol}>
                    <div className="asset-name">
                      <span className={`coin ${a.color}`}>
                        {a.symbol === "BTC"
                          ? ""
                          : a.symbol === "ETH"
                            ? ""
                            : a.symbol === "SOL"
                              ? "S"
                              : ""}
                      </span>
                      <span>
                        <b>{a.name}</b>
                        <small>{a.symbol}</small>
                      </span>
                    </div>
                    <div className="right">
                      {a.symbol === "USDT" || a.symbol === "USDC"
                        ? "$1.00"
                        : `$${a.price.toLocaleString()}`}
                      <div
                        className={a.change < 0 ? "negative" : "positive"}
                        style={{ fontSize: 10, marginTop: 3 }}
                      >
                        {a.change > 0 ? "+" : ""}
                        {a.change}%
                      </div>
                    </div>
                    <div className="right">
                      {hide ? "" : a.balance}
                      <div className="muted-line" style={{ marginTop: 3 }}>
                        {a.symbol}
                      </div>
                    </div>
                    <div className="right hide-mobile">
                      {hide
                        ? ""
                        : `$${(Number(a.balance.replaceAll(",", "")) * a.price).toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
                    </div>
                  </div>
                ))}
                <div className="muted-line" style={{ marginTop: 11 }}>
                  * Sample values only; no price provider configured.
                </div>
              </section>
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <div className="section-title">Recent activity</div>
                    <div className="muted-line" style={{ marginTop: 5 }}>
                      Simulated demo records only
                    </div>
                  </div>
                  <button
                    className="iconbtn"
                    aria-label="Export CSV"
                    onClick={() => exportCsv(recent)}
                  >
                    <Download size={15} />
                  </button>
                </div>
                {recent.slice(0, 4).map((t, i) => (
                  <div className="activity-row" key={`${t.type}-${i}`}>
                    <span
                      className="coin"
                      style={{
                        width: 32,
                        height: 32,
                        background: i === 0 ? "#1e352f" : "#253147",
                      }}
                    >
                      {t.type === "Received" ? (
                        <ArrowDownLeft size={15} />
                      ) : (
                        <ArrowUpRight size={15} />
                      )}
                    </span>
                    <div>
                      <b>
                        {t.type} {t.symbol}
                      </b>
                      <div className="muted-line" style={{ marginTop: 4 }}>
                        {t.date}
                      </div>
                    </div>
                    <div className="right">
                      <b>{t.amount}</b>
                      <div className="muted-line" style={{ marginTop: 4 }}>
                        {t.network}
                      </div>
                    </div>
                    <span className="badge pending hide-mobile">Simulated</span>
                  </div>
                ))}
                <button
                  className="action"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    marginTop: 9,
                  }}
                  onClick={() => setActive("Activity")}
                >
                  All activity <ArrowUpRight size={14} />
                </button>
              </section>
            </div>
          </>
        )}
        <div
          className="muted-line"
          style={{ textAlign: "center", marginTop: 25 }}
        >
          Indicative sample values No live provider connected{" "}
          <a href="/privacy">Privacy</a> <a href="/terms">Terms</a>
        </div>
      </main>
      {mode && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMode(null);
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="panel-head">
              <div>
                <div className="eyebrow">DEMO WALLET</div>
                <h2 id="modal-title" style={{ fontSize: 21, margin: "5px 0" }}>
                  {review ? "Review simulated request" : `${mode} crypto`}
                </h2>
              </div>
              <button
                className="iconbtn"
                aria-label="Close"
                onClick={() => setMode(null)}
              >
                <X size={17} />
              </button>
            </div>
            <div className="notice">
              Simulated only. This demo does not connect to a blockchain or move
              funds.
            </div>
            {mode === "Receive" ? (
              <>
                <label className="form-label">Asset</label>
                <select
                  className="field"
                  value={asset}
                  onChange={(e) => chooseAsset(e.target.value)}
                >
                  {assets.map((a) => (
                    <option key={a.symbol}>{a.symbol}</option>
                  ))}
                </select>
                <label className="form-label">Network</label>
                <select
                  className="field"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                >
                  {(assets.find((a) => a.symbol === asset)?.networks || []).map(
                    (n) => (
                      <option key={n}>{n}</option>
                    ),
                  )}
                </select>
                <div className="blank" style={{ padding: "24px 10px" }}>
                  <Shield size={25} style={{ margin: "0 auto 10px" }} />
                  <div>No deposit address configured</div>
                  <div className="muted-line" style={{ marginTop: 6 }}>
                    A verified wallet provider is required to receive real
                    funds. No address is generated in demo mode.
                  </div>
                </div>
                <button
                  className="action"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => setMode(null)}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                {review ? (
                  <>
                    <div
                      className="asset-row"
                      style={{ gridTemplateColumns: "1fr auto" }}
                    >
                      <span className="muted-line">Action</span>
                      <b>{mode}</b>
                    </div>
                    <div
                      className="asset-row"
                      style={{ gridTemplateColumns: "1fr auto" }}
                    >
                      <span className="muted-line">Amount</span>
                      <b>
                        {amount} {asset}
                      </b>
                    </div>
                    <div
                      className="asset-row"
                      style={{ gridTemplateColumns: "1fr auto" }}
                    >
                      <span className="muted-line">Network</span>
                      <b>{network}</b>
                    </div>
                    {mode === "Send" && (
                      <div
                        className="asset-row"
                        style={{ gridTemplateColumns: "1fr auto" }}
                      >
                        <span className="muted-line">Recipient</span>
                        <b style={{ maxWidth: 210, overflowWrap: "anywhere" }}>
                          {address}
                        </b>
                      </div>
                    )}
                    <div
                      className="muted-line"
                      style={{ margin: "12px 0 18px" }}
                    >
                      No provider quote or fee estimate is available. This
                      confirmation records a simulated request only.
                    </div>
                    <button
                      className="action primary"
                      disabled={busy}
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={confirm}
                    >
                      {busy ? "Recording" : "Confirm simulated request"}
                    </button>
                    <button
                      className="action"
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        marginTop: 8,
                      }}
                      onClick={() => setReview(false)}
                    >
                      Back to edit
                    </button>
                  </>
                ) : (
                  <>
                    <label className="form-label">Asset</label>
                    <select
                      className="field"
                      value={asset}
                      onChange={(e) => chooseAsset(e.target.value)}
                    >
                      {assets.map((a) => (
                        <option key={a.symbol}>{a.symbol}</option>
                      ))}
                    </select>
                    {(mode === "Send" || mode === "Swap") && (
                      <>
                        <label className="form-label">Network</label>
                        <select
                          className="field"
                          value={network}
                          onChange={(e) => setNetwork(e.target.value)}
                        >
                          {(
                            assets.find((a) => a.symbol === asset)?.networks ||
                            []
                          ).map((n) => (
                            <option key={n}>{n}</option>
                          ))}
                        </select>
                      </>
                    )}
                    {mode === "Send" && (
                      <>
                        <label className="form-label">Recipient address</label>
                        <input
                          className="field"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Address (demo validation only)"
                        />
                      </>
                    )}
                    <label className="form-label">Amount</label>
                    <div style={{ position: "relative" }}>
                      <input
                        className="field"
                        type="number"
                        min="0"
                        step="any"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                      />
                      <span
                        style={{
                          position: "absolute",
                          right: 13,
                          top: 13,
                          color: "#8994a5",
                          fontSize: 12,
                        }}
                      >
                        {asset}
                      </span>
                    </div>
                    <div
                      className="muted-line"
                      style={{ margin: "10px 0 18px" }}
                    >
                      Fee estimate unavailable in demo Provider unavailable
                    </div>
                    <button
                      className="action primary"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={confirm}
                    >
                      Review request
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}{" "}
      {notice && (
        <div className="toast" role="status">
          <Check
            size={15}
            style={{ verticalAlign: "middle", marginRight: 7 }}
          />
          {notice}
        </div>
      )}
    </div>
  );
}
function exportCsv(transactions: typeof demoTransactions) {
  const rows = [
    ["type", "asset", "amount", "network", "date", "status"],
    ...transactions.map((t) => [
      t.type,
      t.symbol,
      t.amount,
      t.network,
      t.date,
      "simulated demo",
    ]),
  ];
  const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], {
    type: "text/csv",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "bitrex-demo-activity.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}
function ActivityView({
  transactions,
}: {
  transactions: typeof demoTransactions;
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <div className="section-title">Transaction history</div>
          <p className="muted-line">
            Sample activity; no blockchain transaction hashes are available.
          </p>
        </div>
        <button className="action" onClick={() => exportCsv(transactions)}>
          <Download size={14} /> Export CSV
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              {["TYPE", "ASSET", "AMOUNT", "NETWORK", "DATE", "STATUS"].map(
                (x) => (
                  <th key={x}>{x}</th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i}>
                <td>{t.type}</td>
                <td>{t.symbol}</td>
                <td>{t.amount}</td>
                <td>{t.network}</td>
                <td>{t.date}</td>
                <td>
                  <span className="badge pending">Simulated</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="notice">
        These rows are sample UI data, not confirmed deposits, withdrawals, or
        on-chain transactions.
      </div>
    </section>
  );
}
function SecurityView({ toast }: { toast: (s: string) => void }) {
  return (
    <section className="panel">
      <div className="section-title">Security & sessions</div>
      <p className="muted-line">Security controls for this demo environment</p>
      {[
        ["Two-factor authentication", "Not configured"],
        ["Email verification", "Not configured"],
        ["Active sessions", "Demo session"],
        ["Password", "Account sign-in"],
      ].map(([a, b]) => (
        <div
          className="asset-row"
          key={a}
          style={{ gridTemplateColumns: "1fr auto" }}
        >
          <span>
            {a}
            <div className="muted-line" style={{ marginTop: 4 }}>
              {b}
            </div>
          </span>
          <button
            className="action"
            onClick={() =>
              toast(
                "Authentication backend and email provider configuration required.",
              )
            }
          >
            Manage
          </button>
        </div>
      ))}
      <div className="notice">
        Do not use this demo for real funds. Email, TOTP enrollment, and session
        revocation require production auth and configured providers.
      </div>
    </section>
  );
}
function SettingsView({
  toast,
  light,
  setLight,
}: {
  toast: (s: string) => void;
  light: boolean;
  setLight: (v: boolean) => void;
}) {
  return (
    <section className="panel">
      <div className="section-title">Preferences</div>
      {[
        ["Appearance", "Choose light or dark theme"],
        ["Currency", "USD  indicative display"],
        ["Notifications", "Email provider not configured"],
        ["Account closure", "Demo account"],
      ].map(([a, b], i) => (
        <div
          className="asset-row"
          key={a}
          style={{ gridTemplateColumns: "1fr auto" }}
        >
          <span>
            {a}
            <div className="muted-line" style={{ marginTop: 4 }}>
              {b}
            </div>
          </span>
          {i === 0 ? (
            <button className="action" onClick={() => setLight(!light)}>
              {light ? "Light" : "Dark"} theme
            </button>
          ) : (
            <button
              className="action"
              onClick={() =>
                toast("This setting requires a configured backend.")
              }
            >
              Manage
            </button>
          )}
        </div>
      ))}
    </section>
  );
}
