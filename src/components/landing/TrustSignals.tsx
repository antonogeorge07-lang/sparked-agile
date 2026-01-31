import { motion } from "framer-motion";
import { Shield, Lock, Eye, Code2, FileCheck, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const TrustSignals = () => {
  const securityFeatures = [
    {
      icon: Lock,
      label: "AES-256 Encryption",
      description: "All tokens encrypted at rest",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Shield,
      label: "196+ RLS Policies",
      description: "Row-level security on every table",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Eye,
      label: "GDPR Compliant",
      description: "Data export & anonymization",
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      icon: FileCheck,
      label: "Audit Logging",
      description: "All sensitive access tracked",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: Server,
      label: "Edge Functions",
      description: "Secure serverless backend",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      icon: Code2,
      label: "Open Architecture",
      description: "Built on proven foundations",
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
  ];

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <Badge variant="outline" className="mb-3 gap-2 px-3 py-1.5">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            Enterprise-Grade Security
          </Badge>
          <h3 className="text-xl md:text-2xl font-bold">
            Your Data is Protected by Design
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Not just promises—these are actual security measures implemented in the platform
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/20 transition-all group"
              >
                <div className={`p-2 rounded-lg ${feature.bgColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-4 w-4 ${feature.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{feature.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{feature.description}</p>
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
          className="mt-8 flex justify-center"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium">Actively Developed</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">New features shipping weekly</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
