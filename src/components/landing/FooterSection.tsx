import { Badge } from "@/components/ui/badge";
import { Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/OptimizedImage";
import saaiLogo from "@/assets/saai-logo.png";

export function FooterSection() {
  return (
    <footer className="border-t border-border py-12 px-4" role="contentinfo">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary opacity-15 blur-lg rounded-full" />
                <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-2 rounded-xl border border-primary/10">
                  <OptimizedImage 
                    src={saaiLogo} 
                    alt="SAAI - AI-powered Scrum Master assistant logo" 
                    className="h-8 w-8 object-contain relative z-10" 
                  />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SAAI
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered Scrum Master assistant for agile teams
            </p>
          </div>
          <nav aria-label="Product navigation">
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground" role="list">
              <li>
                <Link to="/landing#features" className="hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/integrations" className="hover:text-foreground transition-colors">
                  Integrations
                </Link>
              </li>
              <li>
                <Link to="/user-guide" className="hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Company navigation">
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground" role="list">
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Legal navigation">
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground" role="list">
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-border mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
            <p className="text-muted-foreground text-center md:text-left">© 2025 SAAI All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" aria-hidden="true" />
              <span className="font-medium">
                Built by{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent font-semibold">
                  Faith Invictus Studio
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
