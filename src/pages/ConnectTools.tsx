import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { OneClickConnect } from "@/components/onboarding/OneClickConnect";
import { useTranslation } from "react-i18next";
import { Zap } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function ConnectTools() {
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Helmet>
          <title>Connect Tools - Spark-Agile</title>
          <meta name="description" content="Integrate Jira, GitHub, Slack, and Microsoft tools with your Spark-Agile workspace." />
        </Helmet>
        <div className="mb-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Zap className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t("connectTools.pageTitle")}</h1>
          <p className="text-muted-foreground">{t("connectTools.pageSubtitle")}</p>
        </div>
        <OneClickConnect />
      </main>
    </DashboardLayout>
  );
}
