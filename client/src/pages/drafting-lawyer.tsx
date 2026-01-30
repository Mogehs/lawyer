import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Bell,
  CheckCircle2,
  FileText,
  Gavel,
  Globe,
  Lock,
  MessageSquare,
  Search,
  ShieldCheck,
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
import { Textarea } from "@/components/ui/textarea";

import { t } from "@/lib/i18n";
import { ts } from "@/lib/secretary-i18n";
import { useUiState } from "@/lib/ui-state";

type Stage =
  | "Prosecution"
  | "Investigation"
  | "First Instance"
  | "Appeal"
  | "Cassation (Tamyeez)"
  | "Enforcement";

type TaskStatus = "Open" | "Done";

type DraftTask = {
  id: string;
  caseId: string;
  client: string;
  stage: Stage;
  title: string;
  requiresMemo: boolean;
  approvingRequired: boolean;
  paymentStatus: "PAID" | "UNPAID";
  poaUploaded: boolean;
  status: TaskStatus;
  due: string;
  submissionProofRequiredForNextSession: boolean;
  submissionProofUploaded: boolean;
};

const seed: DraftTask[] = [
  {
    id: "DT-2041",
    caseId: "CASE-2026-0103",
    client: "Al Noor Trading W.L.L.",
    stage: "First Instance",
    title: "Draft memorandum (hearing update)",
    requiresMemo: true,
    approvingRequired: true,
    paymentStatus: "PAID",
    poaUploaded: true,
    status: "Open",
    due: "2026-02-02",
    submissionProofRequiredForNextSession: true,
    submissionProofUploaded: false,
  },
  {
    id: "DT-2033",
    caseId: "CASE-2026-0091",
    client: "Doha Properties",
    stage: "Appeal",
    title: "Prepare draft notes for approval",
    requiresMemo: true,
    approvingRequired: true,
    paymentStatus: "PAID",
    poaUploaded: true,
    status: "Open",
    due: "2026-02-03",
    submissionProofRequiredForNextSession: false,
    submissionProofUploaded: true,
  },
  {
    id: "DT-2018",
    caseId: "CASE-2026-0060",
    client: "Private (Confidential)",
    stage: "Investigation",
    title: "Draft client update summary",
    requiresMemo: false,
    approvingRequired: false,
    paymentStatus: "PAID",
    poaUploaded: false,
    status: "Open",
    due: "2026-02-04",
    submissionProofRequiredForNextSession: true,
    submissionProofUploaded: true,
  },
];

function Pill({ tone, text, testId }: { tone: "primary" | "accent" | "neutral" | "danger"; text: string; testId: string }) {
  const cls =
    tone === "primary"
      ? "border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]"
      : tone === "accent"
        ? "border-[hsl(var(--accent)/0.25)] bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]"
        : tone === "danger"
          ? "border-[hsl(var(--destructive)/0.25)] bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--foreground)/0.04)] text-muted-foreground";

  return (
    <span data-testid={testId} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {text}
    </span>
  );
}

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

