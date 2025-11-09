import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/hooks/useLanguage";
import { privacyPolicyTranslations } from "@/i18n/translations";

export default function PrivacyPolicy() {
  const { language } = useLanguage();
  const t = privacyPolicyTranslations[language];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <BackButton fallbackPath="/" />
          <LanguageSelector />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl">{t.title}</CardTitle>
            <p className="text-muted-foreground">{t.lastUpdated}: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. {t.sections.introduction.title}</h2>
              <p className="text-muted-foreground mb-4">
                {t.sections.introduction.content}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. {t.sections.informationCollection.title}</h2>
              <h3 className="text-xl font-medium mb-2">2.1 {t.sections.informationCollection.personalInfo.title}</h3>
              <p className="text-muted-foreground mb-4">
                {t.sections.informationCollection.personalInfo.intro}
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                {t.sections.informationCollection.personalInfo.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-medium mb-2">2.2 {t.sections.informationCollection.usageData.title}</h3>
              <p className="text-muted-foreground mb-4">
                {t.sections.informationCollection.usageData.intro}
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                {t.sections.informationCollection.usageData.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-medium mb-2">2.3 {t.sections.informationCollection.projectData.title}</h3>
              <p className="text-muted-foreground mb-4">
                {t.sections.informationCollection.projectData.intro}
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                {t.sections.informationCollection.projectData.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. {t.sections.dataUse.title}</h2>
              <p className="text-muted-foreground mb-4">{t.sections.dataUse.intro}</p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                {t.sections.dataUse.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. {t.sections.dataSharing.title}</h2>
              <p className="text-muted-foreground mb-4">
                {t.sections.dataSharing.intro}
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                {t.sections.dataSharing.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. {t.sections.gdpr.title}</h2>
              <h3 className="text-xl font-medium mb-2">5.1 {t.sections.gdpr.lawfulBasis.title}</h3>
              <p className="text-muted-foreground mb-4">
                {t.sections.gdpr.lawfulBasis.intro}
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                {t.sections.gdpr.lawfulBasis.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-medium mb-2">5.2 {t.sections.gdpr.dpo.title}</h3>
              <p className="text-muted-foreground mb-4">
                {t.sections.gdpr.dpo.content}
              </p>
              <p className="text-muted-foreground mb-4">
                Email: <a href={`mailto:${t.sections.gdpr.dpo.email}`} className="text-primary hover:underline">{t.sections.gdpr.dpo.email}</a>
              </p>

              <h3 className="text-xl font-medium mb-2">5.3 {t.sections.gdpr.rights.title}</h3>
              <p className="text-muted-foreground mb-4">
                {t.sections.gdpr.rights.intro}
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                {t.sections.gdpr.rights.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <p className="text-muted-foreground mb-4">
                {t.sections.gdpr.rights.exercise} <a href={`mailto:${t.sections.gdpr.dpo.email}`} className="text-primary hover:underline">{t.sections.gdpr.dpo.email}</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. {t.sections.contact.title}</h2>
              <p className="text-muted-foreground mb-4">
                {t.sections.contact.content}
              </p>
              <p className="text-muted-foreground">
                Email: <a href={`mailto:${t.sections.contact.privacy}`} className="text-primary hover:underline">{t.sections.contact.privacy}</a><br />
                DPO: <a href={`mailto:${t.sections.contact.dpo}`} className="text-primary hover:underline">{t.sections.contact.dpo}</a>
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
