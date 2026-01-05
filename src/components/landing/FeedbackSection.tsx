import { FeedbackSubmissionForm } from "@/components/FeedbackSubmissionForm";
import { FeedbackDisplay } from "@/components/FeedbackDisplay";
import { useTranslation } from "react-i18next";

export function FeedbackSection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-4 bg-muted/30" aria-labelledby="feedback-heading">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-12">
          <h2 id="feedback-heading" className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.feedback.title')}
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-6">
            {t('landing.feedback.subtitle')}
          </p>
        </header>
        
        <div className="mb-12 max-w-2xl mx-auto">
          <FeedbackSubmissionForm />
        </div>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold mb-2">{t('landing.feedback.communityTitle')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('landing.feedback.communitySubtitle')}
          </p>
        </div>
        
        <FeedbackDisplay />
      </div>
    </section>
  );
}