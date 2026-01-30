import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CheckCircle2,
  FileText,
  Filter,
  Lock,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { t } from "@/lib/i18n";
import { useUiState } from "@/lib/ui-state";

type PaymentStatus = "PAID" | "UNPAID";

type Stage =
  | "Prosecution"
  | "Investigation"
  | "First Instance"
  | "Appeal"
  | "Cassation (Tamyeez)"
  | "Enforcement";

type PaymentRecord = {
  id: string;
  client: string;
  stage: Stage;
  amountQar: number;
  status: PaymentStatus;
  createdAt: string;
  linkedCaseId?: string;
};

type CaseRecord = {
  id: string;
  client: string;
  stage: Stage;
  paymentId: string;
  hasPoa: boolean;
  draftingLawyer: string | null;
  approvingLawyer: string | null;
  status: "Open" | "In progress" | "Closed" | "Archived";
};

type AuditLog = {
  id: string;
  time: string;
  actor: string;
  action: string;
  ref: string;
};

const seedPayments: PaymentRecord[] = [
  {
    id: "PAY-2026-0041",
    client: "Al Noor Trading W.L.L.",
    stage: "First Instance",
    amountQar: 25000,
    status: "PAID",
    createdAt: "2026-01-29 10:20",
  },
  {
    id: "PAY-2026-0042",
    client: "Private (Confidential)",
    stage: "Appeal",
    amountQar: 18000,
    status: "UNPAID",
    createdAt: "2026-01-29 13:05",
  },
  {
    id: "PAY-2026-0043",
    client: "Doha Properties",
    stage: "Enforcement",
    amountQar: 12000,
    status: "PAID",
    createdAt: "2026-01-30 09:10",
    linkedCaseId: "CASE-2026-0112",
  },
];

const seedCases: CaseRecord[] = [
  {
    id: "CASE-2026-0112",
    client: "Doha Properties",
    stage: "Enforcement",
    paymentId: "PAY-2026-0043",
    hasPoa: true,
    draftingLawyer: "A. Rahman",
    approvingLawyer: "S. Al-Kaabi",
    status: "In progress",
  },
  {
    id: "CASE-2026-0109",
    client: "Al Noor Trading W.L.L.",
    stage: "First Instance",
    paymentId: "PAY-2026-0041",
    hasPoa: false,
    draftingLawyer: null,
    approvingLawyer: null,
    status: "Open",
  },
];

const seedAudit: AuditLog[] = [
  {
    id: "LOG-0001",
    time: "2026-01-29 10:21",
    actor: "Secretary",
    action: "Recorded payment",
    ref: "PAY-2026-0041",
  },
  {
    id: "LOG-0002",
    time: "2026-01-30 09:12",
    actor: "Secretary",
    action: "Opened case after payment confirmation",
    ref: "CASE-2026-0112",
  },
];

function moneyQar(v: number) {
  return `QAR ${v.toLocaleString()}`;
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const cls =
    status === "PAID"
      ? "border-primary/25 bg-primary/10 text-primary"
      : "border-destructive/25 bg-destructive/10 text-destructive";
  return (
    <Badge data-testid={`badge-payment-${status.toLowerCase()}`} variant="secondary" className={`rounded-full border ${cls}`}>
      {status}
    </Badge>
  );
}

