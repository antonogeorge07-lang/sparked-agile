import { FeedbackSubmissionForm } from "@/components/FeedbackSubmissionForm";
import { FeedbackDisplay } from "@/components/FeedbackDisplay";

export function FeedbackSection() {
  return (
    <section className="py-20 px-4 bg-muted/30" aria-labelledby="feedback-heading">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-12">
          <h2 id="feedback-heading" className="text-3xl md:text-4xl font-bold mb-4">
            Real Feedback from Real Users
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-6">
            We believe in transparency and continuous improvement. Share your experience, positive or negative,
            and help us build a better product together. All approved feedback is displayed publicly.
          </p>
        </header>
        
        <div className="mb-12 max-w-2xl mx-auto">
          <FeedbackSubmissionForm />
        </div>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold mb-2">What Our Community Says</h3>
          <p className="text-sm text-muted-foreground">
            Every voice matters. We learn from every piece of feedback. Share your experience above, and see what others are saying below.
          </p>
        </div>
        
        <FeedbackDisplay />
      </div>
    </section>
  );
}
