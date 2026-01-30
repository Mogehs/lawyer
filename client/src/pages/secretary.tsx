import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileText,
  Filter,
  Gavel,
  Globe,
  Lock,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Upload,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { t } from "@/lib/i18n";
import { ts } from "@/lib/secretary-i18n";
import { useUiState } from "@/lib/ui-state";

type PaymentStatus = "PAID" | "UNPAID";

type Stage =
  | "Prosecution"
  | "Investigation"
  | "First Instance"
  | "Appeal"
  | "Cassation (Tamyeez)"
  | "Enforcement";

type CaseStatus = "Open" | "In progress" | "Closed" | "Archived";

type PaymentMethod = "Cash" | "Bank transfer" | "Card" | "Cheque";

type PaymentRecord = {
  id: string;
  invoiceId?: string;
  client: string;
  phone: string;
  stage: Stage;
  amountQar: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  notes?: string;
  linkedCaseId?: string;
};

type CaseRecord = {
  id: string;
  client: string;
  clientPhone: string;
  stage: Stage;
  paymentId: string;
  caseType: "Civil" | "Commercial" | "Criminal" | "Labor" | "Family" | "Administrative";
  hasPoa: boolean;
  poaNumber?: string;
  poaExpiry?: string;
  poaFiles: string[];
  clientFiles: string[];
  draftingLawyer: string | null;
  approvingLawyer: string | null;
  status: CaseStatus;
  decision?: string;
  closedAt?: string;
  archivedAt?: string;
};

type SessionRecord = {
  id: string;
  caseId: string;
  stage: Stage;
  date: string;
  requiresMemo: "Undecided" | "Documents only" | "Memorandum required" | "Both";
  submissionRequired: boolean;
  submissionProofFiles: string[];
  submissionRef?: string;
  submissionDate?: string;
  outcome?: string;
  status: "Planned" | "Submitted" | "Occurred" | "Adjourned";
};

type TaskRecord = {
  id: string;
  title: string;
  caseId?: string;
  assigneeRole:
    | "Secretary"
    | "Drafting Lawyer"
    | "Approving Lawyer"
    | "Managing Partner"
    | "Legal Secretary"
    | "Accountant";
  due: string;
  status: "Open" | "Done";
};

type WhatsAppLog = {
  id: string;
  time: string;
  client: string;
  phone: string;
  type: "Manual" | "Automated";
  template: "Payment confirmation" | "Submission confirmation" | "Session date" | "Session result" | "Decision update";
  message: string;
};

type AuditLog = {
  id: string;
  time: string;
  actor: string;
  action: string;
  ref: string;
};

const staffSeed = {
  draftingLawyers: ["A. Rahman", "M. Al-Mansoori", "L. Haddad"],
  approvingLawyers: ["S. Al-Kaabi", "H. Al-Ansari"],
};

const seedPayments: PaymentRecord[] = [
  {
    id: "PAY-2026-0041",
    invoiceId: "INV-2026-0120",
    client: "Al Noor Trading W.L.L.",
    phone: "+974 55 123 456",
    stage: "First Instance",
    amountQar: 25000,
    method: "Bank transfer",
    status: "PAID",
    createdAt: "2026-01-29 10:20",
    notes: "Stage payment (First Instance)",
  },
  {
    id: "PAY-2026-0042",
    invoiceId: "INV-2026-0121",
    client: "Private (Confidential)",
    phone: "+974 66 800 900",
    stage: "Appeal",
    amountQar: 18000,
    method: "Cash",
    status: "UNPAID",
    createdAt: "2026-01-29 13:05",
    notes: "Pending collection",
  },
  {
    id: "PAY-2026-0043",
    invoiceId: "INV-2026-0124",
    client: "Doha Properties",
    phone: "+974 44 210 210",
    stage: "Enforcement",
    amountQar: 12000,
    method: "Card",
    status: "PAID",
    createdAt: "2026-01-30 09:10",
    linkedCaseId: "CASE-2026-0112",
    notes: "Additional work linked to enforcement",
  },
];

const seedCases: CaseRecord[] = [
  {
    id: "CASE-2026-0112",
    client: "Doha Properties",
    clientPhone: "+974 44 210 210",
    stage: "Enforcement",
    paymentId: "PAY-2026-0043",
    caseType: "Commercial",
    hasPoa: true,
    poaNumber: "POA-ENF-1182",
    poaExpiry: "2026-12-31",
    poaFiles: ["POA_DohaProperties.pdf"],
    clientFiles: ["ID_Scan.pdf", "Contract.pdf"],
    draftingLawyer: "A. Rahman",
    approvingLawyer: "S. Al-Kaabi",
    status: "In progress",
  },
  {
    id: "CASE-2026-0109",
    client: "Al Noor Trading W.L.L.",
    clientPhone: "+974 55 123 456",
    stage: "First Instance",
    paymentId: "PAY-2026-0041",
    caseType: "Commercial",
    hasPoa: false,
    poaFiles: [],
    clientFiles: [],
    draftingLawyer: null,
    approvingLawyer: null,
    status: "Open",
  },
];

const seedSessions: SessionRecord[] = [
  {
    id: "SES-2026-0201",
    caseId: "CASE-2026-0112",
    stage: "Enforcement",
    date: "2026-02-04 09:30",
    requiresMemo: "Undecided",
    submissionRequired: true,
    submissionProofFiles: [],
    status: "Planned",
  },
];

const seedTasks: TaskRecord[] = [
  {
    id: "TSK-0008",
    title: "Upload POA and client documents",
    caseId: "CASE-2026-0109",
    assigneeRole: "Secretary",
    due: "Today",
    status: "Open",
  },
  {
    id: "TSK-0011",
    title: "Assign drafting & approving lawyer",
    caseId: "CASE-2026-0109",
    assigneeRole: "Secretary",
    due: "Today",
    status: "Open",
  },
  {
    id: "TSK-0013",
    title: "Send payment confirmation",
    caseId: "CASE-2026-0042",
    assigneeRole: "Secretary",
    due: "Today",
    status: "Open",
  },
];

const seedWhatsApp: WhatsAppLog[] = [
  {
    id: "WA-0001",
    time: "2026-01-30 10:05",
    client: "Doha Properties",
    phone: "+974 44 210 210",
    type: "Automated",
    template: "Payment confirmation",
    message: "Payment received. We will proceed with the next steps.",
  },
];

