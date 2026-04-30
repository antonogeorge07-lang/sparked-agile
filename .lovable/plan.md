
# Spark-Agile: Claim-vs-Capability Gap Audit (one trajectory)

I audited the landing page, /features page, pricing, i18n strings (9 languages), 80 edge functions, 110+ DB tables, live row counts, and the integration system. Below is every gap grouped by severity, with a single ordered fix plan.

## 1. Critical brand & trust gaps (visible to every visitor)

| # | Claim / surface | Reality | Severity |
|---|---|---|---|
| B1 | `<title>SAAI - AI Chief of Staff...</title>`, `SAAI` logo + wordmark in nav (Landing, Features, all locales) | Memory says brand is **Spark-Agile**; "saai deprecated". Asset still `saai-logo.png`. Privacy/Terms in all 9 locales call the product "SAAI (Spark-Agile Active Intelligence)" | High — undermines the rebrand |
| B2 | Pricing page shows **Free $0 / Pro $29 / "Start Free Trial" / "Most Popular"** | No Stripe wiring exists (`grep stripe supabase/functions` = 0). `subscription_tiers` exists with Free/Pro/Enterprise rows but `stripe_price_id` is NULL on every row. There is no checkout, no customer portal, no upgrade flow. Clicking "Start Free Trial" → /auth only. | High — false commercial promise |
| B3 | Pricing copy: "Launching in 30 days... Antono George" + "Rolling out throughout 2026" | Hard-coded vanity copy contradicting the "free for everyone" banner directly underneath. Also exposes founder name in product UI. | Medium |
| B4 | `LivePlatformStats` shows Workspaces = `users * 0.8`, Projects = `users * 2.5` (fabricated multipliers) | DB has 1 project, 2 profiles, 0 workspaces created. Multipliers are pure invention. Violates "Marketing Honesty Standard" memory. | High — fake metrics |
| B5 | Hero: "SAAI reads GitHub, Jira **& Slack** overnight and delivers one actionable briefing" | `send-digest-email` + `github-digest` exist; `digest_history = 0`, `digest_subscriptions = 0`. No scheduled cron is firing digests in production logs. Slack is not part of the digest pipeline (only `send-slack-notification`). | High — undelivered promise |
| B6 | Trust chips: "Enterprise security", "GDPR ready", "Encrypted" | True for backend (RLS hardened, AES-256-GCM tokens, audit logs). **Accurate** — keep. | OK |

## 2. Feature claims with zero or near-zero implementation traction

DB row counts (live, today):

```text
projects                  1
profiles                  2
integrations              3
ai_usage_logs            13
resource_forecasts       10   <- only because of a seed/test
workflow_executions       0
native_sprints            0
agent_debate_sessions     0   <- "signature" feature, never run
project_knowledge_base    0   <- RAG claimed, empty
digest_subscriptions      0
digest_history            0
meeting_notes             0
ai_test_scenarios         0
smart_nudges              0
sprint_planning_sessions  0
```

| # | Claim | Gap |
|---|---|---|
| F1 | "Multi-Agent AI Debate" — listed in Pricing, AgentDebateShowcase on Dashboard, capability cards | Tables exist (`agent_debate_sessions`, `agent_debate_responses`), edge function `agent-debate` deployed, but **0 runs ever**. Showcase CTA links to `/project-command-centre?tab=agents` — needs verification that tab actually launches a debate end-to-end. |
| F2 | "AI Test Scenarios" capability + edge fn `generate-test-scenarios` + `TestScenarioGenerator` component | 0 rows in `ai_test_scenarios`. Component exists but is not surfaced on any primary navigation route I found. |
| F3 | "Meeting Transcription / Notes" capability + `process-meeting-notes` edge fn + `MeetingNotesProcessor` | 0 rows. No upload entry point on Dashboard or sidebar. Orphan feature. |
| F4 | "Smart Nudges" capability + `generate-smart-nudges` (just bug-fixed) | 0 rows. Will only populate once a project has activity AND a cron triggers it — no scheduled invocation is wired. |
| F5 | "Resource Forecasting" capability | 10 rows but only from one user/test. `predict-resources` edge fn deployed; no UI prompt to run it on Dashboard. |
| F6 | "RAG knowledge base / pgvector hybrid search" (in `process-workflow`, capabilities) | `project_knowledge_base = 0`. RAG ingest path runs only inside `process-workflow`, which has 0 executions → effectively dormant. |
| F7 | "9-Language Support" | Real — 9 locale files, `useTranslation` used on key pages. **Accurate**. But Privacy/Terms still hardcode "SAAI" in every locale (B1). |
| F8 | "Google Calendar Sync" | `create-google-calendar-event`, `google-oauth-init/callback` deployed, env vars present. Need to verify a user can complete the flow end-to-end on `/integrations`. |
| F9 | "Stakeholder Portal / Executive Digest" | `send-executive-digest` + `stakeholder_invites` table exist, but no schedule, no recurring digest logs. Manual-only today. |
| F10 | "SAFe workflows" listed as Free | `/program-increment` route exists, table migrations exist. UI is functional, but the landing page hides SAFe per the "Wedge" memory — claim is in pricing list but not promoted. Internally consistent. |

