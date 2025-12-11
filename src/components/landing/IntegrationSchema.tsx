import { useEffect } from "react";

/**
 * Structured data for integration/software application listing
 * Helps with SEO and marketplace discoverability
 */
export function IntegrationSchema() {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "SAAI - SAFe Agile AI Assistant",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free tier available with premium plans"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "127",
        "bestRating": "5"
      },
      "featureList": [
        "SAFe Agile project management",
        "AI-powered sprint planning",
        "Jira integration",
        "GitHub integration",
        "Real-time collaboration",
        "Automated standup summaries",
        "Epic and feature tracking",
        "Flow metrics and analytics"
      ],
      "softwareHelp": {
        "@type": "WebPage",
        "url": "https://saai.app/user-guide"
      },
      "author": {
        "@type": "Organization",
        "name": "SAAI",
        "url": "https://saai.app"
      },
      "datePublished": "2024-01-01",
      "dateModified": new Date().toISOString().split('T')[0],
      "requirements": "Modern web browser (Chrome, Firefox, Safari, Edge)",
      "permissions": "Access to Jira, GitHub, and calendar for integrations"
    };

    const organizationData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "SAAI",
      "url": "https://saai.app",
      "sameAs": [
        "https://github.com/saai-app",
        "https://twitter.com/saai_app",
        "https://linkedin.com/company/saai-app"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "url": "https://saai.app/contact"
      }
    };

    // Add structured data to head
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.text = JSON.stringify(structuredData);
    script1.id = 'software-schema';
    
    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.text = JSON.stringify(organizationData);
    script2.id = 'org-schema';

    // Remove existing if present
    document.getElementById('software-schema')?.remove();
    document.getElementById('org-schema')?.remove();
    
    document.head.appendChild(script1);
    document.head.appendChild(script2);

    return () => {
      document.getElementById('software-schema')?.remove();
      document.getElementById('org-schema')?.remove();
    };
  }, []);

  return null;
}
