import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TermsOfService() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <BackButton fallbackPath="/" className="mb-6" />
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-elegant">
            <FileText className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">{t("pages.terms.title")}</h1>
            <p className="text-muted-foreground">{t("pages.terms.lastUpdated", { date: new Date().toLocaleDateString() })}</p>
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl">{t("pages.terms.legalAgreement")}</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. {t("pages.terms.acceptanceOfTerms")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.terms.acceptanceDesc")}</p>
              <p className="text-muted-foreground mb-4">{t("pages.terms.operatedBy")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. {t("pages.terms.descriptionOfService")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.terms.descriptionDesc")}</p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>{t("pages.terms.sprintPlanning")}</li>
                <li>{t("pages.terms.standupManagement")}</li>
                <li>{t("pages.terms.retroReviews")}</li>
                <li>{t("pages.terms.integrationServices")}</li>
                <li>{t("pages.terms.aiInsightsRec")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. {t("pages.terms.userAccounts")}</h2>
              <h3 className="text-xl font-medium mb-2">3.1 {t("pages.terms.registration")}</h3>
              <p className="text-muted-foreground mb-4">{t("pages.terms.registrationDesc")}</p>
              <h3 className="text-xl font-medium mb-2">3.2 {t("pages.terms.accountSecurity")}</h3>
              <p className="text-muted-foreground mb-4">{t("pages.terms.accountSecurityDesc")}</p>
              <h3 className="text-xl font-medium mb-2">3.3 {t("pages.terms.accountTermination")}</h3>
              <p className="text-muted-foreground mb-4">{t("pages.terms.accountTerminationDesc")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. {t("pages.terms.subscriptionPayment")}</h2>
              <h3 className="text-xl font-medium mb-2">4.1 {t("pages.terms.subscriptionPlans")}</h3>
              <p className="text-muted-foreground mb-4">{t("pages.terms.subscriptionPlansDesc")}</p>
              <h3 className="text-xl font-medium mb-2">4.2 {t("pages.terms.paymentTerms")}</h3>
              <p className="text-muted-foreground mb-4">{t("pages.terms.paymentTermsDesc")}</p>
              <h3 className="text-xl font-medium mb-2">4.3 {t("pages.terms.refundPolicy")}</h3>
              <p className="text-muted-foreground mb-4">{t("pages.terms.refundPolicyDesc")}</p>
              <h3 className="text-xl font-medium mb-2">4.4 {t("pages.terms.cancellation")}</h3>
              <p className="text-muted-foreground mb-4">{t("pages.terms.cancellationDesc")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. {t("pages.terms.userResponsibilities")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.terms.userResponsibilitiesDesc")}</p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>{t("pages.terms.maintainSecurity")}</li>
                <li>{t("pages.terms.ensureAccuracy")}</li>
                <li>{t("pages.terms.complyLaws")}</li>
                <li>{t("pages.terms.reviewAI")}</li>
                <li>{t("pages.terms.respectIP")}</li>
                <li>{t("pages.terms.noReverseEngineer")}</li>
                <li>{t("pages.terms.noIllegalUse")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. {t("pages.terms.intellectualProperty")}</h2>
              <h3 className="text-xl font-medium mb-2">6.1 {t("pages.terms.ourRights")}</h3>
              <p className="text-muted-foreground mb-4">{t("pages.terms.ourRightsDesc")}</p>
              <h3 className="text-xl font-medium mb-2">6.2 {t("pages.terms.yourContent")}</h3>
              <p className="text-muted-foreground mb-4">{t("pages.terms.yourContentDesc")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. {t("pages.terms.aiGeneratedContent")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.terms.aiGeneratedContentDesc")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. {t("pages.terms.thirdPartyIntegrations")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.terms.thirdPartyIntegrationsDesc")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. {t("pages.terms.disclaimerOfWarranties")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.terms.disclaimerOfWarrantiesDesc")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. {t("pages.terms.limitationOfLiability")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.terms.limitationOfLiabilityDesc")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. {t("pages.terms.indemnification")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.terms.indemnificationDesc")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. {t("pages.terms.changesToTerms")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.terms.changesToTermsDesc")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. {t("pages.terms.governingLaw")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.terms.governingLawDesc")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. {t("pages.terms.contactInfo")}</h2>
              <p className="text-muted-foreground mb-4">{t("pages.terms.contactInfoDesc")}</p>
              <p className="text-muted-foreground">
                <strong>{t("pages.terms.company")}:</strong> Antono George<br />
                <strong>{t("pages.terms.email")}:</strong> Antono.George1@outlook.com<br />
                <strong>{t("pages.terms.support")}:</strong> Antono.George1@outlook.com
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
