import { Badge } from "@/components/ui/badge";
import { Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/OptimizedImage";
import saaiLogo from "@/assets/saai-logo.png";

export function FooterSection() {
  return (
    <footer className="border-t border-border py-12 px-4" role="contentinfo">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <OptimizedImage 
                src={saaiLogo} 
                alt="SAAI - AI-powered Scrum Master assistant logo" 
                className="h-10 w-auto object-contain" 
              />
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered Scrum Master assistant for agile teams
            </p>
          </div>
          <nav aria-label="Product navigation">
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground" role="list">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#integrations" className="hover:text-foreground transition-colors">Integrations</a></li>
              <li><a href="#documentation" className="hover:text-foreground transition-colors">Documentation</a></li>
            </ul>
          </nav>
          <nav aria-label="Company navigation">
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground" role="list">
              <li><a href="#about" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#blog" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#careers" className="hover:text-foreground transition-colors">Careers</a></li>
              <li>
                <Link to="/contact" className="hover:text-foreground transition-colors">
                  Contact
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
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p className="text-muted-foreground">© 2025 SAAI All rights reserved.</p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" aria-hidden="true" />
              <span className="font-medium">
                Crafted with excellence by{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent font-semibold">
                  Antono George
                </span>
              </span>
              <Badge variant="secondary" className="ml-2 gap-1">
                <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                Product Manager
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
