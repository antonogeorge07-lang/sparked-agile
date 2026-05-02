import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy - Spark-Agile</title>
        <meta name="description" content="Spark-Agile privacy policy covering data collection, usage, and your rights under GDPR." />
      </Helmet>
      <Navigation />
      <main className="container mx-auto px-4 py-12 mt-16 max-w-4xl">
        <BackButton fallbackPath="/" className="mb-6" />
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">{t("pages.privacy.title")}</h1>
            <p className="text-muted-foreground">{t("pages.privacy.lastUpdated", { date: new Date().toLocaleDateString() })}</p>
          </div>
        </div>
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl">{t("pages.privacy.dataProtection")}</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. {t("pages.privacy.introduction")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.privacy.introText1")}</p>
              <p className="text-muted-foreground mb-4">{t("pages.privacy.introText2")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. {t("pages.privacy.infoWeCollect")}</h2>
              <h3 className="text-xl font-medium mb-2">2.1 {t("pages.privacy.personalInfo")}</h3>
              <p className="text-muted-foreground mb-4">{t("pages.privacy.personalInfoDesc")}</p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>{t("pages.privacy.nameEmail")}</li>
                <li>{t("pages.privacy.accountCredentials")}</li>
                <li>{t("pages.privacy.profileInfo")}</li>
                <li>{t("pages.privacy.paymentInfo")}</li>
              </ul>

              <h3 className="text-xl font-medium mb-2">2.2 {t("pages.privacy.usageData")}</h3>
              <p className="text-muted-foreground mb-4">{t("pages.privacy.usageDataDesc")}</p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>{t("pages.privacy.logData")}</li>
                <li>{t("pages.privacy.deviceInfo")}</li>
                <li>{t("pages.privacy.ipAddress")}</li>
                <li>{t("pages.privacy.cookies")}</li>
              </ul>

              <h3 className="text-xl font-medium mb-2">2.3 {t("pages.privacy.projectData")}</h3>
              <p className="text-muted-foreground mb-4">{t("pages.privacy.projectDataDesc")}</p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>{t("pages.privacy.sprintData")}</li>
                <li>{t("pages.privacy.retroFeedback")}</li>
                <li>{t("pages.privacy.integrationData")}</li>
                <li>{t("pages.privacy.aiRecommendations")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. {t("pages.privacy.howWeUse")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.privacy.howWeUseDesc")}</p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>{t("pages.privacy.provideMaintain")}</li>
                <li>{t("pages.privacy.processTransactions")}</li>
                <li>{t("pages.privacy.generateInsights")}</li>
                <li>{t("pages.privacy.sendCommunications")}</li>
                <li>{t("pages.privacy.monitorAnalyze")}</li>
                <li>{t("pages.privacy.detectPrevent")}</li>
                <li>{t("pages.privacy.complyLegal")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. {t("pages.privacy.dataSharing")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.privacy.dataSharingDesc")}</p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li><strong>{t("pages.privacy.teamMembers")}</strong></li>
                <li><strong>{t("pages.privacy.serviceProviders")}</strong></li>
                <li><strong>{t("pages.privacy.businessTransfers")}</strong></li>
                <li><strong>{t("pages.privacy.legalRequirements")}</strong></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. {t("pages.privacy.dataSecurity")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.privacy.dataSecurityDesc")}</p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>{t("pages.privacy.encryptionTransitRest")}</li>
                <li>{t("pages.privacy.rlsSecurity")}</li>
                <li>{t("pages.privacy.regularAudits")}</li>
                <li>{t("pages.privacy.secureIntegrations")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. {t("pages.privacy.yourRights")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.privacy.yourRightsDesc")}</p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>{t("pages.privacy.accessUpdateDelete")}</li>
                <li>{t("pages.privacy.exportData")}</li>
                <li>{t("pages.privacy.optOut")}</li>
                <li>{t("pages.privacy.disableCookies")}</li>
                <li>{t("pages.privacy.requestDeletion")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. {t("pages.privacy.dataRetention")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.privacy.dataRetentionDesc")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. {t("pages.privacy.internationalTransfers")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.privacy.internationalTransfersDesc")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. {t("pages.privacy.childrensPrivacy")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.privacy.childrensPrivacyDesc")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. {t("pages.privacy.changesToPolicy")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.privacy.changesToPolicyDesc")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. {t("pages.privacy.gdprCompliance")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.privacy.gdprComplianceDesc")}</p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>{t("pages.privacy.rightAccess")}</li>
                <li>{t("pages.privacy.rightRectification")}</li>
                <li>{t("pages.privacy.rightErasure")}</li>
                <li>{t("pages.privacy.rightRestrict")}</li>
                <li>{t("pages.privacy.rightPortability")}</li>
                <li>{t("pages.privacy.rightObject")}</li>
                <li>{t("pages.privacy.rightWithdraw")}</li>
              </ul>
              <p className="text-muted-foreground mb-4">{t("pages.privacy.exerciseRights")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. {t("pages.privacy.contactInfo")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.privacy.contactInfoDesc")}</p>
              <p className="text-muted-foreground">
                <strong>{t("pages.privacy.dataController")}:</strong> Make, Founder of Spark-Agile<br />
                <strong>{t("pages.privacy.email")}:</strong> support@spark-agile.com<br />
                <strong>{t("pages.privacy.support")}:</strong> support@spark-agile.com
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
