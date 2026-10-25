import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Shield,
  Wallet,
  Zap,
} from "lucide-react";

const featureCards = [
  {
    icon: Wallet,
    title: "One clear portfolio",
    body: "See balances and activity after a verified wallet is connected.",
  },
  {
    icon: Zap,
    title: "Simple transaction flows",
    body: "Review buy, sell, send, receive, and swap steps before confirming a demo request.",
  },
  {
    icon: Shield,
    title: "Transparent by default",
    body: "Unavailable values stay blank until a price or wallet provider is configured.",
  },
];
const supported = [
  "Bitcoin · BTC",
  "Ethereum · ETH",
  "Tether · USDT",
  "Solana · SOL",
  "USD Coin · USDC",
  "BNB · BNB",
];

export default function WelcomePage() {
  return (
    <main className="app-shell">
      <header
        className="main"
        style={{
          margin: "0 auto",
          paddingBottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Wallet size={18} />
          </span>
          BITREX
        </Link>
        <nav
          style={{ display: "flex", alignItems: "center", gap: 12 }}
          aria-label="Main navigation"
        >
          <Link className="action" href="/login">
            Sign in
          </Link>
          <Link className="action primary" href="/signup">
            Create account
          </Link>
        </nav>
      </header>
      <section
        className="main"
        style={{ margin: "0 auto", paddingTop: 90, paddingBottom: 65 }}
      >
        <div style={{ maxWidth: 780 }}>
          <span className="demo-pill">A DIGITAL ASSET WALLET DEMO</span>
          <h1
            style={{
              fontSize: "clamp(42px, 7vw, 76px)",
              lineHeight: 1.02,
              letterSpacing: "-.055em",
              margin: "22px 0 18px",
              fontWeight: 690,
            }}
          >
            Your assets,
            <br />
            <span style={{ color: "#75a2ff" }}>clear at a glance.</span>
          </h1>
          <p
            className="subtle"
            style={{ fontSize: 17, lineHeight: 1.7, maxWidth: 610 }}
          >
            BITREX brings portfolio views and straightforward transaction flows
            into one polished wallet experience. Explore every screen in demo
            mode, with no fabricated balances, activity, or market prices.
          </p>
          <div className="quick-actions" style={{ marginTop: 25 }}>
            <Link className="action primary" href="/demo">
              Explore the demo <ArrowRight size={15} />
            </Link>
            <Link className="action" href="/signup">
              Create account <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <div className="grid metric-grid" style={{ marginTop: 64 }}>
          {featureCards.map(({ icon: Icon, title, body }) => (
            <article className="panel" key={title}>
              <span className="brand-mark" style={{ width: 38, height: 38 }}>
                <Icon size={18} />
              </span>
              <h2 className="section-title" style={{ marginTop: 19 }}>
                {title}
              </h2>
              <p className="muted-line" style={{ lineHeight: 1.7 }}>
                {body}
              </p>
            </article>
          ))}
        </div>
        <section className="grid hero-grid section" style={{ marginTop: 64 }}>
          <div className="panel">
            <div className="eyebrow">ASSET REGISTRY EXAMPLES</div>
            <h2 className="title" style={{ margin: "10px 0 18px" }}>
              Explore popular assets
            </h2>
            <div className="grid metric-grid">
              {supported.map((item) => (
                <div
                  className="asset-row"
                  key={item}
                  style={{ gridTemplateColumns: "1fr" }}
                >
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="muted-line" style={{ marginTop: 14 }}>
              Network availability varies by asset. No address or live quote is
              provided in this demo.
            </p>
          </div>
          <div className="panel">
            <span className="brand-mark">
              <Shield size={18} />
            </span>
            <h2 className="title" style={{ marginTop: 16 }}>
              Know what is real
            </h2>
            <p className="muted-line" style={{ lineHeight: 1.75 }}>
              No wallet balances or past activity are preloaded. Indicative USD
              market quotes come from CoinPaprika and include source timestamps.
              This environment has no custody, payment, or blockchain provider;
              actions are simulated only.
            </p>
            <Link
              href="/terms"
              className="action"
              style={{ marginTop: 12, display: "inline-flex" }}
            >
              Demo terms <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>
        <section className="panel section" style={{ marginTop: 24 }}>
          <div className="eyebrow">GETTING STARTED</div>
          <h2 className="title">Three steps to explore</h2>
          <div className="grid metric-grid" style={{ marginTop: 18 }}>
            {[
              [
                "01",
                "Open the demo",
                "Browse indicative market quotes; wallet balances remain unavailable until wallet infrastructure is connected.",
              ],
              [
                "02",
                "Try an action",
                "Review a simulated request and its clearly labeled status.",
              ],
              [
                "03",
                "See the record",
                "Check recent activity; no blockchain transaction is created.",
              ],
            ].map(([n, title, body]) => (
              <div key={n} style={{ padding: 12 }}>
                <div className="eyebrow">{n}</div>
                <h3 className="section-title">{title}</h3>
                <p className="muted-line" style={{ lineHeight: 1.65 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="panel section" style={{ marginTop: 24 }}>
          <div className="eyebrow">FAQ</div>
          <h2 className="title">A few useful answers</h2>
          {[
            [
              "Are these live balances or prices?",
              "Wallet balances are not preloaded. Indicative USD prices come from CoinPaprika with source timestamps; they are not transaction quotes.",
            ],
            [
              "Can I send or receive real crypto?",
              "No. The demo does not connect to wallet infrastructure or a blockchain. Receive screens show no address, and send requests are simulation only.",
            ],
            [
              "What is required before real funds?",
              "A reviewed custody and payment provider, verified network/address support, an atomic auditable ledger, reconciliation, operational controls, and independent security and legal review.",
            ],
          ].map(([question, answer]) => (
            <details
              key={question}
              style={{ borderTop: "1px solid var(--line)", padding: "16px 0" }}
            >
              <summary
                style={{ cursor: "pointer", fontSize: 14, fontWeight: 600 }}
              >
                {question}
              </summary>
              <p
                className="muted-line"
                style={{ lineHeight: 1.7, marginBottom: 0 }}
              >
                {answer}
              </p>
            </details>
          ))}
        </section>
        <footer
          className="muted-line"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
            marginTop: 32,
          }}
        >
          <span>
            <Check
              size={13}
              style={{ verticalAlign: "middle", marginRight: 6 }}
            />
            Demo status is visible throughout the wallet.
          </span>
          <span>
            <Link href="/privacy">Privacy</Link> ·{" "}
            <Link href="/terms">Terms</Link> · <Link href="/">Wallet</Link>
          </span>
        </footer>
      </section>
    </main>
  );
}
