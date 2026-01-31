import { motion } from "framer-motion";
import { Quote, Lightbulb, Heart, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

export const CreatorStorySection = () => {
  return (
    <section className="py-10 sm:py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-10"
        >
          <span className="text-xs sm:text-sm font-medium text-primary uppercase tracking-wider">
            The Story Behind SAAI
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 bg-gradient-primary bg-clip-text text-transparent">
            Built by a Practitioner, Not a Factory
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-4 sm:p-6 h-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl bg-primary/10 shrink-0">
                  <Quote className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">The Problem I Lived</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    After years managing agile teams, I saw the same pattern: brilliant tools that 
                    created more work, not less. Stand-ups became status theater. Retros generated 
                    action items that vanished. Sprint planning felt like guesswork wrapped in process.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-4 sm:p-6 h-full border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl bg-emerald-500/10 shrink-0">
                  <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">The Solution I Built</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    SAAI isn't another project management tool pretending to be intelligent. 
                    It's a cognitive layer that understands agile context—connecting your Jira, 
                    GitHub, and Slack to surface what matters before you ask.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-4 sm:gap-6"
        >
          <Card className="p-4 sm:p-6 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-amber-500/10 shrink-0">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">Philosophy</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  <span className="font-medium text-foreground">"Active Intelligence, Not Artificial But Genuine"</span>
                  <br />
                  AI should amplify your expertise, not replace your judgment. Every feature 
                  is designed to give you time back, not add another dashboard to check.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-violet-500/10 shrink-0">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-violet-500" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">Honest About Limits</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  SAAI is growing. Some integrations are "Coming Soon." I won't pretend 
                  otherwise. What exists works because it was built from real needs, 
                  not feature checklists.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 sm:mt-10 text-center"
        >
          <p className="text-xs sm:text-sm text-muted-foreground">
            Created by <span className="font-medium text-foreground">George Antono</span> • Faith Invictus Studio
          </p>
        </motion.div>
      </div>
    </section>
  );
};
