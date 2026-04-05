import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { ThemeProvider } from "./providers/ThemeProvider";
import { NotificationProvider } from "@/components/NotificationProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>
);
