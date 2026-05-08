import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Mail, Sparkles, Shield, Brain, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function FAQ() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>FAQ - Spark-Agile</title>
        <meta name="description" content="Frequently asked questions about Spark-Agile, pricing, integrations, and features." />
      </Helmet>
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 mt-16">
        <div className="max-w-4xl mx-auto">
          <BackButton className="mb-6" />
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">{t("pages.faq.title")}</h1>
            <p className="text-xl text-muted-foreground">{t("pages.faq.subtitle")}</p>
          </div>

          <Card className="mb-6 border-primary/10 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {t("pages.faq.generalQuestions")}
              </CardTitle>
              <CardDescription>{t("pages.faq.learnBasics")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>{t("pages.faq.q1")}</AccordionTrigger>
                  <AccordionContent>{t("pages.faq.a1")}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>{t("pages.faq.q2")}</AccordionTrigger>
                  <AccordionContent>
                    {t("pages.faq.a2intro")}
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>{t("pages.faq.a2omair")}</strong></li>
                      <li><strong>{t("pages.faq.a2copilot")}</strong></li>
                      <li><strong>{t("pages.faq.a2debate")}</strong></li>
                      <li><strong>{t("pages.faq.a2specialist")}</strong></li>
                    </ul>
                    {t("pages.faq.a2outro")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>{t("pages.faq.q3")}</AccordionTrigger>
                  <AccordionContent>{t("pages.faq.a3")}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>{t("pages.faq.q4")}</AccordionTrigger>
                  <AccordionContent>{t("pages.faq.a4")}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="mb-6 border-primary/10 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                {t("pages.faq.platformFeatures")}
                <Badge className="bg-tier-free text-white ml-2">{t("pages.faq.live")}</Badge>
              </CardTitle>
              <CardDescription>{t("pages.faq.currentCapabilities")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-5">
                  <AccordionTrigger>{t("pages.faq.q5")}</AccordionTrigger>
                  <AccordionContent>
                    {t("pages.faq.a5intro")}
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>{t("pages.faq.a5kanban")}</strong></li>
                      <li><strong>{t("pages.faq.a5sprint")}</strong></li>
                      <li><strong>{t("pages.faq.a5backlog")}</strong></li>
                      <li><strong>{t("pages.faq.a5task")}</strong></li>
                      <li><strong>{t("pages.faq.a5epic")}</strong></li>
                    </ul>
                    {t("pages.faq.a5outro")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>{t("pages.faq.q6")}</AccordionTrigger>
                  <AccordionContent>
                    {t("pages.faq.a6intro")}
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>{t("pages.faq.a6stories")}</strong></li>
                      <li><strong>{t("pages.faq.a6points")}</strong></li>
                      <li><strong>{t("pages.faq.a6blockers")}</strong></li>
                      <li><strong>{t("pages.faq.a6forecast")}</strong></li>
                    </ul>
                    {t("pages.faq.a6outro")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-7">
                  <AccordionTrigger>{t("pages.faq.q7")}</AccordionTrigger>
                  <AccordionContent>
                    {t("pages.faq.a7intro")}
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>{t("pages.faq.a7jira")}</strong></li>
                      <li><strong>{t("pages.faq.a7github")}</strong></li>
                      <li><strong>{t("pages.faq.a7outlook")}</strong></li>
                      <li><strong>{t("pages.faq.a7teams")}</strong></li>
                      <li><strong>{t("pages.faq.a7slack")}</strong></li>
                    </ul>
                    {t("pages.faq.a7outro")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-ceremonies">
                  <AccordionTrigger>{t("pages.faq.qCeremonies")}</AccordionTrigger>
                  <AccordionContent>
                    {t("pages.faq.aCeremoniesIntro")}
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>{t("pages.faq.aCeremoniesStandup")}</strong></li>
                      <li><strong>{t("pages.faq.aCeremoniesPlanning")}</strong></li>
                      <li><strong>{t("pages.faq.aCeremoniesReview")}</strong></li>
                      <li><strong>{t("pages.faq.aCeremoniesRetro")}</strong></li>
                      <li><strong>{t("pages.faq.aCeremoniesBacklog")}</strong></li>
                    </ul>
                    {t("pages.faq.aCeremoniesOutro")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-stakeholder">
                  <AccordionTrigger>{t("pages.faq.qStakeholder")}</AccordionTrigger>
                  <AccordionContent>
                    {t("pages.faq.aStakeholderIntro")}
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>{t("pages.faq.aStakeholderDashboard")}</strong></li>
                      <li><strong>{t("pages.faq.aStakeholderDigest")}</strong></li>
                      <li><strong>{t("pages.faq.aStakeholderApproval")}</strong></li>
                      <li><strong>{t("pages.faq.aStakeholderAlert")}</strong></li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="mb-6 border-primary/10 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {t("pages.faq.securityAccess")}
              </CardTitle>
              <CardDescription>{t("pages.faq.enterpriseProtection")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-8">
                  <AccordionTrigger>{t("pages.faq.qSecurity")}</AccordionTrigger>
                  <AccordionContent>
                    {t("pages.faq.aSecurityIntro")}
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>{t("pages.faq.aSecurityRLS")}</strong></li>
                      <li><strong>{t("pages.faq.aSecurityEncryption")}</strong></li>
                      <li><strong>{t("pages.faq.aSecurityGDPR")}</strong></li>
                      <li><strong>{t("pages.faq.aSecurityAudit")}</strong></li>
                      <li><strong>{t("pages.faq.aSecurityPrompt")}</strong></li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-9">
                  <AccordionTrigger>{t("pages.faq.qAccess")}</AccordionTrigger>
                  <AccordionContent>
                    {t("pages.faq.aAccessIntro")}
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>{t("pages.faq.aAccessRegister")}</li>
                      <li>{t("pages.faq.aAccessAdmin")}</li>
                      <li>{t("pages.faq.aAccessAllocated")}</li>
                      <li>{t("pages.faq.aAccessRoles")}</li>
                      <li>{t("pages.faq.aAccessTokens")}</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-10">
                  <AccordionTrigger>{t("pages.faq.qSignup")}</AccordionTrigger>
                  <AccordionContent>
                    {t("pages.faq.aSignupIntro")}
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>{t("pages.faq.aSignupWorkspace")}</li>
                      <li>{t("pages.faq.aSignupIntegrations")}</li>
                      <li>{t("pages.faq.aSignupInvite")}</li>
                      <li>{t("pages.faq.aSignupManage")}</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="mb-6 border-primary/10 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                {t("pages.faq.pricingLimits")}
              </CardTitle>
              <CardDescription>{t("pages.faq.understandingCapabilities")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-14">
                  <AccordionTrigger>{t("pages.faq.qFreeTier")}</AccordionTrigger>
                  <AccordionContent>
                    {t("pages.faq.aFreeTierIntro")}
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>{t("pages.faq.aFreeTier1")}</li>
                      <li>{t("pages.faq.aFreeTier2")}</li>
                      <li>{t("pages.faq.aFreeTier3")}</li>
                      <li>{t("pages.faq.aFreeTier4")}</li>
                      <li>{t("pages.faq.aFreeTier5")}</li>
                      <li>{t("pages.faq.aFreeTier6")}</li>
                      <li>{t("pages.faq.aFreeTier7")}</li>
                      <li>{t("pages.faq.aFreeTier8")}</li>
                      <li>{t("pages.faq.aFreeTier9")}</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-15">
                  <AccordionTrigger>{t("pages.faq.qRateLimits")}</AccordionTrigger>
                  <AccordionContent>
                    {t("pages.faq.aRateLimitsIntro")}
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>{t("pages.faq.aRateLimitsFree")}</strong></li>
                      <li><strong>{t("pages.faq.aRateLimitsPro")}</strong></li>
                      <li><strong>{t("pages.faq.aRateLimitsEnterprise")}</strong></li>
                    </ul>
                    {t("pages.faq.aRateLimitsOutro")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-card">
            <CardHeader>
              <CardTitle>{t("pages.faq.stillHaveQuestions")}</CardTitle>
              <CardDescription>{t("pages.faq.cantFind")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/contact")} className="gap-2">
                <Mail className="h-4 w-4" />
                {t("pages.faq.contactSupport")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