## 3. Integration architecture gap (still unresolved from `INTEGRATION_STATUS.md`)

- **Two parallel integration systems** still co-exist: new `integrations` table (used by `/integrations`, `/backlog-refinement`) vs legacy `project_workspaces` (used by sprint planning, task mgmt, ceremonies). This was flagged P0 weeks ago and is still unresolved.
- Net effect: a user who connects Jira on `/integrations` does **not** see it work in `/sprint-planning-assistant` or `/task-management`. This is a silent claim-vs-reality break for every paying-intent user.

## 4. Branding inconsistency matrix

| Surface | Says |
|---|---|
| Hero title (en.json) | "SAAI reads GitHub, Jira & Slack overnight" |
| `<title>` Landing | "SAAI - AI Chief of Staff for Agile Teams" |
| `<title>` Features | "Features - SAAI" |
| Logo asset | `saai-logo.png` (nav + features) |
| Wordmark in nav | "SAAI" |
| Privacy/Terms i18n (9 locales) | "SAAI (Spark-Agile Active Intelligence)" + "operated by Antono George" |
| Memory / domain | **Spark-Agile**, sparked-agile.lovable.app |

## 5. Single-trajectory remediation plan

Ordered for maximum trust recovery first, then commercial readiness, then dormant-feature activation.

### Phase A — Truth-in-marketing (no new features, no DB changes)
1. **Rebrand surfaces** (B1): replace `<title>`, hero copy, nav wordmark, and Features page with "Spark-Agile". Swap `saai-logo.png` import to a Spark-Agile asset (or text wordmark if asset missing). Update Privacy/Terms in all 9 locales to "Spark-Agile" and remove the in-product "Antono George" mentions from PricingSection.
2. **Fix fake stats** (B4): in `LivePlatformStats`, remove the `*0.8` and `*2.5` multipliers. Show only the true `total_users` and `recent_signups`, OR hide the section until counts cross a real threshold (e.g. 25 users).
3. **Honest pricing** (B2, B3): until Stripe is wired, change the Pro card to "Coming soon — join the waitlist" and route the CTA to the existing `EmailCaptureForm`. Remove "Start Free Trial", "Most Popular", "Launching in 30 days", "Antono George".
4. **Honest hero** (B5): drop "& Slack" from the digest claim until Slack is part of the digest pipeline. Keep GitHub + Jira.

### Phase B — Wire the commercial path (only after A)
5. Add Stripe via `payments--enable_stripe`, populate `subscription_tiers.stripe_price_id`, add `create-checkout` and `customer-portal` edge functions, wire Pro card CTA. Then revert Phase A step 3.

### Phase C — Activate dormant signature features (per "fix distribution" decision already approved)
6. **Make agent debate reachable**: verify `?tab=agents` on `/project-command-centre` launches a one-click pre-filled debate. Add a "Try with sample epic" button so the count moves off zero. (F1)
7. **Surface dormant tools**: add Dashboard entry tiles for Meeting Notes upload, Test Scenario generator, and Resource Forecast (F2/F3/F5). Each tile is a single CTA → existing route/component.
8. **Schedule the digest**: add a daily cron (pg_cron or scheduled edge fn) that calls `send-digest-email` for every row in `digest_subscriptions`, and auto-create a digest_subscription on project creation so new users actually get the "daily briefing" the hero promises. (B5, F4, F9)

### Phase D — Integration consolidation (the biggest silent breakage)
9. Migrate `project_workspaces.{jira_board_url, github_repo_url, ...}` rows into the `integrations` table; update `fetch-jira-backlog`, `update-jira-issue`, `connect-jira`, `fetch-github-issues`, `update-github-issue`, `fetch-sprint-completed-work`, `record-sprint-minutes`, `generate-sprint-planning` to read from `integrations`. Then delete the legacy columns.

## 6. Recommended first execution slice

Phase A only — it is purely copy/asset/UI, ships in one pass, removes every false claim immediately, and unblocks safe linking from external channels (ProductHunt, marketplace listings, /vs comparison pages already on the roadmap).

If you approve, I will execute Phase A end-to-end in build mode and report back before touching B/C/D.

### Decisions I need from you
- **Logo asset**: do you have a Spark-Agile logo file to drop in, or should I render a text-only wordmark for now?
- **Pro tier in Phase A**: hide the Pro card entirely, or keep it visible as "waitlist" with the email capture?
- **LivePlatformStats**: remove the section while counts are tiny, or show the real numbers (currently 2 users, 0 workspaces)?