const seedAudit: AuditLog[] = [
  {
    id: "LOG-0001",
    time: "2026-01-29 10:21",
    actor: "Secretary",
    action: "Recorded payment (pre-case)",
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

function nowStamp() {
  return "2026-01-30 12:00";
}

function moneyQar(v: number) {
  return `QAR ${v.toLocaleString()}`;
}

function BadgeDot({ tone }: { tone: "primary" | "accent" | "danger" | "neutral" }) {
  const cls =
    tone === "primary"
      ? "bg-primary"
      : tone === "accent"
        ? "bg-accent"
        : tone === "danger"
          ? "bg-destructive"
          : "bg-muted-foreground";
  return <span className={`h-1.5 w-1.5 rounded-full ${cls}`} aria-hidden="true" />;
}

function Pill({ tone, text, testId }: { tone: "primary" | "accent" | "danger" | "neutral"; text: string; testId: string }) {
  const cls =
    tone === "primary"
      ? "border-primary/25 bg-primary/10 text-primary"
      : tone === "accent"
        ? "border-accent/25 bg-accent/10 text-accent"
        : tone === "danger"
          ? "border-destructive/25 bg-destructive/10 text-destructive"
          : "border-border bg-muted/40 text-foreground/80";

  return (
    <Badge data-testid={testId} variant="secondary" className={`rounded-full border ${cls}`}>
      <span className="mr-2 inline-flex items-center gap-2">
        <BadgeDot tone={tone} />
        {text}
      </span>
    </Badge>
  );
}

function SideLink({
  label,
  href,
  icon: Icon,
  active,
  testId,
}: {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  testId: string;
}) {
  return (
    <Link href={href}>
      <div
        data-testid={testId}
        role="link"
        tabIndex={0}
        className={`group flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors focus-ring ${
          active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        }`}
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl border bg-card/60 text-foreground/80">
          <Icon className="h-4 w-4" />
        </span>
        <span className="font-medium">{label}</span>
      </div>
    </Link>
  );
}

export default function SecretaryPage() {
  const { locale, setLocale, isDark } = useUiState();
  const [section, setSection] = useState<
    "overview" | "payments" | "cases" | "sessions" | "documents" | "whatsapp" | "tasks" | "audit"
  >("overview");

  const [query, setQuery] = useState("");

  const [payments, setPayments] = useState<PaymentRecord[]>(seedPayments);
  const [cases, setCases] = useState<CaseRecord[]>(seedCases);
  const [sessions, setSessions] = useState<SessionRecord[]>(seedSessions);
  const [tasks, setTasks] = useState<TaskRecord[]>(seedTasks);
  const [wa, setWa] = useState<WhatsAppLog[]>(seedWhatsApp);
  const [audit, setAudit] = useState<AuditLog[]>(seedAudit);

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(seedCases[0]?.id ?? null);

  const selectedCase = useMemo(() => cases.find((c) => c.id === selectedCaseId) ?? null, [cases, selectedCaseId]);

  const paymentsFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((p) =>
      [p.id, p.invoiceId ?? "", p.client, p.phone, p.stage, p.status, p.method].join(" ").toLowerCase().includes(q),
    );
  }, [payments, query]);

  const casesFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cases;
    return cases.filter((c) =>
      [c.id, c.client, c.clientPhone, c.stage, c.status, c.caseType, c.paymentId].join(" ").toLowerCase().includes(q),
    );
  }, [cases, query]);

  const sessionsForSelected = useMemo(() => {
    if (!selectedCaseId) return [];
    return sessions.filter((s) => s.caseId === selectedCaseId);
  }, [sessions, selectedCaseId]);

  const tasksForSelected = useMemo(() => {
    if (!selectedCaseId) return [];
    return tasks.filter((t) => t.caseId === selectedCaseId);
  }, [tasks, selectedCaseId]);

  function addAudit(action: string, ref: string) {
    const entry: AuditLog = {
      id: `LOG-${String(audit.length + 1).padStart(4, "0")}`,
      time: nowStamp(),
      actor: "Secretary",
      action,
      ref,
    };
    setAudit((a) => [entry, ...a]);
  }

  function addWhatsApp(template: WhatsAppLog["template"], client: string, phone: string, type: WhatsAppLog["type"], message: string) {
    const entry: WhatsAppLog = {
      id: `WA-${String(wa.length + 1).padStart(4, "0")}`,
      time: nowStamp(),
      client,
      phone,
      type,
      template,
      message,
    };
    setWa((w) => [entry, ...w]);
    addAudit(`WhatsApp: ${template} (${type})`, entry.id);
  }

  function markTaskDone(id: string) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, status: "Done" } : x)));
    addAudit("Marked task as done", id);
  }

  function createPayment(input: Omit<PaymentRecord, "id" | "createdAt" | "status"> & { status: PaymentStatus }) {
    const next: PaymentRecord = {
      id: `PAY-2026-${String(payments.length + 44).padStart(4, "0")}`,
      createdAt: nowStamp(),
      ...input,
    };
    setPayments((p) => [next, ...p]);
    addAudit("Created payment record (pre-case)", next.id);

    if (next.status === "PAID") {
      addWhatsApp(
        "Payment confirmation",
        next.client,
        next.phone,
        "Automated",
        `Payment received (${moneyQar(next.amountQar)}). We will proceed with case opening steps.`,
      );
    }
  }

  function markPaid(paymentId: string) {
    setPayments((p) => p.map((x) => (x.id === paymentId ? { ...x, status: "PAID" } : x)));
    const p = payments.find((x) => x.id === paymentId);
    addAudit("Marked payment as PAID", paymentId);

    if (p) {
      addWhatsApp(
        "Payment confirmation",
        p.client,
        p.phone,
        "Manual",
        `Payment marked as PAID for ${p.invoiceId ?? p.id}. Amount: ${moneyQar(p.amountQar)}.`,
      );
    }
  }

  function openCaseFromPayment(paymentId: string, details: { caseType: CaseRecord["caseType"]; title?: string; notes?: string }) {
    const p = payments.find((x) => x.id === paymentId);
    if (!p) return;
    if (p.status !== "PAID") return;

    const existing = cases.find((c) => c.paymentId === paymentId);
    if (existing) return;

    const id = `CASE-2026-${String(cases.length + 110).padStart(4, "0")}`;
    const newCase: CaseRecord = {
      id,
      client: p.client,
      clientPhone: p.phone,
      stage: p.stage,
      paymentId,
      caseType: details.caseType,
      hasPoa: false,
      poaFiles: [],
      clientFiles: [],
      draftingLawyer: null,
      approvingLawyer: null,
      status: "Open",
    };

    setCases((c) => [newCase, ...c]);
    setPayments((all) => all.map((x) => (x.id === paymentId ? { ...x, linkedCaseId: id } : x)));
    setSelectedCaseId(id);
    addAudit("Opened case after payment confirmation", id);

    addWhatsApp(
      "Payment confirmation",
      p.client,
      p.phone,
      "Automated",
      `Case opened (${id}) after payment confirmation. Next: POA + documents upload.`,
    );

    const t1: TaskRecord = {
      id: `TSK-${String(tasks.length + 20).padStart(4, "0")}`,
      title: "Upload POA and client documents",
      caseId: id,
      assigneeRole: "Secretary",
      due: "Today",
      status: "Open",
    };
    const t2: TaskRecord = {
      id: `TSK-${String(tasks.length + 21).padStart(4, "0")}`,
      title: "Assign drafting & approving lawyer",
      caseId: id,
      assigneeRole: "Secretary",
      due: "Today",
      status: "Open",
    };
    setTasks((tt) => [t2, t1, ...tt]);
  }

  function setPoa(caseId: string, input: { poaNumber?: string; poaExpiry?: string; files: string[] }) {
    setCases((c) =>
      c.map((x) =>
        x.id === caseId
          ? {
              ...x,
              hasPoa: input.files.length > 0,
              poaNumber: input.poaNumber,
              poaExpiry: input.poaExpiry,
              poaFiles: input.files,
            }
          : x,
      ),
    );
    addAudit("Uploaded/updated POA", caseId);
  }

  function addClientDocs(caseId: string, files: string[]) {
    setCases((c) => c.map((x) => (x.id === caseId ? { ...x, clientFiles: [...x.clientFiles, ...files] } : x)));
    addAudit("Uploaded client documents", caseId);
  }

  function assignLawyers(caseId: string, input: { drafting: string; approving: string }) {
    setCases((c) =>
      c.map((x) => (x.id === caseId ? { ...x, draftingLawyer: input.drafting, approvingLawyer: input.approving } : x)),
    );
    addAudit("Assigned drafting + approving lawyer", caseId);

    const t1: TaskRecord = {
      id: `TSK-${String(tasks.length + 40).padStart(4, "0")}`,
      title: "Drafting lawyer: prepare documents / memo if required",
      caseId,
      assigneeRole: "Drafting Lawyer",
      due: "This week",
      status: "Open",
    };
    const t2: TaskRecord = {
      id: `TSK-${String(tasks.length + 41).padStart(4, "0")}`,
      title: "Approving lawyer: review and decide memo/documents",
      caseId,
      assigneeRole: "Approving Lawyer",
      due: "This week",
      status: "Open",
    };
    setTasks((tt) => [t2, t1, ...tt]);
  }

  function recordDecision(caseId: string, decision: string, closeCase: boolean) {
    setCases((c) =>
      c.map((x) =>
        x.id === caseId
          ? {
              ...x,
              decision,
              status: closeCase ? "Closed" : x.status,
              closedAt: closeCase ? nowStamp() : x.closedAt,
            }
          : x,
      ),
    );
    addAudit(closeCase ? "Recorded final decision and closed case" : "Recorded decision update", caseId);

    const c = cases.find((x) => x.id === caseId);
    if (c) {
      addWhatsApp(
        "Decision update",
        c.client,
        c.clientPhone,
        "Manual",
        `Decision update for ${caseId}: ${decision}`,
      );
    }
  }

  function archiveCase(caseId: string) {
    setCases((c) =>
      c.map((x) => (x.id === caseId ? { ...x, status: "Archived", archivedAt: nowStamp() } : x)),
    );
    addAudit("Archived case (read-only)", caseId);
  }

  function createSession(caseId: string, input: { stage: Stage; date: string; submissionRequired: boolean }) {
    const s: SessionRecord = {
      id: `SES-2026-${String(sessions.length + 210).padStart(4, "0")}`,
      caseId,
      stage: input.stage,
      date: input.date,
      requiresMemo: "Undecided",
      submissionRequired: input.submissionRequired,
      submissionProofFiles: [],
      status: "Planned",
    };
    setSessions((ss) => [s, ...ss]);
    addAudit("Created session", s.id);

    const c = cases.find((x) => x.id === caseId);
    if (c) {
      addWhatsApp("Session date", c.client, c.clientPhone, "Automated", `Session scheduled: ${input.date}.`);
    }

    const t1: TaskRecord = {
      id: `TSK-${String(tasks.length + 70).padStart(4, "0")}`,
      title: "Prepare submission package (blocked until signed if memo exists)",
      caseId,
      assigneeRole: "Legal Secretary",
      due: "Before session",
      status: "Open",
    };
    setTasks((tt) => [t1, ...tt]);
  }

  function uploadSubmission(caseId: string, sessionId: string, input: { ref: string; date: string; proofFiles: string[] }) {
    setSessions((ss) =>
      ss.map((x) =>
        x.id === sessionId
          ? {
              ...x,
              submissionRef: input.ref,
              submissionDate: input.date,
              submissionProofFiles: input.proofFiles,
              status: "Submitted",
            }
          : x,
      ),
    );
    addAudit("Recorded official submission proof", sessionId);

    const c = cases.find((x) => x.id === caseId);
    if (c) {
      addWhatsApp(
        "Submission confirmation",
        c.client,
        c.clientPhone,
        "Automated",
        `Submission completed for ${sessionId}. Ref: ${input.ref}.`,
      );
    }
  }

  function recordSessionOutcome(sessionId: string, outcome: string, status: SessionRecord["status"]) {
    const current = sessions.find((x) => x.id === sessionId);
    if (!current) return;

    const needsSubmission = current.submissionRequired;
    const hasProof = (current.submissionProofFiles ?? []).length > 0;

    if (needsSubmission && !hasProof) {
      addAudit("Blocked: session outcome requires submission proof", sessionId);
      return;
    }

    setSessions((ss) => ss.map((x) => (x.id === sessionId ? { ...x, outcome, status } : x)));
    addAudit("Recorded session outcome", sessionId);

    const c = cases.find((x) => x.id === current.caseId) ?? null;
    if (c) {
      addWhatsApp("Session result", c.client, c.clientPhone, "Manual", `Session update (${sessionId}): ${outcome}`);
    }
  }

  const kpis = useMemo(() => {
    const unpaid = payments.filter((p) => p.status === "UNPAID").length;
    const openCases = cases.filter((c) => c.status === "Open" || c.status === "In progress").length;
    const missingPoa = cases.filter((c) => !c.hasPoa && (c.status === "Open" || c.status === "In progress")).length;
    const pendingAssignments = cases.filter(
      (c) => (c.status === "Open" || c.status === "In progress") && (!c.draftingLawyer || !c.approvingLawyer),
    ).length;
    const sessionsNeedSubmission = sessions.filter((s) => s.submissionRequired && s.status === "Planned").length;
    return { unpaid, openCases, missingPoa, pendingAssignments, sessionsNeedSubmission };
  }, [payments, cases, sessions]);

  return (
    <div className={`app-bg min-h-screen ${locale === "ar" ? "dir-rtl" : ""} ${isDark ? "dark" : ""}`}>
      <div className="mx-auto max-w-[1320px] px-4 py-3 lg:px-6">
        <header className="sticky-blur sticky top-3 z-20 mb-5 mt-2 rounded-3xl border px-4 py-3">
          <div className="flex items-center justify-between gap-3">
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
              <div className="hidden items-center gap-2 md:flex">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    data-testid="input-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={ts(locale, "searchPlaceholder")}
                    className="h-10 w-[320px] rounded-2xl pl-9"
                  />
                </div>
              </div>
              <Select value={locale} onValueChange={(v) => setLocale(v as any)}>
                <SelectTrigger data-testid="select-language" className="h-10 w-[130px] rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{locale === "ar" ? "العربية" : "English"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent align={locale === "ar" ? "end" : "start"}>
                  <SelectItem data-testid="option-language-en" value="en">
                    English
                  </SelectItem>
                  <SelectItem data-testid="option-language-ar" value="ar">
                    العربية
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button data-testid="button-notifications" variant="secondary" className="rounded-2xl">
                <Bell className="h-4 w-4" />
              </Button>
              <Link href="/login">
                <Button data-testid="button-back-login" variant="secondary" className="rounded-2xl">
                  {ts(locale, "back")}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="flex gap-5">
          <aside className="hidden h-[calc(100vh-24px)] w-[280px] shrink-0 lg:block">
            <div className="card-surface sticky top-3 h-[calc(100vh-24px)] rounded-3xl p-4">
              <div className="sticky-blur -mx-4 -mt-4 mb-3 rounded-t-3xl border-b px-4 pb-3 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{ts(locale, "secTitle")}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{ts(locale, "secSubtitle")}</div>
                  </div>
                  <Pill tone="accent" text="UI" testId="badge-mode" />
                </div>
              </div>

              <div className="space-y-1">
                <button
                  data-testid="nav-overview"
                  onClick={() => setSection("overview")}
                  className={`w-full text-left ${section === "overview" ? "" : ""}`}
                >
                  <div
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors focus-ring ${
                      section === "overview"
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl border bg-card/60 text-foreground/80">
                      <ClipboardList className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{ts(locale, "navOverview")}</span>
                  </div>
                </button>

                <button data-testid="nav-payments" onClick={() => setSection("payments")} className="w-full text-left">
                  <div
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors focus-ring ${
                      section === "payments"
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl border bg-card/60 text-foreground/80">
                      <Wallet className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{ts(locale, "navPayments")}</span>
                  </div>
                </button>

                <button data-testid="nav-cases" onClick={() => setSection("cases")} className="w-full text-left">
                  <div
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors focus-ring ${
                      section === "cases"
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl border bg-card/60 text-foreground/80">
                      <Gavel className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{ts(locale, "navCases")}</span>
                  </div>
                </button>

                <button data-testid="nav-sessions" onClick={() => setSection("sessions")} className="w-full text-left">
                  <div
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors focus-ring ${
                      section === "sessions"
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl border bg-card/60 text-foreground/80">
                      <FileText className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{ts(locale, "navSessions")}</span>
                  </div>
                </button>

                <button data-testid="nav-documents" onClick={() => setSection("documents")} className="w-full text-left">
                  <div
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors focus-ring ${
                      section === "documents"
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl border bg-card/60 text-foreground/80">
                      <Upload className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{ts(locale, "navDocuments")}</span>
                  </div>
                </button>

                <button data-testid="nav-tasks" onClick={() => setSection("tasks")} className="w-full text-left">
                  <div
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors focus-ring ${
                      section === "tasks"
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl border bg-card/60 text-foreground/80">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{ts(locale, "navTasks")}</span>
                  </div>
                </button>

                <button data-testid="nav-whatsapp" onClick={() => setSection("whatsapp")} className="w-full text-left">
                  <div
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors focus-ring ${
                      section === "whatsapp"
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl border bg-card/60 text-foreground/80">
                      <MessageSquare className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{ts(locale, "navWhatsApp")}</span>
                  </div>
                </button>

                <button data-testid="nav-audit" onClick={() => setSection("audit")} className="w-full text-left">
                  <div
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors focus-ring ${
                      section === "audit"
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl border bg-card/60 text-foreground/80">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{ts(locale, "navAudit")}</span>
                  </div>
                </button>
              </div>

              <Separator className="my-4" />

              <div className="rounded-2xl border bg-card/60 p-3">
                <div className="text-xs font-semibold text-foreground">Judicial stages (Qatar)</div>
                <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                  <div>• Prosecution</div>
                  <div>• Investigation</div>
                  <div>• First Instance</div>
                  <div>• Appeal</div>
                  <div>• Cassation (Tamyeez)</div>
                  <div>• Enforcement</div>
                </div>
              </div>
            </div>
          </aside>

          <main data-testid="page-secretary" className="min-w-0 flex-1">
            <div className="card-surface rounded-3xl p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent/10 text-accent">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div data-testid="text-gate-title" className="text-sm font-semibold">
                      Payment is mandatory
                    </div>
                    <div data-testid="text-gate-desc" className="mt-1 text-sm text-muted-foreground">
                      If payment status is not PAID, the next workflow step is blocked.
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative md:hidden">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      data-testid="input-search-mobile"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={ts(locale, "searchPlaceholder")}
                      className="h-11 w-full rounded-2xl pl-9 sm:w-[320px]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <NewPaymentModal locale={locale} onCreate={createPayment} />
                    <NewCaseFromPaymentModal
                      locale={locale}
                      payments={payments}
                      cases={cases}
                      onOpenCase={openCaseFromPayment}
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-5" />

              {section === "overview" ? (
                <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <Kpi title="Unpaid payments" value={String(kpis.unpaid)} icon={Wallet} tone="danger" testId="kpi-unpaid" />
                      <Kpi title="Open cases" value={String(kpis.openCases)} icon={Gavel} tone="primary" testId="kpi-open" />
                      <Kpi
                        title="Missing POA"
                        value={String(kpis.missingPoa)}
                        icon={Upload}
                        tone="accent"
                        testId="kpi-missing-poa"
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <Card className="card-surface rounded-3xl p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold">Quick actions</div>
                            <div className="mt-1 text-sm text-muted-foreground">Secretary-only operations.</div>
                          </div>
                          <Pill tone="neutral" text="Strict" testId="badge-quickactions" />
                        </div>
                        <div className="mt-4 grid gap-2">
                          <NewPaymentModal locale={locale} onCreate={createPayment} />
                          <NewCaseFromPaymentModal
                            locale={locale}
                            payments={payments}
                            cases={cases}
                            onOpenCase={openCaseFromPayment}
                          />
                          <RecordDecisionModal
                            locale={locale}
                            caseRecord={selectedCase}
                            disabled={!selectedCase}
                            onRecord={(decision, close) => selectedCase && recordDecision(selectedCase.id, decision, close)}
                          />
                          <ArchiveCaseModal
                            locale={locale}
                            caseRecord={selectedCase}
                            disabled={!selectedCase || selectedCase.status !== "Closed"}
                            onArchive={() => selectedCase && archiveCase(selectedCase.id)}
                          />
                        </div>
                      </Card>

                      <Card className="card-surface rounded-3xl p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold">Selected case</div>
                            <div className="mt-1 text-sm text-muted-foreground">Pick a case to manage documents, sessions and decisions.</div>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-2">
                          <Select
                            value={selectedCaseId ?? ""}
                            onValueChange={(v) => setSelectedCaseId(v)}
                          >
                            <SelectTrigger data-testid="select-current-case" className="h-11 rounded-2xl">
                              <SelectValue placeholder="Select a case" />
                            </SelectTrigger>
                            <SelectContent>
                              {cases.map((c) => (
                                <SelectItem key={c.id} value={c.id} data-testid={`option-case-${c.id}`}>
                                  {c.id} — {c.client}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {selectedCase ? (
                            <div className="rounded-2xl border bg-card/60 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="font-mono text-xs text-muted-foreground">{selectedCase.id}</div>
                                  <div className="mt-1 text-sm font-semibold">{selectedCase.client}</div>
                                  <div className="mt-1 text-sm text-muted-foreground">
                                    Stage: {selectedCase.stage} · Type: {selectedCase.caseType}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <Pill
                                    tone={selectedCase.status === "Archived" ? "neutral" : "primary"}
                                    text={selectedCase.status}
                                    testId="badge-selected-case-status"
                                  />
                                  <Pill
                                    tone={selectedCase.hasPoa ? "primary" : "danger"}
                                    text={selectedCase.hasPoa ? "POA uploaded" : "POA missing"}
                                    testId="badge-selected-poa"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </Card>
                    </div>

                    <Card className="card-surface rounded-3xl p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">Gate status</div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            These blocks match the Qatar workflow rules.
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <GateCard
                          testId="gate-payment"
                          title="Payment gate"
                          desc="Blocks case creation until PAID"
                          ok={payments.some((p) => p.status === "PAID")}
                        />
                        <GateCard
                          testId="gate-signature"
                          title="Signature gate"
                          desc="Only Managing Partner signs memorandums"
                          ok={true}
                        />
                        <GateCard
                          testId="gate-submission"
                          title="Submission gate"
                          desc="No session without official submission"
                          ok={kpis.sessionsNeedSubmission === 0}
                        />
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <Card className="card-surface rounded-3xl p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">My tasks</div>
                          <div className="mt-1 text-sm text-muted-foreground">Quick queue for secretary work.</div>
                        </div>
                        <Pill tone="accent" text="Today" testId="badge-tasks-today" />
                      </div>
                      <div className="mt-4 grid gap-2">
                        {tasks.filter((x) => x.assigneeRole === "Secretary" && x.status === "Open").slice(0, 6).map((x) => (
                          <div
                            key={x.id}
                            data-testid={`row-task-${x.id}`}
                            className="flex items-center justify-between gap-3 rounded-2xl border bg-card/70 p-3"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-semibold truncate">{x.title}</div>
                              <div className="mt-1 text-sm text-muted-foreground truncate">{x.caseId ?? "—"} · Due: {x.due}</div>
                            </div>
                            <Button
                              data-testid={`button-task-done-${x.id}`}
                              variant="secondary"
                              className="rounded-2xl"
                              onClick={() => markTaskDone(x.id)}
                            >
                              Done
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="card-surface rounded-3xl p-5">
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent/10 text-accent">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">WhatsApp is primary</div>
                          <div className="mt-1 text-sm text-muted-foreground">Send manual or automated messages (mock).</div>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <SendWhatsAppModal
                        locale={locale}
                        caseRecord={selectedCase}
                        payment={selectedCase ? payments.find((p) => p.id === selectedCase.paymentId) ?? null : null}
                        onSend={(tpl, type, msg) => {
                          if (!selectedCase) return;
                          addWhatsApp(tpl, selectedCase.client, selectedCase.clientPhone, type, msg);
                        }}
                      />
                      <div className="mt-4 grid gap-2">
                        {wa.slice(0, 4).map((w) => (
                          <div key={w.id} data-testid={`row-wa-${w.id}`} className="rounded-2xl border bg-card/70 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-mono text-xs text-muted-foreground">{w.time}</div>
                              <Pill tone={w.type === "Automated" ? "accent" : "neutral"} text={w.type} testId={`badge-wa-type-${w.id}`} />
                            </div>
                            <div className="mt-1 text-sm font-semibold">{w.template}</div>
                            <div className="mt-1 text-sm text-muted-foreground">{w.client} · {w.phone}</div>
                            <div className="mt-2 text-sm">{w.message}</div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              ) : null}

              {section === "payments" ? (
                <PaymentsSection
                  locale={locale}
                  items={paymentsFiltered}
                  onMarkPaid={markPaid}
                  onOpenCase={(id, details) => openCaseFromPayment(id, details)}
                  cases={cases}
                />
              ) : null}

              {section === "cases" ? (
                <CasesSection
                  locale={locale}
                  items={casesFiltered}
                  payments={payments}
                  selectedCaseId={selectedCaseId}
                  onSelectCase={setSelectedCaseId}
                  onAssign={(caseId, drafting, approving) => assignLawyers(caseId, { drafting, approving })}
                  onPoa={(caseId, poaNumber, poaExpiry, files) => setPoa(caseId, { poaNumber, poaExpiry, files })}
                  onClientDocs={(caseId, files) => addClientDocs(caseId, files)}
                  onDecision={(caseId, decision, close) => recordDecision(caseId, decision, close)}
                  onArchive={(caseId) => archiveCase(caseId)}
                />
              ) : null}

              {section === "sessions" ? (
                <SessionsSection
                  locale={locale}
                  cases={cases}
                  sessions={sessions}
                  selectedCaseId={selectedCaseId}
                  onSelectCase={setSelectedCaseId}
                  onCreate={(caseId, stage, date, submissionRequired) => createSession(caseId, { stage, date, submissionRequired })}
                  onUploadSubmission={(caseId, sessionId, ref, date, files) => uploadSubmission(caseId, sessionId, { ref, date, proofFiles: files })}
                  onOutcome={(sessionId, outcome, status) => recordSessionOutcome(sessionId, outcome, status)}
                />
              ) : null}

              {section === "documents" ? (
                <DocumentsSection
                  locale={locale}
                  cases={cases}
                  selectedCaseId={selectedCaseId}
                  onSelectCase={setSelectedCaseId}
                />
              ) : null}

              {section === "tasks" ? (
                <TasksSection
                  locale={locale}
                  cases={cases}
                  tasks={tasks}
                  selectedCaseId={selectedCaseId}
                  onSelectCase={setSelectedCaseId}
                  onDone={markTaskDone}
                />
              ) : null}

              {section === "whatsapp" ? (
                <WhatsAppSection locale={locale} cases={cases} payments={payments} logs={wa} onSend={addWhatsApp} />
              ) : null}

              {section === "audit" ? (
                <AuditSection locale={locale} logs={audit} />
              ) : null}
            </div>
          </main>
        </div>

        <footer className="mt-5 text-xs text-muted-foreground">
          Qatar stages: Prosecution · Investigation · First Instance · Appeal · Cassation (Tamyeez) · Enforcement
        </footer>
      </div>
    </div>
  );
}

function Kpi({
  title,
  value,
  icon: Icon,
  tone,
  testId,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "accent" | "danger" | "neutral";
  testId: string;
}) {
  const bg =
    tone === "primary"
      ? "bg-primary/8"
      : tone === "accent"
        ? "bg-accent/8"
        : tone === "danger"
          ? "bg-destructive/8"
          : "bg-muted";

  return (
    <Card data-testid={testId} className="card-surface rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-2xl border ${bg} text-foreground/80`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function GateCard({ testId, title, desc, ok }: { testId: string; title: string; desc: string; ok: boolean }) {
  return (
    <div data-testid={testId} className="rounded-3xl border bg-card/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
        </div>
        <Pill tone={ok ? "primary" : "danger"} text={ok ? "OK" : "Blocked"} testId={`${testId}-pill`} />
      </div>
    </div>
  );
}

function NewPaymentModal({
  locale,
  onCreate,
}: {
  locale: "en" | "ar";
  onCreate: (input: Omit<PaymentRecord, "id" | "createdAt">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [client, setClient] = useState("");
  const [phone, setPhone] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [stage, setStage] = useState<Stage>("First Instance");
  const [amount, setAmount] = useState("5000");
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [status, setStatus] = useState<PaymentStatus>("UNPAID");
  const [notes, setNotes] = useState("");

  function reset() {
    setClient("");
    setPhone("");
    setInvoiceId("");
    setStage("First Instance");
    setAmount("5000");
    setMethod("Cash");
    setStatus("UNPAID");
    setNotes("");
  }

  const disabled = client.trim().length < 2 || phone.trim().length < 5 || !Number(amount);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button data-testid="button-new-payment" className="h-10 rounded-2xl">
          <Plus className="mr-2 h-4 w-4" />
          {t(locale, "newPayment")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[720px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-left">Create payment record (before case)</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <Label data-testid="label-client">Client name</Label>
              <Input data-testid="input-client" value={client} onChange={(e) => setClient(e.target.value)} className="h-11 rounded-2xl" placeholder="Client / Company" />
            </div>
            <div className="grid gap-2">
              <Label data-testid="label-phone">Phone (WhatsApp)</Label>
              <Input data-testid="input-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 rounded-2xl" placeholder="+974 ..." />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="grid gap-2">
              <Label data-testid="label-invoice">Invoice ID (optional)</Label>
              <Input data-testid="input-invoice" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} className="h-11 rounded-2xl" placeholder="INV-YYYY-####" />
            </div>
            <div className="grid gap-2">
              <Label data-testid="label-stage">Stage</Label>
              <Select value={stage} onValueChange={(v) => setStage(v as Stage)}>
                <SelectTrigger data-testid="select-stage" className="h-11 rounded-2xl">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prosecution">Prosecution</SelectItem>
                  <SelectItem value="Investigation">Investigation</SelectItem>
                  <SelectItem value="First Instance">First Instance</SelectItem>
                  <SelectItem value="Appeal">Appeal</SelectItem>
                  <SelectItem value="Cassation (Tamyeez)">Cassation (Tamyeez)</SelectItem>
                  <SelectItem value="Enforcement">Enforcement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label data-testid="label-method">Method</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger data-testid="select-method" className="h-11 rounded-2xl">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank transfer">Bank transfer</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="grid gap-2">
              <Label data-testid="label-amount">Amount (QAR)</Label>
              <Input data-testid="input-amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-11 rounded-2xl" />
            </div>
            <div className="grid gap-2">
              <Label data-testid="label-status">Payment status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as PaymentStatus)}>
                <SelectTrigger data-testid="select-status" className="h-11 rounded-2xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNPAID">UNPAID</SelectItem>
                  <SelectItem value="PAID">PAID</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-2xl border bg-muted/40 p-3">
              <div className="text-xs font-semibold">Rule</div>
              <div className="mt-1 text-xs text-muted-foreground">Payment can be recorded before case creation.</div>
              <div className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                Case opening is blocked unless PAID.
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label data-testid="label-notes">Notes</Label>
            <Textarea data-testid="textarea-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[90px] rounded-2xl" placeholder="Optional notes..." />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button data-testid="button-cancel-payment" variant="secondary" className="rounded-2xl" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            data-testid="button-create-payment"
            className="rounded-2xl"
            disabled={disabled}
            onClick={() => {
              onCreate({
                invoiceId: invoiceId.trim() || undefined,
                client: client.trim(),
                phone: phone.trim(),
                stage,
                amountQar: Number(amount),
                method,
                status,
                notes: notes.trim() || undefined,
              } as any);
              setOpen(false);
            }}
          >
            Create payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewCaseFromPaymentModal({
  locale,
  payments,
  cases,
  onOpenCase,
}: {
  locale: "en" | "ar";
  payments: PaymentRecord[];
  cases: CaseRecord[];
  onOpenCase: (paymentId: string, details: { caseType: CaseRecord["caseType"]; title?: string; notes?: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [paymentId, setPaymentId] = useState<string>("");
  const [caseType, setCaseType] = useState<CaseRecord["caseType"]>("Commercial");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const eligible = useMemo(() => {
    return payments.filter((p) => p.status === "PAID" && !p.linkedCaseId && !cases.some((c) => c.paymentId === p.id));
  }, [payments, cases]);

  const canCreate = !!paymentId;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setPaymentId(""); setTitle(""); setNotes(""); } }}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-case" variant="secondary" className="h-10 rounded-2xl">
          <UserPlus className="mr-2 h-4 w-4" />
          {t(locale, "createCase")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[720px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-left">Open case from PAID payment</DialogTitle>
        </DialogHeader>

        {eligible.length === 0 ? (
          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
            No eligible payments. Create a payment and mark it PAID first.
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label data-testid="label-select-payment">Select a PAID payment</Label>
              <Select value={paymentId} onValueChange={(v) => setPaymentId(v)}>
                <SelectTrigger data-testid="select-payment" className="h-11 rounded-2xl">
                  <SelectValue placeholder="Choose payment" />
                </SelectTrigger>
                <SelectContent>
                  {eligible.map((p) => (
                    <SelectItem key={p.id} value={p.id} data-testid={`option-payment-${p.id}`}>
                      {p.id} — {p.client} — {moneyQar(p.amountQar)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label data-testid="label-case-type">Case type</Label>
                <Select value={caseType} onValueChange={(v) => setCaseType(v as any)}>
                  <SelectTrigger data-testid="select-case-type" className="h-11 rounded-2xl">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Civil">Civil</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Criminal">Criminal</SelectItem>
                    <SelectItem value="Labor">Labor</SelectItem>
                    <SelectItem value="Family">Family</SelectItem>
                    <SelectItem value="Administrative">Administrative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label data-testid="label-case-title">Case title (optional)</Label>
                <Input data-testid="input-case-title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 rounded-2xl" placeholder="Internal title" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label data-testid="label-case-notes">Notes</Label>
              <Textarea data-testid="textarea-case-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[90px] rounded-2xl" placeholder="Any intake notes..." />
            </div>

            <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Lock className="mt-0.5 h-4 w-4" />
                <div>
                  <div className="font-semibold text-foreground">Gate</div>
                  <div className="mt-1">Only PAID payments can open a case.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button data-testid="button-cancel-case" variant="secondary" className="rounded-2xl" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            data-testid="button-open-case"
            className="rounded-2xl"
            disabled={!canCreate}
            onClick={() => {
              onOpenCase(paymentId, { caseType, title: title.trim() || undefined, notes: notes.trim() || undefined });
              setOpen(false);
            }}
          >
            Open case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecordDecisionModal({
  locale,
  caseRecord,
  disabled,
  onRecord,
}: {
  locale: "en" | "ar";
  caseRecord: CaseRecord | null;
  disabled?: boolean;
  onRecord: (decision: string, closeCase: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [decision, setDecision] = useState("");
  const [close, setClose] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setDecision(""); setClose(false); } }}>
      <DialogTrigger asChild>
        <Button data-testid="button-record-decision" variant="secondary" className="h-10 justify-start rounded-2xl" disabled={disabled}>
          <ClipboardList className="mr-2 h-4 w-4" />
          Record decision
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[720px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-left">Record decision</DialogTitle>
        </DialogHeader>
        {!caseRecord ? (
          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">Select a case first.</div>
        ) : (
          <div className="grid gap-4">
            <div className="rounded-2xl border bg-card/70 p-4">
              <div className="font-mono text-xs text-muted-foreground">{caseRecord.id}</div>
              <div className="mt-1 text-sm font-semibold">{caseRecord.client}</div>
              <div className="mt-1 text-sm text-muted-foreground">Stage: {caseRecord.stage}</div>
            </div>

            <div className="grid gap-2">
              <Label data-testid="label-decision">Decision / update</Label>
              <Textarea data-testid="textarea-decision" value={decision} onChange={(e) => setDecision(e.target.value)} className="min-h-[120px] rounded-2xl" placeholder="Write the decision or update..." />
            </div>

            <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4" />
                <div>
                  <div className="font-semibold text-foreground">Close case now?</div>
                  <div className="mt-1">Set status to CLOSED only when final decision is recorded and no open sessions.</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-2xl border bg-card/70 p-3">
                <div className="text-sm">Close case</div>
                <button
                  data-testid="toggle-close-case"
                  onClick={() => setClose((v) => !v)}
                  className={`h-7 w-12 rounded-full border transition-colors ${close ? "bg-primary/20 border-primary/30" : "bg-muted/60"}`}
                >
                  <span
                    className={`block h-6 w-6 translate-x-0.5 rounded-full bg-background shadow transition-transform ${close ? "translate-x-[22px]" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button data-testid="button-cancel-decision" variant="secondary" className="rounded-2xl" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            data-testid="button-save-decision"
            className="rounded-2xl"
            disabled={!caseRecord || decision.trim().length < 3}
            onClick={() => {
              onRecord(decision.trim(), close);
              setOpen(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ArchiveCaseModal({
  locale,
  caseRecord,
  disabled,
  onArchive,
}: {
  locale: "en" | "ar";
  caseRecord: CaseRecord | null;
  disabled?: boolean;
  onArchive: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-archive-case" variant="secondary" className="h-10 justify-start rounded-2xl" disabled={disabled}>
          <Lock className="mr-2 h-4 w-4" />
          Archive case
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[640px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-left">Archive case</DialogTitle>
        </DialogHeader>
        {!caseRecord ? (
          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">Select a case first.</div>
        ) : (
          <div className="grid gap-4">
            <div className="rounded-2xl border bg-card/70 p-4">
              <div className="font-mono text-xs text-muted-foreground">{caseRecord.id}</div>
              <div className="mt-1 text-sm font-semibold">{caseRecord.client}</div>
              <div className="mt-1 text-sm text-muted-foreground">Status: {caseRecord.status}</div>
            </div>
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              Archiving is permanent and read-only. Full history is preserved.
            </div>
          </div>
        )}
        <DialogFooter className="mt-4">
          <Button data-testid="button-cancel-archive" variant="secondary" className="rounded-2xl" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            data-testid="button-confirm-archive"
            className="rounded-2xl"
            disabled={!caseRecord}
            onClick={() => {
              onArchive();
              setOpen(false);
            }}
          >
            Archive
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PaymentsSection({
  locale,
  items,
  onMarkPaid,
  onOpenCase,
  cases,
}: {
  locale: "en" | "ar";
  items: PaymentRecord[];
  onMarkPaid: (paymentId: string) => void;
  onOpenCase: (paymentId: string, details: { caseType: CaseRecord["caseType"]; title?: string; notes?: string }) => void;
  cases: CaseRecord[];
}) {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(items[0]?.id ?? "");

  const selected = useMemo(() => items.find((x) => x.id === selectedPaymentId) ?? null, [items, selectedPaymentId]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,0.45fr]">
      <Card className="card-surface rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Payments</div>
            <div className="mt-1 text-sm text-muted-foreground">Invoice first, payment before case is allowed.</div>
          </div>
          <Pill tone="neutral" text={`${items.length}`} testId="badge-payments-count" />
        </div>
        <Separator className="my-4" />

        <div className="grid gap-3">
          {items.map((p) => {
            const canOpen = p.status === "PAID" && !p.linkedCaseId && !cases.some((c) => c.paymentId === p.id);
            return (
              <button
                key={p.id}
                data-testid={`row-payment-${p.id}`}
                onClick={() => setSelectedPaymentId(p.id)}
                className={`text-left rounded-3xl border bg-card/70 p-4 transition-colors hover:bg-card/90 ${
                  selectedPaymentId === p.id ? "ring-2 ring-primary/25" : ""}
                `}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-xs text-muted-foreground">{p.id}</div>
                    <div className="mt-1 text-sm font-semibold truncate">{p.client}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{p.phone}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Stage: {p.stage} · Amount: {moneyQar(p.amountQar)}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">Invoice: {p.invoiceId ?? "—"} · Method: {p.method}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={p.status === "PAID" ? "primary" : "danger"} text={p.status} testId={`pill-payment-${p.id}`} />
                    {p.status === "UNPAID" ? (
                      <Button
                        data-testid={`button-mark-paid-${p.id}`}
                        variant="secondary"
                        className="rounded-2xl"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onMarkPaid(p.id);
                        }}
                      >
                        <BadgeCheck className="mr-2 h-4 w-4" />
                        {t(locale, "markPaid")}
                      </Button>
                    ) : null}
                    <Button
                      data-testid={`button-open-case-${p.id}`}
                      className="rounded-2xl"
                      disabled={!canOpen}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onOpenCase(p.id, { caseType: "Commercial" });
                      }}
                    >
                      {canOpen ? <ArrowRight className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                      {t(locale, "openCase")}
                    </Button>
                  </div>
                </div>

                {p.linkedCaseId ? (
                  <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-muted-foreground">
                    Linked to case: <span className="font-mono text-foreground">{p.linkedCaseId}</span>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="card-surface rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Payment details</div>
            <div className="mt-1 text-sm text-muted-foreground">For WhatsApp templates and audit.</div>
          </div>
          <Pill tone="neutral" text={selected ? "Selected" : "—"} testId="badge-payment-selected" />
        </div>
        <Separator className="my-4" />

        {selected ? (
          <div className="grid gap-3">
            <div className="rounded-2xl border bg-card/70 p-4">
              <div className="font-mono text-xs text-muted-foreground">{selected.id}</div>
              <div className="mt-1 text-sm font-semibold">{selected.client}</div>
              <div className="mt-1 text-sm text-muted-foreground">{selected.phone}</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Stage: {selected.stage} · {moneyQar(selected.amountQar)}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Invoice: {selected.invoiceId ?? "—"} · Method: {selected.method}</div>
            </div>

            <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Lock className="mt-0.5 h-4 w-4" />
                <div>
                  <div className="font-semibold text-foreground">Gate</div>
                  <div className="mt-1">If payment is UNPAID, case opening is blocked.</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">Select a payment.</div>
        )}
      </Card>
    </div>
  );
}

function CasesSection({
  locale,
  items,
  payments,
  selectedCaseId,
  onSelectCase,
  onAssign,
  onPoa,
  onClientDocs,
  onDecision,
  onArchive,
}: {
  locale: "en" | "ar";
  items: CaseRecord[];
  payments: PaymentRecord[];
  selectedCaseId: string | null;
  onSelectCase: (id: string) => void;
  onAssign: (caseId: string, drafting: string, approving: string) => void;
  onPoa: (caseId: string, poaNumber: string, poaExpiry: string, files: string[]) => void;
  onClientDocs: (caseId: string, files: string[]) => void;
  onDecision: (caseId: string, decision: string, close: boolean) => void;
  onArchive: (caseId: string) => void;
}) {
  const selected = useMemo(() => items.find((x) => x.id === selectedCaseId) ?? null, [items, selectedCaseId]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,0.5fr]">
      <Card className="card-surface rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Cases</div>
            <div className="mt-1 text-sm text-muted-foreground">Open, assign, close and archive.</div>
          </div>
          <Pill tone="neutral" text={`${items.length}`} testId="badge-cases-count" />
        </div>
        <Separator className="my-4" />

        <div className="grid gap-3">
          {items.map((c) => {
            const paid = payments.find((p) => p.id === c.paymentId)?.status === "PAID";
            return (
              <button
                key={c.id}
                data-testid={`row-case-${c.id}`}
                onClick={() => onSelectCase(c.id)}
                className={`text-left rounded-3xl border bg-card/70 p-4 transition-colors hover:bg-card/90 ${
                  selectedCaseId === c.id ? "ring-2 ring-primary/25" : ""}
                `}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">{c.id}</div>
                    <div className="mt-1 text-sm font-semibold">{c.client}</div>
                    <div className="mt-1 text-sm text-muted-foreground">Stage: {c.stage} · Type: {c.caseType}</div>
                    <div className="mt-1 text-sm text-muted-foreground">Payment: {c.paymentId}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Pill tone={c.status === "Archived" ? "neutral" : "primary"} text={c.status} testId={`pill-case-status-${c.id}`} />
                    <Pill tone={paid ? "primary" : "danger"} text={paid ? "PAID" : "UNPAID"} testId={`pill-case-paid-${c.id}`} />
                    <Pill tone={c.hasPoa ? "primary" : "danger"} text={c.hasPoa ? "POA" : "NO POA"} testId={`pill-case-poa-${c.id}`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="card-surface rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Manage selected</div>
            <div className="mt-1 text-sm text-muted-foreground">All secretary duties on a case.</div>
          </div>
        </div>
        <Separator className="my-4" />

        {!selected ? (
          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">Select a case.</div>
        ) : (
          <div className="grid gap-2">
            <UploadPoaModal
              locale={locale}
              caseRecord={selected}
              disabled={selected.status === "Archived"}
              onSave={(poaNumber, poaExpiry, files) => onPoa(selected.id, poaNumber, poaExpiry, files)}
            />
            <UploadClientDocsModal
              locale={locale}
              caseRecord={selected}
              disabled={selected.status === "Archived"}
              onSave={(files) => onClientDocs(selected.id, files)}
            />
            <AssignLawyersModal
              locale={locale}
              caseRecord={selected}
              disabled={selected.status === "Archived"}
              onAssign={(d, a) => onAssign(selected.id, d, a)}
            />
            <RecordDecisionModal
              locale={locale}
              caseRecord={selected}
              disabled={selected.status === "Archived"}
              onRecord={(decision, close) => onDecision(selected.id, decision, close)}
            />
            <ArchiveCaseModal
              locale={locale}
              caseRecord={selected}
              disabled={selected.status !== "Closed"}
              onArchive={() => onArchive(selected.id)}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

function UploadPoaModal({
  locale,
  caseRecord,
  disabled,
  onSave,
}: {
  locale: "en" | "ar";
  caseRecord: CaseRecord;
  disabled?: boolean;
  onSave: (poaNumber: string, poaExpiry: string, files: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [poaNumber, setPoaNumber] = useState(caseRecord.poaNumber ?? "");
  const [poaExpiry, setPoaExpiry] = useState(caseRecord.poaExpiry ?? "");
  const [files, setFiles] = useState<string[]>(caseRecord.poaFiles ?? []);
  const [fileName, setFileName] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-upload-poa" variant="secondary" className="h-10 justify-start rounded-2xl" disabled={disabled}>
          <Upload className="mr-2 h-4 w-4" />
          Upload POA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[720px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-left">POA upload</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="rounded-2xl border bg-card/70 p-4">
            <div className="font-mono text-xs text-muted-foreground">{caseRecord.id}</div>
            <div className="mt-1 text-sm font-semibold">{caseRecord.client}</div>
            <div className="mt-1 text-sm text-muted-foreground">Stage: {caseRecord.stage}</div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <Label data-testid="label-poa-number">POA number</Label>
              <Input data-testid="input-poa-number" value={poaNumber} onChange={(e) => setPoaNumber(e.target.value)} className="h-11 rounded-2xl" placeholder="POA-..." />
            </div>
            <div className="grid gap-2">
              <Label data-testid="label-poa-expiry">POA expiry</Label>
              <Input data-testid="input-poa-expiry" value={poaExpiry} onChange={(e) => setPoaExpiry(e.target.value)} className="h-11 rounded-2xl" placeholder="YYYY-MM-DD" />
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/40 p-4">
            <div className="text-sm font-semibold">Files</div>
            <div className="mt-1 text-sm text-muted-foreground">Mock uploader: type a filename and add it.</div>
            <div className="mt-3 flex items-center gap-2">
              <Input data-testid="input-poa-file" value={fileName} onChange={(e) => setFileName(e.target.value)} className="h-11 rounded-2xl" placeholder="POA.pdf" />
              <Button
                data-testid="button-add-poa-file"
                variant="secondary"
                className="h-11 rounded-2xl"
                onClick={() => {
                  if (!fileName.trim()) return;
                  setFiles((f) => [...f, fileName.trim()]);
                  setFileName("");
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="mt-3 grid gap-2">
              {files.length === 0 ? (
                <div className="text-sm text-muted-foreground">No files added.</div>
              ) : (
                files.map((f, idx) => (
                  <div key={`${f}-${idx}`} data-testid={`row-poa-file-${idx}`} className="flex items-center justify-between gap-3 rounded-2xl border bg-card/70 px-3 py-2">
                    <div className="text-sm truncate">{f}</div>
                    <Button
                      data-testid={`button-remove-poa-file-${idx}`}
                      variant="secondary"
                      className="h-9 rounded-2xl"
                      onClick={() => setFiles((all) => all.filter((_, i) => i !== idx))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
            Secretary can upload POA and client documents. This is required to proceed.
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button data-testid="button-cancel-poa" variant="secondary" className="rounded-2xl" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            data-testid="button-save-poa"
            className="rounded-2xl"
            disabled={files.length === 0}
            onClick={() => {
              onSave(poaNumber.trim(), poaExpiry.trim(), files);
              setOpen(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadClientDocsModal({
  locale,
  caseRecord,
  disabled,
  onSave,
}: {
  locale: "en" | "ar";
  caseRecord: CaseRecord;
  disabled?: boolean;
  onSave: (files: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setFiles([]); setFileName(""); } }}>
      <DialogTrigger asChild>
        <Button data-testid="button-upload-client-docs" variant="secondary" className="h-10 justify-start rounded-2xl" disabled={disabled}>
          <FileText className="mr-2 h-4 w-4" />
          Upload client documents
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[720px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-left">Client documents</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="rounded-2xl border bg-card/70 p-4">
            <div className="font-mono text-xs text-muted-foreground">{caseRecord.id}</div>
            <div className="mt-1 text-sm font-semibold">{caseRecord.client}</div>
            <div className="mt-1 text-sm text-muted-foreground">Phone: {caseRecord.clientPhone}</div>
          </div>

          <div className="rounded-2xl border bg-muted/40 p-4">
            <div className="text-sm font-semibold">Add files</div>
            <div className="mt-1 text-sm text-muted-foreground">Mock uploader: type a filename and add it.</div>
            <div className="mt-3 flex items-center gap-2">
              <Input data-testid="input-client-file" value={fileName} onChange={(e) => setFileName(e.target.value)} className="h-11 rounded-2xl" placeholder="ID.pdf" />
              <Button
                data-testid="button-add-client-file"
                variant="secondary"
                className="h-11 rounded-2xl"
                onClick={() => {
                  if (!fileName.trim()) return;
                  setFiles((f) => [...f, fileName.trim()]);
                  setFileName("");
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="mt-3 grid gap-2">
              {files.length === 0 ? (
                <div className="text-sm text-muted-foreground">No files added.</div>
              ) : (
                files.map((f, idx) => (
                  <div key={`${f}-${idx}`} data-testid={`row-client-file-${idx}`} className="flex items-center justify-between gap-3 rounded-2xl border bg-card/70 px-3 py-2">
                    <div className="text-sm truncate">{f}</div>
                    <Button
                      data-testid={`button-remove-client-file-${idx}`}
                      variant="secondary"
                      className="h-9 rounded-2xl"
                      onClick={() => setFiles((all) => all.filter((_, i) => i !== idx))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
            Secretary uploads client documents and can later send WhatsApp updates.
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button data-testid="button-cancel-client-docs" variant="secondary" className="rounded-2xl" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            data-testid="button-save-client-docs"
            className="rounded-2xl"
            disabled={files.length === 0}
            onClick={() => {
              onSave(files);
              setOpen(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignLawyersModal({
  locale,
  caseRecord,
  disabled,
  onAssign,
}: {
  locale: "en" | "ar";
  caseRecord: CaseRecord;
  disabled?: boolean;
  onAssign: (drafting: string, approving: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [drafting, setDrafting] = useState(caseRecord.draftingLawyer ?? staffSeed.draftingLawyers[0]);
  const [approving, setApproving] = useState(caseRecord.approvingLawyer ?? staffSeed.approvingLawyers[0]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-assign-lawyers" variant="secondary" className="h-10 justify-start rounded-2xl" disabled={disabled}>
          <UserPlus className="mr-2 h-4 w-4" />
          Assign lawyers
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[720px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-left">Assign drafting & approving lawyer</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="rounded-2xl border bg-card/70 p-4">
            <div className="font-mono text-xs text-muted-foreground">{caseRecord.id}</div>
            <div className="mt-1 text-sm font-semibold">{caseRecord.client}</div>
            <div className="mt-1 text-sm text-muted-foreground">Stage: {caseRecord.stage}</div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <Label data-testid="label-drafting">Drafting lawyer</Label>
              <Select value={drafting} onValueChange={(v) => setDrafting(v)}>
                <SelectTrigger data-testid="select-drafting" className="h-11 rounded-2xl">
                  <SelectValue placeholder="Drafting" />
                </SelectTrigger>
                <SelectContent>
                  {staffSeed.draftingLawyers.map((n) => (
                    <SelectItem key={n} value={n} data-testid={`option-drafting-${n.replaceAll(" ", "-")}`}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label data-testid="label-approving">Approving lawyer</Label>
              <Select value={approving} onValueChange={(v) => setApproving(v)}>
                <SelectTrigger data-testid="select-approving" className="h-11 rounded-2xl">
                  <SelectValue placeholder="Approving" />
                </SelectTrigger>
                <SelectContent>
                  {staffSeed.approvingLawyers.map((n) => (
                    <SelectItem key={n} value={n} data-testid={`option-approving-${n.replaceAll(" ", "-")}`}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
            Secretary assigns drafting and approving lawyer. Secretary cannot draft, approve, or sign.
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button data-testid="button-cancel-assign" variant="secondary" className="rounded-2xl" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            data-testid="button-save-assign"
            className="rounded-2xl"
            onClick={() => {
              onAssign(drafting, approving);
              setOpen(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SessionsSection({
  locale,
  cases,
  sessions,
  selectedCaseId,
  onSelectCase,
  onCreate,
  onUploadSubmission,
  onOutcome,
}: {
  locale: "en" | "ar";
  cases: CaseRecord[];
  sessions: SessionRecord[];
  selectedCaseId: string | null;
  onSelectCase: (id: string) => void;
  onCreate: (caseId: string, stage: Stage, date: string, submissionRequired: boolean) => void;
  onUploadSubmission: (caseId: string, sessionId: string, ref: string, date: string, files: string[]) => void;
  onOutcome: (sessionId: string, outcome: string, status: SessionRecord["status"]) => void;
}) {
  const [openNew, setOpenNew] = useState(false);
  const [openSub, setOpenSub] = useState(false);
  const [openOut, setOpenOut] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  const selected = useMemo(() => cases.find((c) => c.id === selectedCaseId) ?? null, [cases, selectedCaseId]);

  const sessionsForCase = useMemo(() => {
    if (!selectedCaseId) return [];
    return sessions.filter((s) => s.caseId === selectedCaseId);
  }, [sessions, selectedCaseId]);

  const selectedSession = useMemo(() => sessions.find((s) => s.id === sessionId) ?? null, [sessions, sessionId]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,0.5fr]">
      <Card className="card-surface rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Sessions & submissions</div>
            <div className="mt-1 text-sm text-muted-foreground">No session without official submission proof.</div>
          </div>
          <div className="flex items-center gap-2">
            <Button data-testid="button-new-session" className="rounded-2xl" onClick={() => setOpenNew(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New session
            </Button>
          </div>
        </div>
        <Separator className="my-4" />

        <div className="grid gap-3">
          {sessions.map((s) => (
            <button
              key={s.id}
              data-testid={`row-session-${s.id}`}
              onClick={() => {
                setSessionId(s.id);
                onSelectCase(s.caseId);
              }}
              className={`text-left rounded-3xl border bg-card/70 p-4 transition-colors hover:bg-card/90 ${
                sessionId === s.id ? "ring-2 ring-primary/25" : ""}
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-xs text-muted-foreground">{s.id}</div>
                  <div className="mt-1 text-sm font-semibold">{s.caseId}</div>
                  <div className="mt-1 text-sm text-muted-foreground">Stage: {s.stage} · Date: {s.date}</div>
                  <div className="mt-1 text-sm text-muted-foreground">Requires: {s.requiresMemo}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Pill tone={s.status === "Submitted" ? "primary" : s.status === "Planned" ? "danger" : "neutral"} text={s.status} testId={`pill-session-${s.id}`} />
                  <Pill tone={s.submissionRequired ? "accent" : "neutral"} text={s.submissionRequired ? "Submission required" : "No submission"} testId={`pill-subreq-${s.id}`} />
                </div>
              </div>

              {s.submissionProofFiles.length > 0 ? (
                <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-muted-foreground">
                  Submission proof uploaded · Ref: <span className="font-mono text-foreground">{s.submissionRef ?? "—"}</span>
                </div>
              ) : null}
            </button>
          ))}
        </div>
      </Card>

      <Card className="card-surface rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Manage session</div>
            <div className="mt-1 text-sm text-muted-foreground">Select a session to record submission and outcome.</div>
          </div>
        </div>
        <Separator className="my-4" />

        <div className="grid gap-2">
          <Select value={selectedCaseId ?? ""} onValueChange={(v) => onSelectCase(v)}>
            <SelectTrigger data-testid="select-session-case" className="h-11 rounded-2xl">
              <SelectValue placeholder="Select case" />
            </SelectTrigger>
            <SelectContent>
              {cases.map((c) => (
                <SelectItem key={c.id} value={c.id} data-testid={`option-session-case-${c.id}`}>
                  {c.id} — {c.client}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sessionId} onValueChange={(v) => setSessionId(v)}>
            <SelectTrigger data-testid="select-session" className="h-11 rounded-2xl">
              <SelectValue placeholder="Select session" />
            </SelectTrigger>
            <SelectContent>
              {sessionsForCase.map((s) => (
                <SelectItem key={s.id} value={s.id} data-testid={`option-session-${s.id}`}>
                  {s.id} — {s.date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            data-testid="button-upload-submission"
            variant="secondary"
            className="h-10 justify-start rounded-2xl"
            disabled={!selected || !selectedSession || !selectedSession.submissionRequired}
            onClick={() => setOpenSub(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload submission proof
          </Button>

          <Button
            data-testid="button-record-outcome"
            variant="secondary"
            className="h-10 justify-start rounded-2xl"
            disabled={!selectedSession}
            onClick={() => setOpenOut(true)}
          >
            <Gavel className="mr-2 h-4 w-4" />
            Record session outcome
          </Button>
        </div>

        <NewSessionModal
          open={openNew}
          onOpenChange={setOpenNew}
          cases={cases}
          selectedCaseId={selectedCaseId}
          onCreate={onCreate}
        />
        <UploadSubmissionModal
          open={openSub}
          onOpenChange={setOpenSub}
          session={selectedSession}
          onSave={(ref, date, files) => {
            if (!selectedSession) return;
            onUploadSubmission(selectedSession.caseId, selectedSession.id, ref, date, files);
          }}
        />
        <RecordOutcomeModal
          open={openOut}
          onOpenChange={setOpenOut}
          session={selectedSession}
          onSave={(outcome, status) => {
            if (!selectedSession) return;
            onOutcome(selectedSession.id, outcome, status);
          }}
        />
      </Card>
    </div>
  );
}

function NewSessionModal({
  open,
  onOpenChange,
  cases,
  selectedCaseId,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cases: CaseRecord[];
  selectedCaseId: string | null;
  onCreate: (caseId: string, stage: Stage, date: string, submissionRequired: boolean) => void;
}) {
  const [caseId, setCaseId] = useState(selectedCaseId ?? "");
  const [stage, setStage] = useState<Stage>("First Instance");
  const [date, setDate] = useState("2026-02-10 10:00");
  const [submissionRequired, setSubmissionRequired] = useState(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-left">Create session</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label data-testid="label-session-case">Case</Label>
            <Select value={caseId} onValueChange={(v) => setCaseId(v)}>
              <SelectTrigger data-testid="select-newsession-case" className="h-11 rounded-2xl">
                <SelectValue placeholder="Select case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c) => (
                  <SelectItem key={c.id} value={c.id} data-testid={`option-newsession-case-${c.id}`}>
                    {c.id} — {c.client}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <Label data-testid="label-session-stage">Stage</Label>
              <Select value={stage} onValueChange={(v) => setStage(v as Stage)}>
                <SelectTrigger data-testid="select-newsession-stage" className="h-11 rounded-2xl">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prosecution">Prosecution</SelectItem>
                  <SelectItem value="Investigation">Investigation</SelectItem>
                  <SelectItem value="First Instance">First Instance</SelectItem>
                  <SelectItem value="Appeal">Appeal</SelectItem>
                  <SelectItem value="Cassation (Tamyeez)">Cassation (Tamyeez)</SelectItem>
                  <SelectItem value="Enforcement">Enforcement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label data-testid="label-session-date">Session date</Label>
              <Input data-testid="input-session-date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-2xl" />
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4" />
              <div>
                <div className="font-semibold text-foreground">Rule</div>
                <div className="mt-1">No court session without official submission proof.</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-2xl border bg-card/70 p-3">
              <div className="text-sm">Submission required</div>
              <button
                data-testid="toggle-submission-required"
                onClick={() => setSubmissionRequired((v) => !v)}
                className={`h-7 w-12 rounded-full border transition-colors ${submissionRequired ? "bg-primary/20 border-primary/30" : "bg-muted/60"}`}
              >
                <span
                  className={`block h-6 w-6 translate-x-0.5 rounded-full bg-background shadow transition-transform ${submissionRequired ? "translate-x-[22px]" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button data-testid="button-cancel-newsession" variant="secondary" className="rounded-2xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            data-testid="button-create-newsession"
            className="rounded-2xl"
            disabled={!caseId || date.trim().length < 6}
            onClick={() => {
              onCreate(caseId, stage, date.trim(), submissionRequired);
              onOpenChange(false);
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadSubmissionModal({
  open,
  onOpenChange,
  session,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  session: SessionRecord | null;
  onSave: (ref: string, date: string, files: string[]) => void;
}) {
  const [ref, setRef] = useState("");
  const [date, setDate] = useState("2026-02-01");
  const [files, setFiles] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setRef(""); setFiles([]); setFileName(""); } }}>
      <DialogContent className="max-w-[720px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-left">Submission proof</DialogTitle>
        </DialogHeader>

        {!session ? (
          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">Select a session first.</div>
        ) : (
          <div className="grid gap-4">
            <div className="rounded-2xl border bg-card/70 p-4">
              <div className="font-mono text-xs text-muted-foreground">{session.id}</div>
              <div className="mt-1 text-sm font-semibold">{session.caseId}</div>
              <div className="mt-1 text-sm text-muted-foreground">Stage: {session.stage} · Date: {session.date}</div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label data-testid="label-submission-ref">Reference number</Label>
                <Input data-testid="input-submission-ref" value={ref} onChange={(e) => setRef(e.target.value)} className="h-11 rounded-2xl" placeholder="Portal reference" />
              </div>
              <div className="grid gap-2">
                <Label data-testid="label-submission-date">Submission date</Label>
                <Input data-testid="input-submission-date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-2xl" placeholder="YYYY-MM-DD" />
              </div>
            </div>

            <div className="rounded-2xl border bg-muted/40 p-4">
              <div className="text-sm font-semibold">Proof files (PDF)</div>
              <div className="mt-1 text-sm text-muted-foreground">Mock uploader: type a filename and add it.</div>
              <div className="mt-3 flex items-center gap-2">
                <Input data-testid="input-submission-file" value={fileName} onChange={(e) => setFileName(e.target.value)} className="h-11 rounded-2xl" placeholder="SubmissionProof.pdf" />
                <Button
                  data-testid="button-add-submission-file"
                  variant="secondary"
                  className="h-11 rounded-2xl"
                  onClick={() => {
                    if (!fileName.trim()) return;
                    setFiles((f) => [...f, fileName.trim()]);
                    setFileName("");
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>

              <div className="mt-3 grid gap-2">
                {files.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No files added.</div>
                ) : (
                  files.map((f, idx) => (
                    <div key={`${f}-${idx}`} data-testid={`row-submission-file-${idx}`} className="flex items-center justify-between gap-3 rounded-2xl border bg-card/70 px-3 py-2">
                      <div className="text-sm truncate">{f}</div>
                      <Button
                        data-testid={`button-remove-submission-file-${idx}`}
                        variant="secondary"
                        className="h-9 rounded-2xl"
                        onClick={() => setFiles((all) => all.filter((_, i) => i !== idx))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              Legal secretary submits to portal. This UI records the reference number + proof PDF.
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button data-testid="button-cancel-submission" variant="secondary" className="rounded-2xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            data-testid="button-save-submission"
            className="rounded-2xl"
            disabled={!session || ref.trim().length < 2 || files.length === 0}
            onClick={() => {
              onSave(ref.trim(), date.trim(), files);
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecordOutcomeModal({
  open,
  onOpenChange,
  session,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  session: SessionRecord | null;
  onSave: (outcome: string, status: SessionRecord["status"]) => void;
}) {
  const [outcome, setOutcome] = useState("");
  const [status, setStatus] = useState<SessionRecord["status"]>("Occurred");

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setOutcome(""); setStatus("Occurred"); } }}>
      <DialogContent className="max-w-[720px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-left">Session outcome</DialogTitle>
        </DialogHeader>

        {!session ? (
          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">Select a session first.</div>
        ) : (
          <div className="grid gap-4">
            <div className="rounded-2xl border bg-card/70 p-4">
              <div className="font-mono text-xs text-muted-foreground">{session.id}</div>
              <div className="mt-1 text-sm font-semibold">{session.caseId}</div>
              <div className="mt-1 text-sm text-muted-foreground">Date: {session.date}</div>
            </div>

            <div className="grid gap-2">
              <Label data-testid="label-session-outcome">Outcome / update</Label>
              <Textarea data-testid="textarea-session-outcome" value={outcome} onChange={(e) => setOutcome(e.target.value)} className="min-h-[120px] rounded-2xl" placeholder="Write the outcome..." />
            </div>

            <div className="grid gap-2">
              <Label data-testid="label-session-status">Session status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger data-testid="select-session-status" className="h-11 rounded-2xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Occurred">Occurred</SelectItem>
                  <SelectItem value="Adjourned">Adjourned</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Planned">Planned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button data-testid="button-cancel-outcome" variant="secondary" className="rounded-2xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            data-testid="button-save-outcome"
            className="rounded-2xl"
            disabled={!session || outcome.trim().length < 3}
            onClick={() => {
              onSave(outcome.trim(), status);
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DocumentsSection({
  locale,
  cases,
  selectedCaseId,
  onSelectCase,
}: {
  locale: "en" | "ar";
  cases: CaseRecord[];
  selectedCaseId: string | null;
  onSelectCase: (id: string) => void;
}) {
  const selected = useMemo(() => cases.find((c) => c.id === selectedCaseId) ?? null, [cases, selectedCaseId]);

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr,0.6fr]">
      <Card className="card-surface rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Document control</div>
            <div className="mt-1 text-sm text-muted-foreground">POA + client documents are managed by secretary.</div>
          </div>
        </div>
        <Separator className="my-4" />

        <Select value={selectedCaseId ?? ""} onValueChange={(v) => onSelectCase(v)}>
          <SelectTrigger data-testid="select-docs-case" className="h-11 rounded-2xl">
            <SelectValue placeholder="Select case" />
          </SelectTrigger>
          <SelectContent>
            {cases.map((c) => (
              <SelectItem key={c.id} value={c.id} data-testid={`option-docs-case-${c.id}`}>
                {c.id} — {c.client}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-4 grid gap-3">
          <div className="rounded-3xl border bg-card/70 p-4">
            <div className="text-sm font-semibold">POA files</div>
            <div className="mt-1 text-sm text-muted-foreground">Read-only view for the selected case.</div>
            <div className="mt-3 grid gap-2">
              {(selected?.poaFiles ?? []).length === 0 ? (
                <div className="text-sm text-muted-foreground">No POA uploaded.</div>
              ) : (
                selected!.poaFiles.map((f, idx) => (
                  <div key={`${f}-${idx}`} data-testid={`doc-poa-${idx}`} className="flex items-center justify-between rounded-2xl border bg-card/70 px-3 py-2">
                    <div className="text-sm truncate">{f}</div>
                    <Pill tone="primary" text="Locked" testId={`pill-doc-poa-${idx}`} />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border bg-card/70 p-4">
            <div className="text-sm font-semibold">Client documents</div>
            <div className="mt-1 text-sm text-muted-foreground">Read-only view for the selected case.</div>
            <div className="mt-3 grid gap-2">
              {(selected?.clientFiles ?? []).length === 0 ? (
                <div className="text-sm text-muted-foreground">No documents uploaded.</div>
              ) : (
                selected!.clientFiles.map((f, idx) => (
                  <div key={`${f}-${idx}`} data-testid={`doc-client-${idx}`} className="flex items-center justify-between rounded-2xl border bg-card/70 px-3 py-2">
                    <div className="text-sm truncate">{f}</div>
                    <Pill tone="neutral" text="File" testId={`pill-doc-client-${idx}`} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="card-surface rounded-3xl p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent/10 text-accent">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Rules</div>
            <div className="mt-1 text-sm text-muted-foreground">Secretary: upload documents, assign lawyers, record decision, close + archive.</div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-2 text-sm text-muted-foreground">
          <div>• Payment may occur before case creation</div>
          <div>• Secretary creates invoice/payment record first</div>
          <div>• Secretary uploads POA and client documents</div>
          <div>• Secretary assigns drafting and approving lawyer</div>
          <div>• Secretary records decisions and closes cases</div>
          <div>• Secretary can archive only when closed (read-only)</div>
        </div>
      </Card>
    </div>
  );
}

function TasksSection({
  locale,
  cases,
  tasks,
  selectedCaseId,
  onSelectCase,
  onDone,
}: {
  locale: "en" | "ar";
  cases: CaseRecord[];
  tasks: TaskRecord[];
  selectedCaseId: string | null;
  onSelectCase: (id: string) => void;
  onDone: (id: string) => void;
}) {
  const filtered = useMemo(() => {
    if (!selectedCaseId) return tasks;
    return tasks.filter((t) => t.caseId === selectedCaseId);
  }, [tasks, selectedCaseId]);

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr,0.6fr]">
      <Card className="card-surface rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Tasks</div>
            <div className="mt-1 text-sm text-muted-foreground">Assigned tasks across roles (mock).</div>
          </div>
          <Pill tone="neutral" text={`${filtered.filter((t) => t.status === "Open").length} open`} testId="badge-open-tasks" />
        </div>
        <Separator className="my-4" />

        <div className="grid gap-2">
          {filtered.map((t) => (
            <div key={t.id} data-testid={`row-task-${t.id}`} className="flex items-center justify-between gap-3 rounded-2xl border bg-card/70 p-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{t.title}</div>
                <div className="mt-1 text-sm text-muted-foreground truncate">
                  {t.assigneeRole} · {t.caseId ?? "—"} · Due: {t.due}
                </div>
              </div>
              {t.status === "Open" ? (
                <Button data-testid={`button-task-done-${t.id}`} variant="secondary" className="rounded-2xl" onClick={() => onDone(t.id)}>
                  Done
                </Button>
              ) : (
                <Pill tone="primary" text="Done" testId={`pill-task-done-${t.id}`} />
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="card-surface rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Filter</div>
            <div className="mt-1 text-sm text-muted-foreground">View tasks for a specific case.</div>
          </div>
        </div>
        <Separator className="my-4" />

        <Select value={selectedCaseId ?? ""} onValueChange={(v) => onSelectCase(v)}>
          <SelectTrigger data-testid="select-tasks-case" className="h-11 rounded-2xl">
            <SelectValue placeholder="Select case" />
          </SelectTrigger>
          <SelectContent>
            {cases.map((c) => (
              <SelectItem key={c.id} value={c.id} data-testid={`option-tasks-case-${c.id}`}>
                {c.id} — {c.client}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-4 rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
          This is a UI prototype. Backend integration will later enforce assignments and notifications.
        </div>
      </Card>
    </div>
  );
}

function WhatsAppSection({
  locale,
  cases,
  payments,
  logs,
  onSend,
}: {
  locale: "en" | "ar";
  cases: CaseRecord[];
  payments: PaymentRecord[];
  logs: WhatsAppLog[];
  onSend: (tpl: WhatsAppLog["template"], client: string, phone: string, type: WhatsAppLog["type"], message: string) => void;
}) {
  const [caseId, setCaseId] = useState<string>(cases[0]?.id ?? "");
  const c = cases.find((x) => x.id === caseId) ?? null;
  const p = c ? payments.find((x) => x.id === c.paymentId) ?? null : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr,0.6fr]">
      <Card className="card-surface rounded-3xl p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent/10 text-accent">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">WhatsApp</div>
            <div className="mt-1 text-sm text-muted-foreground">Manual and automated logs (mock). WhatsApp is primary channel.</div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid gap-2">
          {logs.map((w) => (
            <div key={w.id} data-testid={`row-wa-${w.id}`} className="rounded-3xl border bg-card/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-mono text-xs text-muted-foreground">{w.time}</div>
                <Pill tone={w.type === "Automated" ? "accent" : "neutral"} text={w.type} testId={`pill-wa-${w.id}`} />
              </div>
              <div className="mt-2 text-sm font-semibold">{w.template}</div>
              <div className="mt-1 text-sm text-muted-foreground">{w.client} · {w.phone}</div>
              <div className="mt-2 text-sm">{w.message}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="card-surface rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Send message</div>
            <div className="mt-1 text-sm text-muted-foreground">Templates aligned to your rules.</div>
          </div>
        </div>
        <Separator className="my-4" />

        <Select value={caseId} onValueChange={(v) => setCaseId(v)}>
          <SelectTrigger data-testid="select-wa-case" className="h-11 rounded-2xl">
            <SelectValue placeholder="Select case" />
          </SelectTrigger>
          <SelectContent>
            {cases.map((cc) => (
              <SelectItem key={cc.id} value={cc.id} data-testid={`option-wa-case-${cc.id}`}>
                {cc.id} — {cc.client}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-3">
          <SendWhatsAppModal
            locale={locale}
            caseRecord={c}
            payment={p}
            onSend={(tpl, type, msg) => {
              if (!c) return;
              onSend(tpl, c.client, c.clientPhone, type, msg);
            }}
          />
        </div>

        <div className="mt-4 rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
          WhatsApp API is available later. This screen is ready to integrate.
        </div>
      </Card>
    </div>
  );
}

function SendWhatsAppModal({
  locale,
  caseRecord,
  payment,
  onSend,
}: {
  locale: "en" | "ar";
  caseRecord: CaseRecord | null;
  payment: PaymentRecord | null;
  onSend: (tpl: WhatsAppLog["template"], type: WhatsAppLog["type"], msg: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tpl, setTpl] = useState<WhatsAppLog["template"]>("Payment confirmation");
  const [type, setType] = useState<WhatsAppLog["type"]>("Manual");
  const [message, setMessage] = useState("");

  const defaultMessage = useMemo(() => {
    if (!caseRecord) return "";
    if (tpl === "Payment confirmation") {
      const amt = payment ? moneyQar(payment.amountQar) : "QAR";
      return `Payment confirmation for ${caseRecord.id}. Amount: ${amt}.`;
    }
    if (tpl === "Submission confirmation") {
      return `Submission completed. Reference number will be shared once confirmed.`;
    }
    if (tpl === "Session date") {
      return `Session scheduled. Date/time will be shared with you.`;
    }
    if (tpl === "Session result") {
      return `Session update: outcome recorded. We will send details.`;
    }
    return `Decision update: recorded in the system.`;
  }, [tpl, caseRecord, payment]);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setMessage(defaultMessage); }}>
      <DialogTrigger asChild>
        <Button data-testid="button-send-wa" className="h-11 w-full rounded-2xl" disabled={!caseRecord}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Send WhatsApp message
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[720px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-left">WhatsApp message</DialogTitle>
        </DialogHeader>

        {!caseRecord ? (
          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">Select a case first.</div>
        ) : (
          <div className="grid gap-4">
            <div className="rounded-2xl border bg-card/70 p-4">
              <div className="font-mono text-xs text-muted-foreground">{caseRecord.id}</div>
              <div className="mt-1 text-sm font-semibold">{caseRecord.client}</div>
              <div className="mt-1 text-sm text-muted-foreground">WhatsApp: {caseRecord.clientPhone}</div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label data-testid="label-wa-template">Template</Label>
                <Select value={tpl} onValueChange={(v) => setTpl(v as any)}>
                  <SelectTrigger data-testid="select-wa-template" className="h-11 rounded-2xl">
                    <SelectValue placeholder="Template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Payment confirmation">Payment confirmation</SelectItem>
                    <SelectItem value="Submission confirmation">Submission confirmation</SelectItem>
                    <SelectItem value="Session date">Session date</SelectItem>
                    <SelectItem value="Session result">Session result</SelectItem>
                    <SelectItem value="Decision update">Decision update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label data-testid="label-wa-type">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as any)}>
                  <SelectTrigger data-testid="select-wa-type" className="h-11 rounded-2xl">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Automated">Automated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label data-testid="label-wa-message">Message</Label>
              <Textarea data-testid="textarea-wa-message" value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[120px] rounded-2xl" />
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button data-testid="button-cancel-wa" variant="secondary" className="rounded-2xl" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            data-testid="button-confirm-wa"
            className="rounded-2xl"
            disabled={!caseRecord || message.trim().length < 2}
            onClick={() => {
              onSend(tpl, type, message.trim());
              setOpen(false);
            }}
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AuditSection({ locale, logs }: { locale: "en" | "ar"; logs: AuditLog[] }) {
  return (
    <Card className="card-surface rounded-3xl p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold">Audit trail</div>
          <div className="mt-1 text-sm text-muted-foreground">Every action creates a log entry (mock).</div>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="grid gap-2">
        {logs.map((a) => (
          <div key={a.id} data-testid={`row-audit-${a.id}`} className="rounded-3xl border bg-card/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-mono text-xs text-muted-foreground">{a.time}</div>
              <Pill tone="neutral" text={a.actor} testId={`pill-audit-actor-${a.id}`} />
            </div>
            <div className="mt-2 text-sm font-semibold">{a.action}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Ref: <span className="font-mono text-foreground">{a.ref}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
