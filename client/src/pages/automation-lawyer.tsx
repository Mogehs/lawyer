import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Bell,
  Bot,
  CheckCircle2,
  Globe,
  Lock,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
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
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { ts } from "@/lib/secretary-i18n";
import { useUiState } from "@/lib/ui-state";

type AutomationJob = {
  id: string;
  caseId: string;
  client: string;
  trigger: "Payment became PAID" | "Submission proof missing" | "Session upcoming" | "POA missing";
  action: "Draft WhatsApp reminder" | "Create task" | "Escalate to Partner";
  status: "Ready" | "Blocked" | "Executed";
  reason?: string;
};

const seed: AutomationJob[] = [
  {
    id: "AUTO-1102",
    caseId: "CASE-2026-0103",
    client: "Al Noor Trading W.L.L.",
    trigger: "Submission proof missing",
    action: "Draft WhatsApp reminder",
    status: "Ready",
  },
  {
    id: "AUTO-1090",
    caseId: "CASE-2026-0091",
    client: "Doha Properties",
    trigger: "Payment became PAID",
    action: "Create task",
    status: "Executed",
  },
  {
    id: "AUTO-1082",
    caseId: "CASE-2026-0060",
    client: "Private (Confidential)",
    trigger: "POA missing",
    action: "Escalate to Partner",
    status: "Blocked",
    reason: "Payment is UNPAID (Case gate)",
  },
];

function LanguageSelect() {
  const { locale, setLocale } = useUiState();
  return (
    <Select value={locale} onValueChange={(v) => setLocale(v as any)}>
      <SelectTrigger data-testid="select-language" className="h-10 w-[140px] rounded-2xl">
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
  );
}

