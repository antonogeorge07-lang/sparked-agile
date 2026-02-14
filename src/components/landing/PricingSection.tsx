 import { Card, CardContent, CardHeader } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Check, Sparkles, Zap, Clock, ArrowRight, Wrench, Star, Shield, Users, Rocket } from "lucide-react";
 import { Link } from "react-router-dom";
 import { useTranslation } from "react-i18next";
 import { useState } from "react";
 import { motion } from "framer-motion";
 
 interface PricingSectionProps {
   onEarlyAccess: () => void;
 }
 
 export function PricingSection({ onEarlyAccess }: PricingSectionProps) {
   const { t } = useTranslation();
   const [hoveredTier, setHoveredTier] = useState<'free' | 'coming-soon' | null>(null);
 
  const freeFeatures = [
    { name: "Native Kanban & Sprint Board", icon: Zap },
    { name: "AI Co-Pilot (Gemini-powered)", icon: Sparkles },
    { name: "Google Integration (Sign-In + Calendar)", icon: Zap },
    { name: "Sprint Ceremonies", icon: Users },
    { name: "AI Standup Summaries", icon: Sparkles },
    { name: "Epic Management & Gantt Charts", icon: Rocket },
    { name: "Multi-Agent AI Debate", icon: Sparkles },
    { name: "Stakeholder Portal", icon: Shield },
    { name: "Executive Digest", icon: Star },
    { name: "9-Language Support", icon: Zap },
    { name: "SAFe Workflows", icon: Rocket },
    { name: "Advanced Analytics", icon: Star },
    { name: "Team Collaboration", icon: Users },
    { name: "Retrospective Insights", icon: Sparkles },
  ];
 
   const comingSoonFeatures = [
     { name: "White-label Branding", status: "Planned", icon: Star },
     { name: "Enterprise SSO (SAML)", status: "Planned", icon: Shield },
     { name: "Priority Support Tiers", status: "Planned", icon: Users },
   ];
 
   const containerVariants = {
     hidden: { opacity: 0 },
     visible: {
       opacity: 1,
       transition: { staggerChildren: 0.1 }
     }
   };
 
   const itemVariants = {
     hidden: { opacity: 0, y: 20 },
     visible: { opacity: 1, y: 0 }
   };
 
   return (
     <section className="py-24 px-4 relative overflow-hidden" aria-labelledby="pricing-heading">
       {/* Gradient background */}
       <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
       
       {/* Decorative elements */}
       <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
       <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
 
       <div className="container mx-auto max-w-5xl relative z-10">
         <motion.header 
           className="text-center mb-16"
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.5 }}
         >
           <Badge className="gap-2 mb-6 px-4 py-2 text-sm" variant="secondary">
             <Sparkles className="h-3 w-3" aria-hidden="true" />
             {t('landing.pricing.badge')}
           </Badge>
           <h2 id="pricing-heading" className="text-4xl md:text-5xl font-bold font-heading mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
             {t('landing.pricing.title')}
           </h2>
           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
             {t('landing.pricing.subtitle')}
           </p>
         </motion.header>
 
         <motion.div 
           className="grid md:grid-cols-2 gap-8"
           variants={containerVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
         >
           {/* Free Tier */}
           <motion.div variants={itemVariants}>
             <Card 
               className={`relative overflow-hidden transition-all duration-500 h-full
                 ${hoveredTier === 'free' 
                   ? 'scale-[1.02] shadow-2xl shadow-primary/20 border-primary/50' 
                   : 'hover:shadow-xl border-border/50 hover:border-primary/30'}`}
               onMouseEnter={() => setHoveredTier('free')}
               onMouseLeave={() => setHoveredTier(null)}
             >
               {/* Gradient overlay */}
               <div 
                 className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 transition-opacity duration-500" 
                 style={{ opacity: hoveredTier === 'free' ? 1 : 0 }}
               />
               
               {/* Popular badge */}
               <div className="absolute -top-px -right-px">
                 <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-bl-xl rounded-tr-lg">
                   Most Popular
                 </div>
               </div>
 
               <CardHeader className="pb-4 pt-8 relative z-10">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/30">
                     <Zap className="h-6 w-6 text-primary-foreground" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold">{t('landing.pricing.freeTitle')}</h3>
                     <p className="text-sm text-muted-foreground">For teams of all sizes</p>
                   </div>
                 </div>
                 
                 <div className="flex items-baseline gap-1 mb-2">
                   <span className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                     {t('landing.pricing.freePrice')}
                   </span>
                   <span className="text-muted-foreground text-lg">{t('landing.pricing.perMonth')}</span>
                 </div>
                 
                 <p className="text-muted-foreground">{t('landing.pricing.freeDescription')}</p>
               </CardHeader>
 
               <CardContent className="pt-0 relative z-10">
                 <Link to="/auth" className="block mb-8">
                   <Button 
                     size="lg" 
                     className="w-full gap-2 group h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                   >
                     {t('landing.pricing.freeCta')}
                     <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                   </Button>
                 </Link>
                 
                 <div className="space-y-3">
                   <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                     Everything included
                   </p>
                   <div className="grid gap-3">
                     {freeFeatures.map((feature, i) => (
                       <motion.div 
                         key={i} 
                         className="flex gap-3 items-center text-sm group/item"
                         initial={{ opacity: 0, x: -10 }}
                         whileInView={{ opacity: 1, x: 0 }}
                         transition={{ delay: i * 0.03 }}
                         viewport={{ once: true }}
                       >
                         <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover/item:bg-primary/20 transition-colors">
                           <Check className="h-3 w-3 text-primary" />
                         </div>
                         <span className="group-hover/item:text-foreground transition-colors">{feature.name}</span>
                       </motion.div>
                     ))}
                   </div>
                 </div>
               </CardContent>
             </Card>
           </motion.div>
 
           {/* Coming Soon */}
           <motion.div variants={itemVariants}>
             <Card 
               className={`relative overflow-hidden transition-all duration-500 h-full border-dashed
                 ${hoveredTier === 'coming-soon' 
                   ? 'scale-[1.02] shadow-xl border-muted-foreground/40' 
                   : 'hover:shadow-lg border-muted-foreground/20 hover:border-muted-foreground/30'}`}
               onMouseEnter={() => setHoveredTier('coming-soon')}
               onMouseLeave={() => setHoveredTier(null)}
             >
               {/* Badge */}
               <div className="absolute -top-px -right-px">
                 <div className="bg-muted text-muted-foreground text-xs font-semibold px-4 py-1.5 rounded-bl-xl rounded-tr-lg flex items-center gap-1.5">
                   <Wrench className="h-3 w-3" />
                   In Development
                 </div>
               </div>
 
               <CardHeader className="pb-4 pt-8">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-muted to-muted/70 border border-border">
                     <Clock className="h-6 w-6 text-muted-foreground" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold">Coming Soon</h3>
                     <p className="text-sm text-muted-foreground">Enterprise features</p>
                   </div>
                 </div>
                 
                 <div className="flex items-baseline gap-2 mb-2">
                   <span className="text-2xl font-bold text-muted-foreground">
                     Launching in 30 days
                   </span>
                 </div>
                 
                 <p className="text-muted-foreground">
                   Advanced features being developed by Antono George
                 </p>
               </CardHeader>
 
               <CardContent className="pt-0">
                 <Button 
                   size="lg" 
                   className="w-full gap-2 mb-8 h-12 text-base font-semibold"
                   variant="outline"
                   onClick={onEarlyAccess}
                 >
                   Get Notified When Ready
                   <ArrowRight className="h-4 w-4" />
                 </Button>
                 
                 <div className="space-y-3">
                   <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                     On the roadmap
                   </p>
                   <div className="grid gap-4">
                     {comingSoonFeatures.map((feature, i) => (
                       <motion.div 
                         key={i} 
                         className="flex gap-3 items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted transition-colors"
                         initial={{ opacity: 0, x: -10 }}
                         whileInView={{ opacity: 1, x: 0 }}
                         transition={{ delay: i * 0.1 }}
                         viewport={{ once: true }}
                       >
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border">
                             <feature.icon className="h-4 w-4 text-muted-foreground" />
                           </div>
                           <span className="font-medium">{feature.name}</span>
                         </div>
                         <Badge variant="outline" className="shrink-0 text-xs bg-background">
                           {feature.status}
                         </Badge>
                       </motion.div>
                     ))}
                   </div>
                 </div>
 
                 {/* Decorative timeline */}
                 <div className="mt-8 pt-6 border-t border-border/50">
                   <div className="flex items-center gap-3 text-sm text-muted-foreground">
                     <div className="flex -space-x-2">
                       <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                         <span className="text-xs font-bold text-primary">Q1</span>
                       </div>
                       <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                         <span className="text-xs font-bold">Q2</span>
                       </div>
                     </div>
                     <span>Rolling out throughout 2026</span>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </motion.div>
         </motion.div>
 
         {/* Beta banner */}
         <motion.div 
           className="mt-16 text-center"
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.3 }}
         >
           <Card className="inline-block bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20 overflow-hidden relative">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_50%)]" />
             <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-6 relative">
               <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
                 <Sparkles className="h-7 w-7 text-primary-foreground" />
               </div>
               <div className="text-left">
                 <h3 className="font-bold text-lg mb-1">{t('landing.pricing.betaAccess')}</h3>
                 <p className="text-sm text-muted-foreground max-w-md">{t('landing.pricing.betaDescription')}</p>
               </div>
               <Button 
                 onClick={onEarlyAccess} 
                 className="shrink-0 gap-2 group shadow-lg shadow-primary/20"
               >
                 {t('landing.pricing.getNotified')}
                 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
               </Button>
             </CardContent>
           </Card>
         </motion.div>
       </div>
     </section>
   );
 }