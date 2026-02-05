import { motion } from "framer-motion";
import { Shield, Lock, Eye, Code2, FileCheck, Server, CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export const TrustSignals = () => {
  const { t } = useTranslation();

  const securityFeatures = [
    {
      icon: Lock,
      labelKey: "landing.trustSignals.features.encryption",
      descKey: "landing.trustSignals.features.encryptionDesc",
      gradient: "from-emerald-500 to-teal-500",
      glow: "group-hover:shadow-emerald-500/25",
    },
    {
      icon: Shield,
      labelKey: "landing.trustSignals.features.rls",
      descKey: "landing.trustSignals.features.rlsDesc",
      gradient: "from-blue-500 to-cyan-500",
      glow: "group-hover:shadow-blue-500/25",
    },
    {
      icon: Eye,
      labelKey: "landing.trustSignals.features.gdpr",
      descKey: "landing.trustSignals.features.gdprDesc",
      gradient: "from-violet-500 to-purple-500",
      glow: "group-hover:shadow-violet-500/25",
    },
    {
      icon: FileCheck,
      labelKey: "landing.trustSignals.features.audit",
      descKey: "landing.trustSignals.features.auditDesc",
      gradient: "from-amber-500 to-orange-500",
      glow: "group-hover:shadow-amber-500/25",
    },
    {
      icon: Server,
      labelKey: "landing.trustSignals.features.edge",
      descKey: "landing.trustSignals.features.edgeDesc",
      gradient: "from-cyan-500 to-blue-500",
      glow: "group-hover:shadow-cyan-500/25",
    },
    {
      icon: Code2,
      labelKey: "landing.trustSignals.features.open",
      descKey: "landing.trustSignals.features.openDesc",
      gradient: "from-rose-500 to-pink-500",
      glow: "group-hover:shadow-rose-500/25",
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 relative overflow-hidden">
      {/* Dramatic background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Badge 
              variant="outline" 
              className="mb-4 gap-2 px-4 py-2 text-sm border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
            >
              <Shield className="h-4 w-4" />
              {t('landing.trustSignals.badge')}
            </Badge>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              {t('landing.trustSignals.title')}
            </span>
          </h2>
          
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('landing.trustSignals.subtitle')}
          </p>
        </motion.div>

        {/* Security features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.labelKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`group relative p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/60 transition-all duration-500 hover:shadow-2xl ${feature.glow} hover:-translate-y-1`}
              >
                {/* Gradient accent line */}
                <div className={`absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full`} />
                
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 group-hover:text-primary transition-colors">
                      {t(feature.labelKey)}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(feature.descKey)}
                    </p>
                  </div>
                </div>
                
                {/* Checkmark indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live development indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 sm:mt-16 flex justify-center"
        >
          <div className="relative group">
            {/* Animated glow ring */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-primary to-blue-500 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity duration-500 animate-pulse" />
            
            <div className="relative inline-flex items-center gap-4 px-6 py-3 rounded-full border border-border/50 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="font-medium text-sm sm:text-base">{t('landing.trustSignals.activeDevelopment')}</span>
              </div>
              
              <div className="hidden sm:block h-4 w-px bg-border" />
              
              <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm">{t('landing.trustSignals.newFeatures')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
