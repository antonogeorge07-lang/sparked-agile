import { Helmet } from "react-helmet-async";
import { Shield, Lock, Database, UserX, Eye, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    icon: Lock,
    title: "AES-256-GCM token encryption",
    body: "Every Jira and GitHub token is encrypted at rest with authenticated encryption. We never store plaintext credentials.",
  },
  {
    icon: Shield,
    title: "Row-level security, on every table",
    body: "Postgres enforces access at the row, not the app. A query for someone else's data physically cannot return rows.",
  },
  {
    icon: FileCheck,
    title: "GDPR consent, immutable",
    body: "Consent events are hash-chained and rate-limited. One-click data export and deletion is built in, not bolted on.",
  },
  {
    icon: UserX,
    title: "No data sold, ever",
    body: "We do not sell, rent, or share your delivery data with third parties. Your truth belongs to you.",
  },
  {
    icon: Eye,
    title: "No third-party trackers",
    body: "No Google Analytics, no Facebook pixel, no session replay vendors. Our own privacy-respecting analytics only.",
  },
  {
    icon: Database,
    title: "EU-region data, 90-day retention",
    body: "Operational logs auto-delete after 90 days via scheduled cleanup. Your project data stays as long as you do.",
  },
];

export default function Trust() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Trust - Spark-Agile</title>
        <meta name="description" content="How Spark-Agile protects your delivery data: encryption, row-level security, GDPR, and zero third-party trackers." />
        <link rel="canonical" href="https://spark-agile.com/trust" />
      </Helmet>

      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
            Spark-Agile
          </Link>
          <Button asChild variant="ghost" size="sm"><Link to="/">Back</Link></Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 md:py-24 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Trust, by design</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-[-0.02em] mb-5">
            Your delivery truth,<br />kept private.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Knowing what's shipping shouldn't mean handing over your data. Here is exactly what we do, and what we don't.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="p-6 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50 hover:border-border transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-semibold text-lg mb-2">{title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50 text-center">
          <h2 className="text-2xl font-semibold mb-3">Want the details?</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto">
            Read the full privacy policy and terms, or contact us with a security question.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline"><Link to="/privacy">Privacy Policy</Link></Button>
            <Button asChild variant="outline"><Link to="/terms">Terms of Service</Link></Button>
            <Button asChild><Link to="/contact">Contact security</Link></Button>
          </div>
        </div>
      </main>
    </div>
  );
}
