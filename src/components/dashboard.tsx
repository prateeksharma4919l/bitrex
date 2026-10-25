"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  assets,
  portfolioTotal,
  transactions,
  type WalletTransaction,
} from "@/lib/assets";
const nav = [
  ["Overview", Grid2X2],
  ["My assets", WalletIcon],
  ["Activity", History],
  ["Security", Shield],
] as const;
type Mode = "Buy" | "Sell" | "Send" | "Receive" | "Swap";
type MarketPrice = {
  price: string | null;
  percentChange24h: number | null;
  updatedAt: string | null;
  status: "AVAILABLE" | "STALE" | "UNAVAILABLE";
};
function formatUsdPrice(value: string) {
  const price = Number(value);
  if (!Number.isFinite(price)) return "Unavailable";
  const digits = price >= 100 ? 2 : price >= 1 ? 4 : 6;
  return `$${price.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

function formatQuoteTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "unavailable";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatQuoteChange(quote?: MarketPrice) {
  if (!quote) return "Loading";
  if (quote.percentChange24h === null) {
    return quote.status === "STALE" ? "Stale quote" : "Change unavailable";
  }
  const sign = quote.percentChange24h > 0 ? "+" : "";
  const prefix = quote.status === "STALE" ? "Stale snapshot · " : "";
  return `${prefix}${sign}${quote.percentChange24h.toFixed(2)}% · 24h`;
}

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
    [recent, setRecent] = useState(transactions),
    [marketPrices, setMarketPrices] = useState<Record<string, MarketPrice>>(
      {},
    ),
    [priceSource, setPriceSource] = useState("CoinPaprika"),
    [pricesLoaded, setPricesLoaded] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/market/prices", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Prices unavailable");
        return response.json();
      })
      .then((result) => {
        const quotes = Array.isArray(result.prices) ? result.prices : [];
        setMarketPrices(
          Object.fromEntries(
            quotes.map((quote: MarketPrice & { symbol: string }) => [
              quote.symbol,
              quote,
            ]),
          ),
        );
        if (typeof result.source === "string") setPriceSource(result.source);
      })
      .catch(() => {
        if (!controller.signal.aborted) setMarketPrices({});
      })
      .finally(() => {
        if (!controller.signal.aborted) setPricesLoaded(true);
      });
    return () => controller.abort();
  }, []);
  const availablePriceCount = Object.values(marketPrices).filter(
    (quote) => quote.status === "AVAILABLE" && quote.price !== null,
  ).length;
  const quotedPriceCount = Object.values(marketPrices).filter(
    (quote) => quote.price !== null,
  ).length;
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
          <b>DEMO ENVIRONMENT</b> &nbsp;Preview balance: 5,000,000 USDT. It is
          simulated and cannot be withdrawn. Market quotes are indicative only.
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
                        demo estimate
                      </span>
                    </div>
                    <div className="metric-value">
                      {hide
                        ? ""
                        : portfolioTotal === null
                          ? "Unavailable"
                          : `$${portfolioTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </div>
                    <div className="trend" style={{ color: "#9aa8bf" }}>
                      Simulated balance · no wallet history
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
                <div className="chart portfolio-chart">
                  <svg
                    viewBox="0 0 720 180"
                    role="img"
                    aria-label="Illustrative flat demo balance chart, not historical wallet performance"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="portfolioFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#5489ff" stopOpacity=".25" />
                        <stop offset="100%" stopColor="#5489ff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[35, 75, 115, 155].map((y) => (
                      <line key={y} x1="0" x2="720" y1={y} y2={y} stroke="#293346" strokeDasharray="4 7" />
                    ))}
                    <path d="M0 75 L720 75 L720 180 L0 180 Z" fill="url(#portfolioFill)" />
                    <path d="M0 75 L720 75" fill="none" stroke="#6d9cff" strokeWidth="3" />
                  </svg>
                  <div className="chart-caption">
                    <span>Illustrative demo balance</span>
                    <span>No historical wallet data</span>
                  </div>
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
                      : portfolioTotal === null
                        ? "Unavailable"
                        : `$${portfolioTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </div>
                  <div className="muted-line">Simulated USDT balance · not withdrawable</div>
                </div>
                <div className="panel">
                  <div className="panel-head">
                    <div className="metric-label">Pending balance</div>
                    <Activity size={16} color="#8390a4" />
                  </div>
                  <div className="metric-value" style={{ fontSize: 24 }}>
                    $0.00
                  </div>
                  <div className="muted-line">No transaction service connected</div>
                </div>
              </div>
            </div>
            <div className="grid metric-grid section">
              <div className="panel">
                <div className="metric-label">Assets held</div>
                <div className="metric-value">6</div>
                <div className="muted-line">Configured asset types</div>
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
                  {!pricesLoaded
                    ? "Loading prices…"
                    : availablePriceCount > 0
                      ? `${availablePriceCount} of ${assets.length} current`
                      : quotedPriceCount > 0
                        ? `${quotedPriceCount} stale snapshots`
                        : "Unavailable"}
                </div>
                <div className="muted-line">
                  {pricesLoaded
                    ? `Source: ${priceSource}`
                    : "Fetching from market data provider"}
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
                  Infrastructure unavailable
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
                      Connect wallet infrastructure to view balances.
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
                  <span className="right">PRICE</span>
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
                    {(() => {
                      const quote = marketPrices[a.symbol];
                      return (
                        <div className="right">
                          {quote?.price
                            ? formatUsdPrice(quote.price)
                            : quote?.status === "STALE"
                              ? "Stale quote"
                              : "Unavailable"}
                          <div className="muted-line" style={{ marginTop: 3 }}>
                            {formatQuoteChange(quote)}
                          </div>
                          <div className="muted-line" style={{ marginTop: 3 }}>
                            {quote?.updatedAt
                              ? `Updated ${formatQuoteTime(quote.updatedAt)}`
                              : "Updated time unavailable"}
                          </div>
                        </div>
                      );
                    })()}
                    <div className="right">
                      {hide
                        ? ""
                        : a.balance === null
                          ? "Unavailable"
                          : `${a.balance.toLocaleString("en-US", { maximumFractionDigits: 8 })} ${a.symbol}`}
                      <div className="muted-line" style={{ marginTop: 3 }}>
                        {a.symbol}
                      </div>
                    </div>
                    <div className="right hide-mobile">
                      {hide
                        ? ""
                        : a.balance !== null && marketPrices[a.symbol]?.price
                          ? `$${(a.balance * Number(marketPrices[a.symbol].price)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : a.balance === 0
                            ? "$0.00"
                            : "Unavailable"}
                    </div>
                  </div>
                ))}
                <div className="muted-line" style={{ marginTop: 11 }}>
                  USD quotes are indicative and sourced from {priceSource}; they
                  are not execution prices. Preview balances are simulated;
                  real balances need connected wallet infrastructure. {" "}
                  <a
                    href="https://coinpaprika.com/api"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Market data by CoinPaprika
                  </a>
                  .
                </div>
              </section>
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <div className="section-title">Recent activity</div>
                    <div className="muted-line" style={{ marginTop: 5 }}>
                      Simulated requests created in this session
                    </div>
                  </div>
                  <button
                    className="iconbtn"
                    aria-label="Export CSV"
                    disabled={recent.length === 0}
                    onClick={() => exportCsv(recent)}
                  >
                    <Download size={15} />
                  </button>
                </div>
                {recent.length === 0 ? (
                  <div className="blank" style={{ marginTop: 14 }}>
                    <Activity size={22} />
                    <div>No activity yet</div>
                    <div className="muted-line">
                      New requests will appear here as simulated records.
                    </div>
                  </div>
                ) : recent.slice(0, 4).map((t, i) => (
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
                    <span className="badge pending hide-mobile">
                      {t.status === "IN_PROGRESS" ? "In process · simulated" : "Simulated"}
                    </span>
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
          <Link href="/welcome">About BITREX</Link> · Prices unavailable ·
          No live provider connected · <a href="/privacy">Privacy</a> ·{" "}
          <a href="/terms">Terms</a>
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
function exportCsv(transactions: WalletTransaction[]) {
  const rows = [
    ["type", "asset", "amount", "network", "date", "status"],
    ...transactions.map((t) => [
      t.type,
      t.symbol,
      t.amount,
      t.network,
      t.date,
      t.status === "IN_PROGRESS" ? "in process (simulated)" : "simulated demo",
    ]),
  ];
  const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], {
    type: "text/csv",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "bitrex-activity.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}
function ActivityView({
  transactions,
}: {
  transactions: WalletTransaction[];
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <div className="section-title">Transaction history</div>
          <p className="muted-line">
          Only requests created in this session are listed here.
          </p>
        </div>
        <button
          className="action"
          disabled={transactions.length === 0}
          onClick={() => exportCsv(transactions)}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>
      {transactions.length === 0 ? (
        <div className="blank">
          <Activity size={22} />
          <div>No activity yet</div>
          <div className="muted-line">
            New requests will appear here marked as simulated.
          </div>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                {[
                  "TYPE",
                  "ASSET",
                  "AMOUNT",
                  "NETWORK",
                  "DATE",
                  "STATUS",
                ].map((x) => (
                  <th key={x}>{x}</th>
                ))}
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
                    <span className="badge pending">
                      {t.status === "IN_PROGRESS" ? "In process" : "Simulated"}
                    </span>
                    {t.status === "IN_PROGRESS" && (
                      <small className="muted-line" style={{ display: "block", marginTop: 4 }}>
                        Simulated · no on-chain transfer
                      </small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
