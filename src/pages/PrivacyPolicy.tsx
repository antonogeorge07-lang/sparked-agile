import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 mt-16 max-w-4xl">
        <BackButton fallbackPath="/" className="mb-6" />
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl">Data Protection & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                Welcome to SAAI (Spark-Agile Active Intelligence). We at Antono George 
                are committed to protecting your privacy. This Privacy Policy explains how we collect, use, 
                and safeguard your information when you use SAAI.
              </p>
              <p className="text-muted-foreground mb-4">
                As a micro-studio, we take data protection seriously and comply with GDPR and 
                other applicable data protection laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-medium mb-2">2.1 Personal Information</h3>
              <p className="text-muted-foreground mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>Name and email address</li>
                <li>Account credentials</li>
                <li>Profile information and preferences</li>
                <li>Payment information (processed securely through Stripe)</li>
              </ul>

              <h3 className="text-xl font-medium mb-2">2.2 Usage Data</h3>
              <p className="text-muted-foreground mb-4">
                We automatically collect certain information about your device and how you interact with our service:
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>Log data and usage patterns</li>
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3 className="text-xl font-medium mb-2">2.3 Project Data</h3>
              <p className="text-muted-foreground mb-4">
                When you use our platform, we collect and process:
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>Sprint planning data and backlog information</li>
                <li>Retrospective feedback and insights</li>
                <li>Integration data from JIRA, GitHub, and Microsoft services</li>
                <li>AI-generated recommendations and summaries</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Generate AI-powered insights and recommendations</li>
                <li>Send administrative and marketing communications</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect, prevent, and address technical issues and fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-4">
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li><strong>With your team members:</strong> Project data is shared with authorized team members within your workspace</li>
                <li><strong>Service providers:</strong> We use trusted third-party services including cloud hosting, payment processing, and analytics</li>
                <li><strong>Business transfers:</strong> In connection with any merger, sale, or acquisition</li>
                <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>Encryption of data in transit and at rest</li>
                <li>Row-level security and role-based access control</li>
                <li>Regular security audits and updates</li>
                <li>Secure third-party integrations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
              <p className="text-muted-foreground mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>Access, update, or delete your personal information</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of marketing communications</li>
                <li>Disable cookies through your browser settings</li>
                <li>Request deletion of your account and associated data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                We retain your information for as long as necessary to provide our services and comply with legal obligations. 
                When you delete your account, we will delete or anonymize your data within 30 days, except where we are required 
                to retain it by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
              <p className="text-muted-foreground mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. 
                We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground mb-4">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal 
                information from children. If you become aware that a child has provided us with personal information, 
                please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
              <p className="text-muted-foreground mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by 
                posting the new policy on this page and updating the "Last updated" date. Your continued use of our 
                services after such changes constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. GDPR Compliance</h2>
              <p className="text-muted-foreground mb-4">
                If you are in the European Economic Area (EEA), you have additional rights under GDPR:
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent at any time</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                To exercise these rights, please contact us using the information below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions or concerns about this Privacy Policy or want to exercise your rights, 
                please contact us at:
              </p>
              <p className="text-muted-foreground">
                <strong>Data Controller:</strong> Antono George<br />
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