export default function SecretaryPage() {
  const { locale, isDark } = useUiState();
  const [query, setQuery] = useState("");
  const [payments, setPayments] = useState<PaymentRecord[]>(seedPayments);
  const [cases, setCases] = useState<CaseRecord[]>(seedCases);
  const [audit, setAudit] = useState<AuditLog[]>(seedAudit);

  const filteredPayments = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((p) => [p.id, p.client, p.stage, p.status].join(" ").toLowerCase().includes(q));
  }, [payments, query]);

  const filteredCases = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cases;
    return cases.filter((c) => [c.id, c.client, c.stage, c.status].join(" ").toLowerCase().includes(q));
  }, [cases, query]);

  function log(action: string, ref: string) {
    const entry: AuditLog = {
      id: `LOG-${String(audit.length + 1).padStart(4, "0")}`,
      time: "2026-01-30 12:00",
      actor: "Secretary",
      action,
      ref,
    };
    setAudit((a) => [entry, ...a]);
  }

  function onNewPayment() {
    const next: PaymentRecord = {
      id: `PAY-2026-${String(payments.length + 44).padStart(4, "0")}`,
      client: "New client (mock)",
      stage: "First Instance",
      amountQar: 5000,
      status: "UNPAID",
      createdAt: "2026-01-30 12:00",
    };
    setPayments((p) => [next, ...p]);
    log("Created payment record (pre-case)", next.id);
  }

  function markPaid(paymentId: string) {
    setPayments((p) => p.map((x) => (x.id === paymentId ? { ...x, status: "PAID" } : x)));
    log("Marked payment as PAID", paymentId);
  }

  function openCaseFromPayment(paymentId: string) {
    const p = payments.find((x) => x.id === paymentId);
    if (!p) return;
    if (p.status !== "PAID") return;

    const existing = cases.find((c) => c.paymentId === paymentId);
    if (existing) return;

    const id = `CASE-2026-${String(cases.length + 110).padStart(4, "0")}`;
    const newCase: CaseRecord = {
      id,
      client: p.client,
      stage: p.stage,
      paymentId,
      hasPoa: false,
      draftingLawyer: null,
      approvingLawyer: null,
      status: "Open",
    };

    setCases((c) => [newCase, ...c]);
    setPayments((all) => all.map((x) => (x.id === paymentId ? { ...x, linkedCaseId: id } : x)));
    log("Opened case after payment confirmation", id);
  }

  function togglePoa(caseId: string) {
    setCases((c) => c.map((x) => (x.id === caseId ? { ...x, hasPoa: !x.hasPoa } : x)));
    log("Updated POA status", caseId);
  }

  function assign(caseId: string, kind: "drafting" | "approving") {
    const name = kind === "drafting" ? "Drafting Lawyer (mock)" : "Approving Lawyer (mock)";
    setCases((c) =>
      c.map((x) =>
        x.id === caseId
          ? {
              ...x,
              draftingLawyer: kind === "drafting" ? name : x.draftingLawyer,
              approvingLawyer: kind === "approving" ? name : x.approvingLawyer,
            }
          : x,
      ),
    );
    log(`Assigned ${kind} lawyer`, caseId);
  }

  return (
    <div className={`app-bg min-h-screen ${locale === "ar" ? "dir-rtl" : ""} ${isDark ? "dark" : ""}`}>
      <div className="mx-auto max-w-[1240px] px-4 py-3 lg:px-6">
        <header className="mb-5 mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div data-testid="text-secretary-title" className="text-base font-semibold">
                {t(locale, "secretaryWorkspace")}
              </div>
              <div data-testid="text-secretary-subtitle" className="mt-0.5 text-sm text-muted-foreground">
                {t(locale, "secretarySubtitle")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button data-testid="button-notifications" variant="secondary" className="rounded-2xl">
              <Bell className="h-4 w-4" />
            </Button>
            <Link href="/login">
              <Button data-testid="button-back-login" variant="secondary" className="rounded-2xl">
                Back
              </Button>
            </Link>
          </div>
        </header>

        <div className="card-surface rounded-3xl p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent/10 text-accent">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div data-testid="text-gate-title" className="text-sm font-semibold">
                  {t(locale, "paymentGateTitle")}
                </div>
                <div data-testid="text-gate-desc" className="mt-1 text-sm text-muted-foreground">
                  {t(locale, "paymentGateDesc")}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  data-testid="input-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={locale === "ar" ? "بحث..." : "Search payments, cases..."}
                  className="h-11 w-full rounded-2xl pl-9 sm:w-[320px]"
                />
              </div>
              <Button data-testid="button-new-payment" className="h-11 rounded-2xl" onClick={onNewPayment}>
                <Plus className="mr-2 h-4 w-4" />
                {t(locale, "newPayment")}
              </Button>
            </div>
          </div>

          <Separator className="my-5" />

          <Tabs defaultValue="payments">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                Strict role permissions are represented in UI state (no backend yet).
              </div>
              <TabsList className="rounded-2xl">
                <TabsTrigger data-testid="tab-payments" value="payments">
                  {t(locale, "tabPayments")}
                </TabsTrigger>
                <TabsTrigger data-testid="tab-cases" value="cases">
                  {t(locale, "tabCases")}
                </TabsTrigger>
                <TabsTrigger data-testid="tab-whatsapp" value="whatsapp">
                  {t(locale, "tabWhatsApp")}
                </TabsTrigger>
                <TabsTrigger data-testid="tab-audit" value="audit">
                  {t(locale, "tabAudit")}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="payments" className="mt-5">
              <div className="grid gap-3">
                {filteredPayments.map((p) => {
                  const canOpenCase = p.status === "PAID" && !p.linkedCaseId;
                  const blocked = p.status !== "PAID";

                  return (
                    <div
                      key={p.id}
                      data-testid={`row-payment-${p.id}`}
                      className="flex flex-col gap-3 rounded-2xl border bg-card/70 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div data-testid={`text-payment-ref-${p.id}`} className="font-mono text-xs text-muted-foreground">
                            {p.id}
                          </div>
                          <div data-testid={`text-payment-client-${p.id}`} className="mt-1 text-sm font-semibold">
                            {p.client}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            <span className="text-foreground/70">{t(locale, "tableStage")}:</span> {p.stage} ·
                            <span className="ml-2 text-foreground/70">{t(locale, "tableAmount")}:</span> {moneyQar(p.amountQar)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <StatusBadge status={p.status} />

                          {p.status === "UNPAID" ? (
                            <Button
                              data-testid={`button-mark-paid-${p.id}`}
                              variant="secondary"
                              className="rounded-2xl"
                              onClick={() => markPaid(p.id)}
                            >
                              <BadgeCheck className="mr-2 h-4 w-4" />
                              {t(locale, "markPaid")}
                            </Button>
                          ) : null}

                          <Button
                            data-testid={`button-open-case-${p.id}`}
                            className="rounded-2xl"
                            onClick={() => openCaseFromPayment(p.id)}
                            disabled={!canOpenCase}
                          >
                            {blocked ? <Lock className="mr-2 h-4 w-4" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                            {t(locale, "openCase")}
                          </Button>
                        </div>
                      </div>

                      {p.linkedCaseId ? (
                        <div
                          data-testid={`status-payment-linked-${p.id}`}
                          className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-muted-foreground"
                        >
                          Linked to case: <span className="font-mono text-foreground">{p.linkedCaseId}</span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="cases" className="mt-5">
              <div className="grid gap-3">
                {filteredCases.map((c) => {
                  const payment = payments.find((p) => p.id === c.paymentId);
                  const paid = payment?.status === "PAID";

                  return (
                    <div
                      key={c.id}
                      data-testid={`row-case-${c.id}`}
                      className="flex flex-col gap-3 rounded-2xl border bg-card/70 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div data-testid={`text-case-ref-${c.id}`} className="font-mono text-xs text-muted-foreground">
                            {c.id}
                          </div>
                          <div data-testid={`text-case-client-${c.id}`} className="mt-1 text-sm font-semibold">
                            {c.client}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            <span className="text-foreground/70">{t(locale, "tableStage")}:</span> {c.stage} ·
                            <span className="ml-2 text-foreground/70">Payment:</span> {c.paymentId}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            data-testid={`badge-case-status-${c.id}`}
                            variant="secondary"
                            className="rounded-full border border-border bg-muted/40"
                          >
                            {c.status}
                          </Badge>
                          <Badge
                            data-testid={`badge-case-paid-${c.id}`}
                            variant="secondary"
                            className={`rounded-full border ${paid ? "border-primary/25 bg-primary/10 text-primary" : "border-destructive/25 bg-destructive/10 text-destructive"}`}
                          >
                            {paid ? t(locale, "statusPaid") : t(locale, "statusUnpaid")}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid gap-2 md:grid-cols-3">
                        <div className="rounded-2xl border bg-card/60 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold">POA</div>
                              <div className="mt-1 text-sm text-muted-foreground">
                                {c.hasPoa ? "Uploaded" : "Missing"}
                              </div>
                            </div>
                            <Button
                              data-testid={`button-toggle-poa-${c.id}`}
                              variant="secondary"
                              className="rounded-2xl"
                              onClick={() => togglePoa(c.id)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Toggle
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-2xl border bg-card/60 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold">Drafting lawyer</div>
                              <div className="mt-1 text-sm text-muted-foreground">
                                {c.draftingLawyer ?? "Not assigned"}
                              </div>
                            </div>
                            <Button
                              data-testid={`button-assign-drafting-${c.id}`}
                              variant="secondary"
                              className="rounded-2xl"
                              onClick={() => assign(c.id, "drafting")}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Assign
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-2xl border bg-card/60 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold">Approving lawyer</div>
                              <div className="mt-1 text-sm text-muted-foreground">
                                {c.approvingLawyer ?? "Not assigned"}
                              </div>
                            </div>
                            <Button
                              data-testid={`button-assign-approving-${c.id}`}
                              variant="secondary"
                              className="rounded-2xl"
                              onClick={() => assign(c.id, "approving")}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Assign
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="whatsapp" className="mt-5">
              <Card className="card-surface rounded-3xl p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent/10 text-accent">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <div data-testid="text-wa-title" className="text-sm font-semibold">
                      {t(locale, "whatsappPrimary")}
                    </div>
                    <div data-testid="text-wa-desc" className="mt-1 text-sm text-muted-foreground">
                      {t(locale, "whatsappDesc")}
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border bg-card/70 p-4">
                    <div className="text-sm font-semibold">Manual message</div>
                    <div className="mt-1 text-sm text-muted-foreground">Copy a template and send via WhatsApp.</div>
                    <Button data-testid="button-wa-manual" className="mt-4 rounded-2xl" variant="secondary">
                      Open templates
                    </Button>
                  </div>
                  <div className="rounded-2xl border bg-card/70 p-4">
                    <div className="text-sm font-semibold">Automated reminders</div>
                    <div className="mt-1 text-sm text-muted-foreground">Payment confirmation, submissions, and session updates.</div>
                    <Button data-testid="button-wa-automation" className="mt-4 rounded-2xl" variant="secondary">
                      View rules
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="mt-5">
              <Card className="card-surface rounded-3xl p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div data-testid="text-audit-title" className="text-sm font-semibold">
                      {t(locale, "auditTrail")}
                    </div>
                    <div data-testid="text-audit-desc" className="mt-1 text-sm text-muted-foreground">
                      {t(locale, "auditDesc")}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid gap-2">
                  {audit.map((a) => (
                    <div
                      key={a.id}
                      data-testid={`row-audit-${a.id}`}
                      className="flex flex-col gap-1 rounded-2xl border bg-card/70 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-mono text-xs text-muted-foreground">{a.time}</div>
                        <Badge variant="secondary" className="rounded-full">
                          {a.actor}
                        </Badge>
                      </div>
                      <div className="text-sm font-semibold">{a.action}</div>
                      <div className="text-sm text-muted-foreground">
                        Ref: <span className="font-mono text-foreground">{a.ref}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <footer className="mt-5 text-xs text-muted-foreground">
          Qatar stages: Prosecution · Investigation · First Instance · Appeal · Cassation (Tamyeez) · Enforcement
        </footer>
      </div>
    </div>
  );
}
