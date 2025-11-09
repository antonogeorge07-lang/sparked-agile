import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/hooks/useLanguage";
import { termsOfServiceTranslations } from "@/i18n/translations";

export default function TermsOfService() {
  const { language } = useLanguage();
  const t = termsOfServiceTranslations[language];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <BackButton fallbackPath="/" />
          <LanguageSelector />
        </div>
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-elegant">
            <FileText className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">{t.title}</h1>
            <p className="text-muted-foreground">{t.lastUpdated}: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl">{t.legalAgreement}</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. {t.sections.acceptance.title}</h2>
              <p className="text-muted-foreground mb-4">
                {t.sections.acceptance.content}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. {t.sections.description.title}</h2>
              <p className="text-muted-foreground mb-4">
                {t.sections.description.intro}
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                {t.sections.description.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. {t.sections.userAccounts.title}</h2>
              <h3 className="text-xl font-medium mb-2">3.1 {t.sections.userAccounts.registration.title}</h3>
              <p className="text-muted-foreground mb-4">
                {t.sections.userAccounts.registration.content}
              </p>
              
              <h3 className="text-xl font-medium mb-2">3.2 {t.sections.userAccounts.security.title}</h3>
              <p className="text-muted-foreground mb-4">
                {t.sections.userAccounts.security.content}
              </p>

              <h3 className="text-xl font-medium mb-2">3.3 {t.sections.userAccounts.termination.title}</h3>
              <p className="text-muted-foreground mb-4">
                {t.sections.userAccounts.termination.content}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. {t.sections.contact.title}</h2>
              <p className="text-muted-foreground mb-4">
                {t.sections.contact.content}
              </p>
              <p className="text-muted-foreground">
                Email: <a href={`mailto:${t.sections.contact.email}`} className="text-primary hover:underline">{t.sections.contact.email}</a>
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
