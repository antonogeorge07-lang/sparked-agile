import { motion } from "framer-motion";
import { Shield, Lock, Eye, Code2, FileCheck, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export const TrustSignals = () => {
  const { t } = useTranslation();

  const securityFeatures = [
    {
      icon: Lock,
      labelKey: "landing.trustSignals.features.encryption",
      descKey: "landing.trustSignals.features.encryptionDesc",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Shield,
      labelKey: "landing.trustSignals.features.rls",
      descKey: "landing.trustSignals.features.rlsDesc",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Eye,
      labelKey: "landing.trustSignals.features.gdpr",
      descKey: "landing.trustSignals.features.gdprDesc",
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      icon: FileCheck,
      labelKey: "landing.trustSignals.features.audit",
      descKey: "landing.trustSignals.features.auditDesc",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: Server,
      labelKey: "landing.trustSignals.features.edge",
      descKey: "landing.trustSignals.features.edgeDesc",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      icon: Code2,
      labelKey: "landing.trustSignals.features.open",
      descKey: "landing.trustSignals.features.openDesc",
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
  ];

  return (
    <section className="py-8 sm:py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-8"
        >
          <Badge variant="outline" className="mb-3 gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs">
            <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" />
            {t('landing.trustSignals.badge')}
          </Badge>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold">
            {t('landing.trustSignals.title')}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-lg mx-auto px-2">
            {t('landing.trustSignals.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.labelKey}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/20 transition-all group"
              >
                <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${feature.bgColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${feature.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs sm:text-sm truncate">{t(feature.labelKey)}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 sm:truncate">{t(feature.descKey)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Open Development Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-6 sm:mt-8 flex justify-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 px-3 sm:px-4 py-2 rounded-full border border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-medium">{t('landing.trustSignals.activeDevelopment')}</span>
            </div>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">{t('landing.trustSignals.newFeatures')}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