function DraftMemoModal({
  locale,
  task,
  onSubmit,
}: {
  locale: "en" | "ar";
  task: DraftTask;
  onSubmit: (payload: { memoText: string; attachments: string[] }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [memoText, setMemoText] = useState("");
  const [fileName, setFileName] = useState("");
  const [files, setFiles] = useState<string[]>([]);

  const isBlockedByPayment = task.paymentStatus !== "PAID";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setMemoText("");
          setFileName("");
          setFiles([]);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          data-testid={`button-draft-memo-${task.id}`}
          className="h-10 rounded-2xl"
          disabled={!task.requiresMemo || isBlockedByPayment || task.status !== "Open"}
        >
          <FileText className="mr-2 h-4 w-4" />
          {locale === "ar" ? "صياغة مذكرة" : "Draft memo"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[820px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-left">
            {locale === "ar" ? "صياغة مذكرة (للاِعتماد)" : "Draft memorandum (for approval)"}
          </DialogTitle>
        </DialogHeader>

        {isBlockedByPayment ? (
          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Lock className="mt-0.5 h-4 w-4" />
              <div>
                <div className="font-semibold text-foreground">{locale === "ar" ? "محظور" : "Blocked"}</div>
                <div className="mt-1">
                  {locale === "ar"
                    ? "لا يمكن متابعة صياغة هذه المذكرة قبل أن يصبح الدفع PAID."
                    : "You cannot proceed until payment is PAID."}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="rounded-2xl border bg-card/70 p-4">
              <div className="font-mono text-xs text-muted-foreground">{task.caseId}</div>
              <div className="mt-1 text-sm font-semibold">{task.client}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {locale === "ar" ? "المرحلة" : "Stage"}: {task.stage} · {locale === "ar" ? "المهمة" : "Task"}: {task.id}
              </div>
            </div>

            <div className="grid gap-2">
              <Label data-testid="label-memo-text">{locale === "ar" ? "نص المذكرة" : "Memorandum text"}</Label>
              <Textarea
                data-testid="textarea-memo-text"
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
                className="min-h-[220px] rounded-2xl"
                placeholder={locale === "ar" ? "اكتب مسودة المذكرة..." : "Write the memo draft..."}
              />
            </div>

            <div className="grid gap-2">
              <Label data-testid="label-attachments">{locale === "ar" ? "مرفقات" : "Attachments"}</Label>
              <div className="rounded-2xl border bg-card/60 p-4">
                <div className="text-xs text-muted-foreground">
                  {locale === "ar" ? "رفع تجريبي: اكتب اسم الملف ثم اضفه." : "Mock uploader: type a filename and add it."}
                </div>
                <div className="mt-3 flex gap-2">
                  <Input
                    data-testid="input-attachment"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="h-10 rounded-2xl"
                    placeholder={locale === "ar" ? "memo-draft.pdf" : "memo-draft.pdf"}
                  />
                  <Button
                    data-testid="button-add-attachment"
                    variant="secondary"
                    className="h-10 rounded-2xl"
                    onClick={() => {
                      const v = fileName.trim();
                      if (!v) return;
                      setFiles((f) => [...f, v]);
                      setFileName("");
                    }}
                  >
                    {locale === "ar" ? "إضافة" : "Add"}
                  </Button>
                </div>
                <div className="mt-3 grid gap-2">
                  {files.length === 0 ? (
                    <div data-testid="text-no-attachments" className="text-sm text-muted-foreground">
                      {locale === "ar" ? "لا توجد ملفات." : "No files added."}
                    </div>
                  ) : (
                    files.map((f, idx) => (
                      <div
                        key={`${f}-${idx}`}
                        data-testid={`row-attachment-${idx}`}
                        className="flex items-center justify-between rounded-xl border bg-card/70 px-3 py-2 text-sm"
                      >
                        <span className="truncate">{f}</span>
                        <button
                          data-testid={`button-remove-attachment-${idx}`}
                          className="rounded-lg p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          onClick={() => setFiles((all) => all.filter((_, i) => i !== idx))}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4" />
                <div>
                  <div className="font-semibold text-foreground">{locale === "ar" ? "قاعدة" : "Rule"}</div>
                  <div className="mt-1">
                    {locale === "ar"
                      ? "محامي الصياغة لا يوقّع. سيتم إرسال المسودة إلى محامي الاعتماد ثم الشريك المدير للتوقيع."
                      : "Drafting Lawyer does not sign. Draft goes to Approving Lawyer, then Managing Partner for signature."}
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
            data-testid="button-submit-draft"
            className="rounded-2xl"
            disabled={isBlockedByPayment || memoText.trim().length < 10}
            onClick={() => {
              onSubmit({ memoText: memoText.trim(), attachments: files });
              setOpen(false);
            }}
          >
            {locale === "ar" ? "إرسال للاعتماد" : "Send for approval"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DraftingLawyerPage() {
  const { locale, isDark } = useUiState();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<DraftTask[]>(seed);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => [x.caseId, x.client, x.stage, x.title, x.id].join(" ").toLowerCase().includes(q));
  }, [items, query]);

  function submitDraft(taskId: string) {
    setItems((all) => all.map((x) => (x.id === taskId ? { ...x, status: "Done" } : x)));
  }

  return (
    <div className={`app-bg min-h-screen ${locale === "ar" ? "dir-rtl" : ""} ${isDark ? "dark" : ""}`}>
      <div className="mx-auto max-w-[1240px] px-4 py-3 lg:px-6">
        <header className="sticky-blur sticky top-3 z-20 mb-5 mt-2 rounded-3xl border px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div data-testid="text-role-title" className="text-base font-semibold">
                  {locale === "ar" ? "لوحة محامي الصياغة" : "Drafting Lawyer Dashboard"}
                </div>
                <div data-testid="text-role-subtitle" className="mt-0.5 text-sm text-muted-foreground">
                  {locale === "ar"
                    ? "صياغة المذكرات لا تُوقع — تُرسل للاعتماد ثم توقيع الشريك المدير."
                    : "Draft memorandums; no signing. Send to approving lawyer, then Managing Partner."}
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
                    placeholder={locale === "ar" ? "بحث في القضايا والمذكرات..." : "Search cases & drafts..."}
                    className="h-10 w-[320px] rounded-2xl pl-9"
                  />
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
                <div data-testid="text-queue-title" className="text-sm font-semibold">
                  {locale === "ar" ? "قائمة الصياغة" : "Draft queue"}
                </div>
                <div data-testid="text-queue-desc" className="mt-1 text-sm text-muted-foreground">
                  {locale === "ar"
                    ? "المهام التي تتطلب مذكرة قبل الاعتماد والتوقيع."
                    : "Tasks that require a memo before approval and signature."}
                </div>
              </div>
              <Pill tone="neutral" text={locale === "ar" ? "Strict" : "Strict"} testId="badge-strict" />
            </div>

            <Separator className="my-5" />

            <div className="grid gap-3">
              {filtered.map((x) => {
                const blockedByPayment = x.paymentStatus !== "PAID";
                const blocked = blockedByPayment;

                return (
                  <div
                    key={x.id}
                    data-testid={`card-draft-${x.id}`}
                    className="rounded-3xl border bg-card/60 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div data-testid={`text-task-id-${x.id}`} className="font-mono text-xs text-muted-foreground">
                            {x.id}
                          </div>
                          <Pill
                            tone={x.paymentStatus === "PAID" ? "primary" : "danger"}
                            text={x.paymentStatus}
                            testId={`badge-payment-${x.id}`}
                          />
                          <Pill
                            tone={x.poaUploaded ? "primary" : "danger"}
                            text={x.poaUploaded ? (locale === "ar" ? "POA مرفوع" : "POA uploaded") : (locale === "ar" ? "POA مفقود" : "POA missing")}
                            testId={`badge-poa-${x.id}`}
                          />
                        </div>
                        <div data-testid={`text-task-title-${x.id}`} className="mt-2 text-sm font-semibold">
                          {x.title}
                        </div>
                        <div data-testid={`text-task-meta-${x.id}`} className="mt-1 text-sm text-muted-foreground">
                          <span className="text-foreground/70">Case:</span> {x.caseId} · <span className="text-foreground/70">Client:</span> {x.client}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          <span className="text-foreground/70">Stage:</span> {x.stage} · <span className="text-foreground/70">Due:</span> {x.due}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:items-end">
                        {blocked ? (
                          <div className="rounded-2xl border bg-muted/40 p-3 text-sm text-muted-foreground md:max-w-[280px]">
                            <div className="flex items-start gap-2">
                              <Lock className="mt-0.5 h-4 w-4" />
                              <div>
                                <div className="font-semibold text-foreground">{locale === "ar" ? "محظور" : "Blocked"}</div>
                                <div className="mt-1">
                                  {locale === "ar" ? "لا يمكن المتابعة حتى يصبح الدفع PAID." : "Cannot proceed until payment is PAID."}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <DraftMemoModal
                            locale={locale}
                            task={x}
                            onSubmit={() => {
                              submitDraft(x.id);
                            }}
                          />
                        )}

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              data-testid={`button-message-client-${x.id}`}
                              variant="secondary"
                              className="h-10 rounded-2xl"
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              {locale === "ar" ? "رسالة" : "Message"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[720px] rounded-3xl p-6">
                            <DialogHeader>
                              <DialogTitle className="text-left">
                                {locale === "ar" ? "رسالة للعميل" : "Message client"}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-3">
                              <div className="rounded-2xl border bg-card/70 p-4">
                                <div className="font-mono text-xs text-muted-foreground">{x.caseId}</div>
                                <div className="mt-1 text-sm font-semibold">{x.client}</div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                  {locale === "ar" ? "ملاحظة: واجهة فقط" : "Note: UI mock only"}
                                </div>
                              </div>
                              <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                                <div className="flex items-start gap-2">
                                  <ShieldCheck className="mt-0.5 h-4 w-4" />
                                  <div>
                                    <div className="font-semibold text-foreground">{locale === "ar" ? "قاعدة" : "Rule"}</div>
                                    <div className="mt-1">
                                      {locale === "ar"
                                        ? "يتم التواصل مع العميل دون مشاركة مستندات حساسة. لا توقيع هنا."
                                        : "Client comms only. No sensitive attachments shared. No signing here."}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label data-testid={`label-message-${x.id}`}>{locale === "ar" ? "نص الرسالة" : "Message"}</Label>
                                <Textarea
                                  data-testid={`textarea-message-${x.id}`}
                                  className="min-h-[140px] rounded-2xl"
                                  placeholder={locale === "ar" ? "اكتب الرسالة..." : "Write message..."}
                                />
                              </div>
                            </div>
                            <DialogFooter className="mt-4">
                              <Button data-testid={`button-close-message-${x.id}`} variant="secondary" className="rounded-2xl">
                                {ts(locale, "modalCancel")}
                              </Button>
                              <Button data-testid={`button-send-message-${x.id}`} className="rounded-2xl">
                                {locale === "ar" ? "إرسال" : "Send"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid gap-2 md:grid-cols-3">
                      <div data-testid={`info-approval-${x.id}`} className="rounded-2xl border bg-card/70 p-3 text-sm">
                        <div className="text-xs font-semibold text-muted-foreground">{locale === "ar" ? "الاعتماد" : "Approval"}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {x.approvingRequired
                              ? locale === "ar"
                                ? "مطلوب (محامي اعتماد)"
                                : "Required (Approving Lawyer)"
                              : locale === "ar"
                                ? "غير مطلوب"
                                : "Not required"}
                          </span>
                        </div>
                      </div>
                      <div data-testid={`info-session-${x.id}`} className="rounded-2xl border bg-card/70 p-3 text-sm">
                        <div className="text-xs font-semibold text-muted-foreground">{locale === "ar" ? "الجلسة" : "Session"}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <Gavel className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {x.submissionProofRequiredForNextSession
                              ? locale === "ar"
                                ? "يتطلب إثبات إيداع"
                                : "Submission proof required"
                              : locale === "ar"
                                ? "لا يتطلب إيداع"
                                : "No submission required"}
                          </span>
                        </div>
                      </div>
                      <div data-testid={`info-sign-${x.id}`} className="rounded-2xl border bg-card/70 p-3 text-sm">
                        <div className="text-xs font-semibold text-muted-foreground">{locale === "ar" ? "التوقيع" : "Signature"}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{locale === "ar" ? "الشريك المدير فقط" : "Managing Partner only"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="card-surface rounded-3xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{locale === "ar" ? "قواعد النظام" : "System rules"}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {locale === "ar"
                      ? "هذه القيود تنطبق على جميع الأدوار."
                      : "These gates apply across all roles."}
                  </div>
                </div>
                <Badge data-testid="badge-rules" variant="secondary" className="rounded-full">
                  Strict
                </Badge>
              </div>

              <div className="mt-4 grid gap-3">
                <div data-testid="rule-payment" className="rounded-2xl border bg-card/70 p-4 text-sm">
                  <div className="font-semibold">{locale === "ar" ? "الدفع قبل فتح Case" : "Payment before Case"}</div>
                  <div className="mt-1 text-muted-foreground">
                    {locale === "ar"
                      ? "أي إجراء يتطلب فتح/تفعيل Case يتم حظره إذا لم يكن الدفع PAID."
                      : "Any Case-opening step is blocked until payment is PAID."}
                  </div>
                </div>
                <div data-testid="rule-sign" className="rounded-2xl border bg-card/70 p-4 text-sm">
                  <div className="font-semibold">{locale === "ar" ? "التوقيع" : "Signature"}</div>
                  <div className="mt-1 text-muted-foreground">
                    {locale === "ar"
                      ? "لا يمكن لأي محامٍ توقيع المذكرات — التوقيع للشريك المدير فقط."
                      : "Lawyers never sign memorandums; Managing Partner only."}
                  </div>
                </div>
                <div data-testid="rule-submission" className="rounded-2xl border bg-card/70 p-4 text-sm">
                  <div className="font-semibold">{locale === "ar" ? "الإيداع قبل Session" : "Submission before Session"}</div>
                  <div className="mt-1 text-muted-foreground">
                    {locale === "ar"
                      ? "لا توجد Session بدون إثبات إيداع رسمي عند الحاجة."
                      : "No Session without official submission proof when required."}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="card-surface rounded-3xl p-5">
              <div className="text-sm font-semibold">{locale === "ar" ? "سجل التدقيق" : "Audit (preview)"}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {locale === "ar"
                  ? "كل إجراء سيظهر هنا (واجهة فقط)."
                  : "Every action will be logged here (UI mock)."}
              </div>
              <div className="mt-4 space-y-2">
                <div data-testid="audit-row-1" className="rounded-2xl border bg-card/70 p-3 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">21:36</span> · {locale === "ar" ? "تم إنشاء مهمة صياغة" : "Draft task created"} · DT-2041
                </div>
                <div data-testid="audit-row-2" className="rounded-2xl border bg-card/70 p-3 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">21:40</span> · {locale === "ar" ? "تم إرسال المسودة للاعتماد" : "Draft sent for approval"}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
