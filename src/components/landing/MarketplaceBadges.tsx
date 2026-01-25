import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function MarketplaceBadges() {
  const { t } = useTranslation();

  const marketplaces = [
    {
      name: "GitHub",
      logo: "https://github.githubassets.com/favicons/favicon.svg",
      url: "https://github.com",
      status: "Available",
      descriptionKey: "landing.marketplace.connectRepos",
      color: "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400"
    },
    {
      name: "Jira Cloud",
      logo: "https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/favicon-32x32.png",
      url: "https://www.atlassian.com/software/jira",
      status: "Available",
      descriptionKey: "landing.marketplace.syncSprints",
      color: "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
    },
    {
      name: "Microsoft 365",
      logo: "https://www.microsoft.com/favicon.ico",
      url: "https://www.microsoft.com/microsoft-365",
      status: "Available",
      descriptionKey: "landing.marketplace.calendarIntegration",
      color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
    }
  ];

  return (
    <section className="py-12 px-4 bg-muted/20" aria-label="Integration availability">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-3 text-xs border-tier-free/30 text-tier-free">
            {t('landing.marketplace.badge')}
          </Badge>
          <h3 className="text-xl font-semibold mb-2">{t('landing.marketplace.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('landing.marketplace.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {marketplaces.map((marketplace, index) => (
            <motion.div
              key={marketplace.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${marketplace.color}`}
            >
              <img 
                src={marketplace.logo} 
                alt={`${marketplace.name} logo`}
                className="w-6 h-6 rounded"
                loading="lazy"
              />
              <div className="text-left">
                <div className="font-medium text-sm">{marketplace.name}</div>
                <div className="text-xs opacity-80">
                  {t(marketplace.descriptionKey)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-tier-free" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{t('landing.marketplace.oauthSecure')}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-tier-free" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{t('landing.marketplace.readOnly')}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-tier-free" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{t('landing.marketplace.disconnectAnytime')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
