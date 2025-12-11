import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const marketplaces = [
  {
    name: "Atlassian Marketplace",
    logo: "https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/favicon-32x32.png",
    url: "https://marketplace.atlassian.com",
    status: "Listed",
    rating: "4.8",
    installs: "1K+",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
  },
  {
    name: "GitHub Marketplace",
    logo: "https://github.githubassets.com/favicons/favicon.svg",
    url: "https://github.com/marketplace",
    status: "Listed",
    rating: "4.9",
    installs: "500+",
    color: "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400"
  },
  {
    name: "Microsoft AppSource",
    logo: "https://appsource.microsoft.com/favicon.ico",
    url: "https://appsource.microsoft.com",
    status: "Coming Soon",
    rating: null,
    installs: null,
    color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
  }
];

export function MarketplaceBadges() {
  return (
    <section className="py-12 px-4 bg-muted/20" aria-label="Marketplace availability">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-3 text-xs">
            Official Partner
          </Badge>
          <h3 className="text-xl font-semibold mb-2">Available on Leading Marketplaces</h3>
          <p className="text-sm text-muted-foreground">
            Install SAAI directly from your favorite platform
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {marketplaces.map((marketplace, index) => (
            <motion.a
              key={marketplace.name}
              href={marketplace.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${marketplace.color} hover:scale-105 transition-transform cursor-pointer group`}
            >
              <img 
                src={marketplace.logo} 
                alt={`${marketplace.name} logo`}
                className="w-6 h-6 rounded"
                loading="lazy"
              />
              <div className="text-left">
                <div className="font-medium text-sm">{marketplace.name}</div>
                <div className="flex items-center gap-2 text-xs opacity-80">
                  {marketplace.status === "Listed" ? (
                    <>
                      <span className="flex items-center gap-1">
                        ⭐ {marketplace.rating}
                      </span>
                      <span>•</span>
                      <span>{marketplace.installs} installs</span>
                    </>
                  ) : (
                    <span>{marketplace.status}</span>
                  )}
                </div>
              </div>
              <svg 
                className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </motion.a>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Verified Publisher</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Security Reviewed</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>SOC 2 Compliant</span>
          </div>
        </div>
      </div>
    </section>
  );
}
