import { useEffect } from "react";

export const FAQSchema = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is SAAI?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SAAI is an AI-powered agile project management platform that automates sprint planning, standups, retrospectives, and backlog refinement. It integrates seamlessly with JIRA, GitHub, and Microsoft 365 to streamline your agile workflow."
          }
        },
        {
          "@type": "Question",
          "name": "How much does SAAI cost?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SAAI offers a free forever plan with no credit card required. Premium plans are available for teams that need advanced features, unlimited projects, and priority support. Free tier includes core AI features and up to 10 team members."
          }
        },
        {
          "@type": "Question",
          "name": "Can SAAI integrate with JIRA and GitHub?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! SAAI offers native integrations with JIRA, GitHub, and Microsoft 365. Sync your backlog, issues, and commits automatically. Set up takes less than 2 minutes per integration."
          }
        },
        {
          "@type": "Question",
          "name": "Is SAAI suitable for SAFe framework?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely. SAAI provides built-in support for SAFe (Scaled Agile Framework) including Value Streams, Agile Release Trains (ARTs), Program Increments (PIs), and OKR tracking. It's one of the few tools with native SAFe support at this price point."
          }
        },
        {
          "@type": "Question",
          "name": "How does the AI assistant work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Omair, the AI assistant, uses advanced language models to provide expert guidance on agile methodologies, sprint planning best practices, ceremony facilitation, and platform usage. It answers questions about project management concepts and helps you navigate SAAI features effectively."
          }
        },
        {
          "@type": "Question",
          "name": "Is my data secure in SAAI?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. SAAI implements enterprise-grade security including Row-Level Security (RLS) policies, comprehensive input validation, encrypted data at rest, and regular security audits. We are GDPR compliant and maintain 99.9% uptime with automated backups."
          }
        },
        {
          "@type": "Question",
          "name": "Can I try SAAI before committing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! Try our interactive demo on the homepage - no signup required. You can also start with our free forever plan which includes all core features. Upgrade only when you need advanced capabilities for larger teams."
          }
        },
        {
          "@type": "Question",
          "name": "How quickly can I set up SAAI?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can set up your first project in under 2 minutes. Create an account, add your team members, and start getting AI-powered insights immediately. Integration setup with JIRA or GitHub takes an additional 2-3 minutes."
          }
        }
      ]
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
};