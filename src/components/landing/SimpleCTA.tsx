import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function SimpleCTA() {
  return (
    <section className="py-16 px-4" aria-labelledby="cta-heading">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 id="cta-heading" className="text-2xl md:text-3xl font-bold mb-4">
          Ready to streamline your agile workflow?
        </h2>
        <p className="text-muted-foreground mb-6">
          Free to start. No credit card required.
        </p>
        <Link to="/auth">
          <Button size="lg" className="gap-2">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