function JobPill({ status, testId }: { status: AutomationJob["status"]; testId: string }) {
  const cls =
    status === "Ready"
      ? "border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]"
      : status === "Executed"
        ? "border-[hsl(var(--accent)/0.25)] bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]"
        : "border-[hsl(var(--destructive)/0.25)] bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))]";

  return (
    <span data-testid={testId} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}

function ExecuteJobModal({
  locale,
  job,
  onExecute,
}: {
  locale: "en" | "ar";
  job: AutomationJob;
  onExecute: (payload: { message?: string; notes?: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState("");

  const blocked = job.status === "Blocked";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setMessage("");
          setNotes("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button data-testid={`button-execute-${job.id}`} className="h-10 rounded-2xl" disabled={job.status !== "Ready"}>
          <Sparkles className="mr-2 h-4 w-4" />
          {locale === "ar" ? "تنفيذ" : "Execute"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[820px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-left">{locale === "ar" ? "تنفيذ إجراء" : "Execute action"}</DialogTitle>
        </DialogHeader>

        {blocked ? (
          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Lock className="mt-0.5 h-4 w-4" />
              <div>
                <div className="font-semibold text-foreground">{locale === "ar" ? "محظور" : "Blocked"}</div>
                <div className="mt-1">{job.reason ?? (locale === "ar" ? "سبب غير معروف" : "Unknown reason")}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="rounded-2xl border bg-card/70 p-4">
              <div className="font-mono text-xs text-muted-foreground">{job.caseId}</div>
              <div className="mt-1 text-sm font-semibold">{job.client}</div>
              <div className="mt-1 text-sm text-muted-foreground">{job.id}</div>
            </div>

            <div className="grid gap-2">
              <Label data-testid="label-action">{locale === "ar" ? "الإجراء" : "Action"}</Label>
              <div data-testid="text-action" className="rounded-2xl border bg-card/70 p-3 text-sm">
                {job.action}
              </div>
            </div>

            {job.action === "Draft WhatsApp reminder" ? (
              <div className="grid gap-2">
                <Label data-testid="label-message">{locale === "ar" ? "رسالة" : "Message"}</Label>
                <Textarea
                  data-testid="textarea-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[140px] rounded-2xl"
                  placeholder={locale === "ar" ? "نص الرسالة..." : "Message text..."}
                />
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label data-testid="label-notes">{locale === "ar" ? "ملاحظات" : "Notes"}</Label>
              <Input data-testid="input-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="h-11 rounded-2xl" placeholder={locale === "ar" ? "اختياري" : "Optional"} />
            </div>

            <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4" />
                <div>
                  <div className="font-semibold text-foreground">{locale === "ar" ? "ملاحظة" : "Note"}</div>
                  <div className="mt-1">
                    {locale === "ar"
                      ? "لا يتم إرسال رسائل حقيقية هنا — هذا نموذج واجهة."
                      : "No real messages are sent here — UI prototype."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button data-testid="button-cancel" variant="secondary" className="rounded-2xl" onClick={() => setOpen(false)}>
            {ts(locale, "modalCancel")}
          </Button>
          <Button
            data-testid="button-confirm"
            className="rounded-2xl"
            disabled={blocked}
            onClick={() => {
              onExecute({ message: message.trim() || undefined, notes: notes.trim() || undefined });
              setOpen(false);
            }}
          >
            {locale === "ar" ? "تأكيد" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AutomationLawyerPage() {
  const { locale, isDark } = useUiState();
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState<AutomationJob[]>(seed);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((x) => [x.caseId, x.client, x.id, x.trigger, x.action, x.status].join(" ").toLowerCase().includes(q));
  }, [jobs, query]);

  function execute(id: string) {
    setJobs((all) => all.map((x) => (x.id === id ? { ...x, status: "Executed" } : x)));
  }

  return (
    <div className={`app-bg min-h-screen ${locale === "ar" ? "dir-rtl" : ""} ${isDark ? "dark" : ""}`}>
      <div className="mx-auto max-w-[1240px] px-4 py-3 lg:px-6">
        <header className="sticky-blur sticky top-3 z-20 mb-5 mt-2 rounded-3xl border px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div data-testid="text-role-title" className="text-base font-semibold">
                  {locale === "ar" ? "لوحة محامي الأتمتة" : "Automation Lawyer Dashboard"}
                </div>
                <div data-testid="text-role-subtitle" className="mt-0.5 text-sm text-muted-foreground">
                  {locale === "ar"
                    ? "تنفيذ قواعد تلقائية وإشعارات (واجهة فقط)."
                    : "Execute rule-driven automations and reminders (UI only)."}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 md:flex">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input data-testid="input-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={locale === "ar" ? "بحث في الأتمتة..." : "Search automations..."} className="h-10 w-[320px] rounded-2xl pl-9" />
                </div>
              </div>
              <LanguageSelect />
              <Button data-testid="button-notifications" variant="secondary" className="rounded-2xl">
                <Bell className="h-4 w-4" />
              </Button>
              <Link href="/login">
                <Button data-testid="button-back" variant="secondary" className="rounded-2xl">
                  {ts(locale, "back")}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
          <Card className="card-surface rounded-3xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div data-testid="text-jobs-title" className="text-sm font-semibold">
                  {locale === "ar" ? "وظائف الأتمتة" : "Automation jobs"}
                </div>
                <div data-testid="text-jobs-desc" className="mt-1 text-sm text-muted-foreground">
                  {locale === "ar" ? "تنفذ فقط عندما تكون القواعد تسمح." : "Executes only when rules allow."}
                </div>
              </div>
              <Badge data-testid="badge-ready" variant="secondary" className="rounded-full">
                {jobs.filter((x) => x.status === "Ready").length} {locale === "ar" ? "جاهز" : "ready"}
              </Badge>
            </div>

            <Separator className="my-5" />

            <div className="grid gap-3">
              {filtered.map((j) => (
                <div key={j.id} data-testid={`card-job-${j.id}`} className="rounded-3xl border bg-card/60 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div data-testid={`text-job-id-${j.id}`} className="font-mono text-xs text-muted-foreground">
                          {j.id}
                        </div>
                        <JobPill status={j.status} testId={`badge-job-status-${j.id}`} />
                      </div>
                      <div data-testid={`text-job-case-${j.id}`} className="mt-2 text-sm font-semibold">
                        {j.caseId} — {j.client}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <span className="text-foreground/70">Trigger:</span> {j.trigger}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <span className="text-foreground/70">Action:</span> {j.action}
                      </div>
                      {j.reason ? (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="text-foreground/70">Reason:</span> {j.reason}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                      <ExecuteJobModal
                        locale={locale}
                        job={j}
                        onExecute={() => {
                          execute(j.id);
                        }}
                      />
                      <Button data-testid={`button-message-${j.id}`} variant="secondary" className="h-10 rounded-2xl">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {locale === "ar" ? "سجل" : "Log"}
                      </Button>
                    </div>
                  </div>

                  {j.status === "Blocked" ? (
                    <div className="mt-4 rounded-2xl border bg-muted/40 p-3 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <Lock className="mt-0.5 h-4 w-4" />
                        <div>
                          <div className="font-semibold text-foreground">{locale === "ar" ? "محظور" : "Blocked"}</div>
                          <div className="mt-1">{j.reason}</div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="card-surface rounded-3xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{locale === "ar" ? "قواعد" : "Rules"}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {locale === "ar"
                      ? "الأتمتة لا تتجاوز القيود."
                      : "Automation cannot bypass gates."}
                  </div>
                </div>
                <Badge data-testid="badge-strict" variant="secondary" className="rounded-full">
                  Strict
                </Badge>
              </div>

              <div className="mt-4 grid gap-3">
                <div data-testid="rule-payment" className="rounded-2xl border bg-card/70 p-4 text-sm">
                  <div className="font-semibold">{locale === "ar" ? "الدفع" : "Payment"}</div>
                  <div className="mt-1 text-muted-foreground">
                    {locale === "ar" ? "لا يمكن تنفيذ أي إجراء متعلق بـ Case قبل PAID." : "No Case-related automation before PAID."}
                  </div>
                </div>
                <div data-testid="rule-sign" className="rounded-2xl border bg-card/70 p-4 text-sm">
                  <div className="font-semibold">{locale === "ar" ? "التوقيع" : "Signature"}</div>
                  <div className="mt-1 text-muted-foreground">
                    {locale === "ar" ? "التوقيع ليس للأتمتة." : "Automation cannot sign."}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="card-surface rounded-3xl p-5">
              <div className="text-sm font-semibold">{locale === "ar" ? "سجل التدقيق" : "Audit (preview)"}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {locale === "ar" ? "واجهة تجريبية." : "UI mock."}
              </div>
              <div className="mt-4 space-y-2">
                <div data-testid="audit-1" className="rounded-2xl border bg-card/70 p-3 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">22:23</span> · {locale === "ar" ? "وظيفة جاهزة" : "Job ready"} · AUTO-1102
                </div>
                <div data-testid="audit-2" className="rounded-2xl border bg-card/70 p-3 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">22:27</span> · {locale === "ar" ? "تم تنفيذ" : "Executed"} · AUTO-1090
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
