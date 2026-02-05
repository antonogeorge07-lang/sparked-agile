import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsOfService() {
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
            <h1 className="text-4xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl">Legal Agreement</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                Welcome to SAAI (Spark-Agile Active Intelligence). By accessing and using this Service, 
                you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, 
                please do not use the Service.
              </p>
              <p className="text-muted-foreground mb-4">
                SAAI is operated by Antono George, committed to providing quality AI-powered Agile tools.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground mb-4">
                SAAI provides an AI-powered Scrum Master assistant platform that helps teams with:
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>Sprint planning and backlog refinement</li>
                <li>Daily standup management</li>
                <li>Sprint retrospectives and reviews</li>
                <li>Integration with JIRA, GitHub, and Microsoft services</li>
                <li>AI-generated insights and recommendations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-medium mb-2">3.1 Registration</h3>
              <p className="text-muted-foreground mb-4">
                You must create an account to use our Service. You agree to provide accurate, current, and complete 
                information during registration and to update such information to keep it accurate, current, and complete.
              </p>
              
              <h3 className="text-xl font-medium mb-2">3.2 Account Security</h3>
              <p className="text-muted-foreground mb-4">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities 
                that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>

              <h3 className="text-xl font-medium mb-2">3.3 Account Termination</h3>
              <p className="text-muted-foreground mb-4">
                We reserve the right to suspend or terminate your account if you violate these Terms of Service or 
                engage in activities that may harm the Service or other users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Subscription and Payment</h2>
              <h3 className="text-xl font-medium mb-2">4.1 Subscription Plans</h3>
              <p className="text-muted-foreground mb-4">
                We offer various subscription plans with different features and pricing. Details of each plan are available 
                on our pricing page.
              </p>

              <h3 className="text-xl font-medium mb-2">4.2 Payment Terms</h3>
              <p className="text-muted-foreground mb-4">
                Subscription fees are billed in advance on a monthly or yearly basis. All payments are processed securely 
                through Stripe. You authorize us to charge your payment method for all fees incurred.
              </p>

              <h3 className="text-xl font-medium mb-2">4.3 Refund Policy</h3>
              <p className="text-muted-foreground mb-4">
                We offer a 14-day money-back guarantee for new subscriptions. Refund requests must be submitted within 
                14 days of the initial purchase. No refunds are provided for partial subscription periods or downgrades.
              </p>

              <h3 className="text-xl font-medium mb-2">4.4 Cancellation</h3>
              <p className="text-muted-foreground mb-4">
                You may cancel your subscription at any time. Upon cancellation, you will retain access to the Service 
                until the end of your current billing period.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. User Responsibilities</h2>
              <p className="text-muted-foreground mb-4">As a user of SAAI, you are responsible for:</p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>Maintaining the security of your account credentials</li>
                <li>Ensuring all information you provide is accurate and current</li>
                <li>Using the Service in compliance with applicable laws and regulations</li>
                <li>Reviewing and validating AI-generated content before use in critical decisions</li>
                <li>Respecting the intellectual property rights of others</li>
                <li>Not attempting to reverse engineer, hack, or disrupt the Service</li>
                <li>Not using the Service for illegal or harmful purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <h3 className="text-xl font-medium mb-2">6.1 Our Rights</h3>
              <p className="text-muted-foreground mb-4">
                The Service, including its original content, features, and functionality, is owned by SAAI 
                and is protected by international copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-medium mb-2">6.2 Your Content</h3>
              <p className="text-muted-foreground mb-4">
                You retain all rights to the data and content you submit to the Service. By submitting content, you grant 
                us a non-exclusive, worldwide, royalty-free license to use, store, and process your content solely for 
                providing and improving the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. AI-Generated Content</h2>
              <p className="text-muted-foreground mb-4">
                Our Service uses AI to generate insights, summaries, and recommendations. While we strive for accuracy, 
                AI-generated content may contain errors or inaccuracies. You are responsible for reviewing and validating 
                all AI-generated content before use in critical decision-making.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Third-Party Integrations</h2>
              <p className="text-muted-foreground mb-4">
                Our Service integrates with third-party platforms (JIRA, GitHub, Microsoft services). Your use of these 
                integrations is subject to the respective third-party terms of service. We are not responsible for the 
                availability, accuracy, or reliability of third-party services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. 
                WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SAAI SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER 
                INCURRED DIRECTLY OR INDIRECTLY.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
              <p className="text-muted-foreground mb-4">
                You agree to indemnify and hold harmless SAAI from any claims, losses, damages, liabilities, 
                and expenses arising out of your use of the Service or violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email 
                or through the Service. Your continued use of the Service after such modifications constitutes acceptance 
                of the updated Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
              <p className="text-muted-foreground mb-4">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about these Terms, we're here to help. Please contact us at:
              </p>
              <p className="text-muted-foreground">
                <strong>Company:</strong> Antono George<br />
                <strong>Email:</strong> Antono.George1@outlook.com<br />
                <strong>Support:</strong> Antono.George1@outlook.com
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
