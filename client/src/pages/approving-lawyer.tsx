import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  BadgeCheck,
  Bell,
  CheckCircle2,
  FileText,
  Globe,
  Lock,
  Search,
  ShieldCheck,
  Stamp,
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
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { ts } from "@/lib/secretary-i18n";
import { useUiState } from "@/lib/ui-state";

type Stage =
  | "Prosecution"
  | "Investigation"
  | "First Instance"
  | "Appeal"
  | "Cassation (Tamyeez)"
  | "Enforcement";

type ApprovalItem = {
  id: string;
  caseId: string;
  client: string;
  stage: Stage;
  paymentStatus: "PAID" | "UNPAID";
  poaUploaded: boolean;
  draftProvided: boolean;
  draftFiles: string[];
  decision: "Approve" | "Request changes" | "Reject" | null;
  notes?: string;
  status: "Pending" | "Completed";
};

const seed: ApprovalItem[] = [
  {
    id: "APPR-7702",
    caseId: "CASE-2026-0103",
    client: "Al Noor Trading W.L.L.",
    stage: "First Instance",
    paymentStatus: "PAID",
    poaUploaded: true,
    draftProvided: true,
    draftFiles: ["memo-draft-CASE-2026-0103.pdf", "attachments-index.txt"],
    decision: null,
    status: "Pending",
  },
  {
    id: "APPR-7679",
    caseId: "CASE-2026-0060",
    client: "Private (Confidential)",
    stage: "Investigation",
    paymentStatus: "PAID",
    poaUploaded: false,
    draftProvided: true,
    draftFiles: ["draft-notes-CASE-2026-0060.docx"],
    decision: null,
    status: "Pending",
  },
  {
    id: "APPR-7601",
    caseId: "CASE-2026-0091",
    client: "Doha Properties",
    stage: "Appeal",
    paymentStatus: "UNPAID",
    poaUploaded: true,
    draftProvided: false,
    draftFiles: [],
    decision: null,
    status: "Pending",
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

function StatusPill({ text, tone, testId }: { text: string; tone: "primary" | "accent" | "danger" | "neutral"; testId: string }) {
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

function ApprovalModal({
  locale,
  item,
  onDecide,
}: {
  locale: "en" | "ar";
  item: ApprovalItem;
  onDecide: (decision: ApprovalItem["decision"], notes?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [decision, setDecision] = useState<ApprovalItem["decision"]>("Approve");
  const [notes, setNotes] = useState("");

  const blocked = item.paymentStatus !== "PAID" || !item.draftProvided;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setDecision("Approve");
          setNotes("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          data-testid={`button-open-approve-${item.id}`}
          className="h-10 rounded-2xl"
          disabled={item.status !== "Pending"}
        >
          <BadgeCheck className="mr-2 h-4 w-4" />
          {locale === "ar" ? "مراجعة" : "Review"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[820px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-left">{locale === "ar" ? "مراجعة واعتماد" : "Review & approve"}</DialogTitle>
        </DialogHeader>

        {blocked ? (
          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Lock className="mt-0.5 h-4 w-4" />
              <div>
                <div className="font-semibold text-foreground">{locale === "ar" ? "محظور" : "Blocked"}</div>
                <div className="mt-1">
                  {item.paymentStatus !== "PAID"
                    ? locale === "ar"
                      ? "لا يمكن اعتماد أي مستند قبل أن يصبح الدفع PAID."
                      : "Approval is blocked until payment is PAID."
                    : locale === "ar"
                      ? "لا يوجد مسودة واردة من محامي الصياغة."
                      : "No draft received from Drafting Lawyer."}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="rounded-2xl border bg-card/70 p-4">
              <div className="font-mono text-xs text-muted-foreground">{item.caseId}</div>
              <div className="mt-1 text-sm font-semibold">{item.client}</div>
              <div className="mt-1 text-sm text-muted-foreground">Stage: {item.stage} · {item.id}</div>
            </div>

            <div className="rounded-2xl border bg-card/60 p-4">
              <div className="text-sm font-semibold">{locale === "ar" ? "ملفات المسودة" : "Draft files"}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {locale === "ar" ? "عرض الملفات المرفوعة من محامي الصياغة (واجهة)." : "Files uploaded by Drafting Lawyer (UI mock)."}
              </div>
              <div className="mt-3 grid gap-2">
                {item.draftFiles.length === 0 ? (
                  <div data-testid="text-no-draft-files" className="text-sm text-muted-foreground">
                    {locale === "ar" ? "لا توجد ملفات." : "No files."}
                  </div>
                ) : (
                  item.draftFiles.map((f, idx) => (
                    <div
                      key={`${f}-${idx}`}
                      data-testid={`row-draft-file-${idx}`}
                      className="flex items-center justify-between rounded-xl border bg-card/70 px-3 py-2 text-sm"
                    >
                      <span className="truncate">{f}</span>
                      <Button
                        data-testid={`button-view-draft-file-${idx}`}
                        variant="secondary"
                        className="h-8 rounded-xl px-3"
                      >
                        {locale === "ar" ? "عرض" : "View"}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label data-testid="label-decision">{locale === "ar" ? "القرار" : "Decision"}</Label>
              <Select value={decision ?? "Approve"} onValueChange={(v) => setDecision(v as any)}>
                <SelectTrigger data-testid="select-decision" className="h-11 rounded-2xl">
                  <div className="flex items-center justify-between gap-3">
                    <span>{decision === "Approve" ? (locale === "ar" ? "اعتماد" : "Approve") : decision === "Request changes" ? (locale === "ar" ? "طلب تعديل" : "Request changes") : (locale === "ar" ? "رفض" : "Reject")}</span>
                    <span className="sr-only">decision</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approve">{locale === "ar" ? "اعتماد" : "Approve"}</SelectItem>
                  <SelectItem value="Request changes">{locale === "ar" ? "طلب تعديل" : "Request changes"}</SelectItem>
                  <SelectItem value="Reject">{locale === "ar" ? "رفض" : "Reject"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label data-testid="label-notes">{locale === "ar" ? "ملاحظات" : "Notes"}</Label>
              <Textarea
                data-testid="textarea-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[140px] rounded-2xl"
                placeholder={locale === "ar" ? "ملاحظات للمحامي..." : "Notes for the lawyer..."}
              />
            </div>

            <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4" />
                <div>
                  <div className="font-semibold text-foreground">{locale === "ar" ? "قاعدة" : "Rule"}</div>
                  <div className="mt-1">
                    {locale === "ar"
                      ? "بعد الاعتماد، تنتقل المذكرة إلى الشريك المدير للتوقيع (لا توقيع للمحامين)."
                      : "After approval, memorandum goes to Managing Partner for signature (lawyers do not sign)."}
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
            data-testid="button-save-approval"
            className="rounded-2xl"
            disabled={blocked}
            onClick={() => {
              onDecide(decision, notes.trim() || undefined);
              setOpen(false);
            }}
          >
            {locale === "ar" ? "حفظ" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ApprovingLawyerPage() {
  const { locale, isDark } = useUiState();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ApprovalItem[]>(seed);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => [x.caseId, x.client, x.stage, x.id].join(" ").toLowerCase().includes(q));
  }, [items, query]);

  function decide(id: string, decision: ApprovalItem["decision"], notes?: string) {
    setItems((all) =>
      all.map((x) => (x.id === id ? { ...x, decision, notes, status: "Completed" } : x))
    );
  }

  return (
    <div className={`app-bg min-h-screen ${locale === "ar" ? "dir-rtl" : ""} ${isDark ? "dark" : ""}`}>
      <div className="mx-auto max-w-[1240px] px-4 py-3 lg:px-6">
        <header className="sticky-blur sticky top-3 z-20 mb-5 mt-2 rounded-3xl border px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent/10 text-accent">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <div data-testid="text-role-title" className="text-base font-semibold">
                  {locale === "ar" ? "لوحة محامي الاعتماد" : "Approving Lawyer Dashboard"}
                </div>
                <div data-testid="text-role-subtitle" className="mt-0.5 text-sm text-muted-foreground">
                  {locale === "ar"
                    ? "المراجعة والاعتماد قبل توقيع الشريك المدير."
                    : "Review, approve, request changes. Partner signs only after approval."}
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
                    placeholder={locale === "ar" ? "بحث..." : "Search approvals..."}
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
                  {locale === "ar" ? "قائمة الاعتماد" : "Approval queue"}
                </div>
                <div data-testid="text-queue-desc" className="mt-1 text-sm text-muted-foreground">
                  {locale === "ar"
                    ? "اعتماد المذكرات قبل التوقيع والإيداع."
                    : "Approve memorandums before signature and submission."}
                </div>
              </div>
              <Badge data-testid="badge-pending" variant="secondary" className="rounded-full">
                {filtered.filter((x) => x.status === "Pending").length} {locale === "ar" ? "قيد" : "pending"}
              </Badge>
            </div>

            <Separator className="my-5" />

            <div className="grid gap-3">
              {filtered.map((x) => {
                const blockedByPayment = x.paymentStatus !== "PAID";
                const blockedByDraft = !x.draftProvided;

                return (
                  <div key={x.id} data-testid={`card-approval-${x.id}`} className="rounded-3xl border bg-card/60 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div data-testid={`text-approval-id-${x.id}`} className="font-mono text-xs text-muted-foreground">
                            {x.id}
                          </div>
                          <StatusPill
                            text={x.status === "Pending" ? (locale === "ar" ? "قيد المراجعة" : "Pending") : locale === "ar" ? "مكتمل" : "Completed"}
                            tone={x.status === "Pending" ? "accent" : "neutral"}
                            testId={`badge-status-${x.id}`}
                          />
                          <StatusPill
                            text={x.paymentStatus}
                            tone={x.paymentStatus === "PAID" ? "primary" : "danger"}
                            testId={`badge-payment-${x.id}`}
                          />
                          <StatusPill
                            text={x.draftProvided ? (locale === "ar" ? "مسودة موجودة" : "Draft received") : locale === "ar" ? "لا توجد مسودة" : "No draft"}
                            tone={x.draftProvided ? "primary" : "danger"}
                            testId={`badge-draft-${x.id}`}
                          />
                        </div>
                        <div data-testid={`text-case-${x.id}`} className="mt-2 text-sm font-semibold">
                          {x.caseId} — {x.client}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">Stage: {x.stage}</div>
                      </div>

                      <div className="flex flex-col gap-2 md:items-end">
                        <ApprovalModal
                          locale={locale}
                          item={x}
                          onDecide={(decision, notes) => decide(x.id, decision, notes)}
                        />

                        {(blockedByPayment || blockedByDraft) && x.status === "Pending" ? (
                          <div className="rounded-2xl border bg-muted/40 p-3 text-sm text-muted-foreground md:max-w-[280px]">
                            <div className="flex items-start gap-2">
                              <Lock className="mt-0.5 h-4 w-4" />
                              <div>
                                <div className="font-semibold text-foreground">{locale === "ar" ? "محظور" : "Blocked"}</div>
                                <div className="mt-1">
                                  {blockedByPayment
                                    ? locale === "ar"
                                      ? "الدفع ليس PAID."
                                      : "Payment is not PAID."
                                    : locale === "ar"
                                      ? "المسودة غير متوفرة."
                                      : "Draft not available."}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {x.status === "Completed" ? (
                      <>
                        <Separator className="my-4" />
                        <div className="grid gap-3 md:grid-cols-3">
                          <div data-testid={`info-decision-${x.id}`} className="rounded-2xl border bg-card/70 p-3 text-sm">
                            <div className="text-xs font-semibold text-muted-foreground">{locale === "ar" ? "قرار" : "Decision"}</div>
                            <div className="mt-1 flex items-center gap-2">
                              <Stamp className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {x.decision === "Approve"
                                  ? locale === "ar"
                                    ? "اعتماد"
                                    : "Approved"
                                  : x.decision === "Request changes"
                                    ? locale === "ar"
                                      ? "طلب تعديل"
                                      : "Changes requested"
                                    : locale === "ar"
                                      ? "رفض"
                                      : "Rejected"}
                              </span>
                            </div>
                          </div>

                          <div data-testid={`info-sign-${x.id}`} className="rounded-2xl border bg-card/70 p-3 text-sm">
                            <div className="text-xs font-semibold text-muted-foreground">{locale === "ar" ? "التوقيع" : "Signature"}</div>
                            <div className="mt-1 flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                              <span>{locale === "ar" ? "بانتظار توقيع الشريك المدير" : "Awaiting Managing Partner signature"}</span>
                            </div>
                          </div>

                          <div data-testid={`info-submit-${x.id}`} className="rounded-2xl border bg-card/70 p-3 text-sm">
                            <div className="text-xs font-semibold text-muted-foreground">{locale === "ar" ? "الإيداع" : "Submission"}</div>
                            <div className="mt-1 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{locale === "ar" ? "سيُجهز بعد التوقيع" : "Prepared after signature"}</span>
                            </div>
                          </div>
                        </div>

                        {x.notes ? (
                          <div data-testid={`text-notes-${x.id}`} className="mt-3 rounded-2xl border bg-card/70 p-3 text-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-muted-foreground">{locale === "ar" ? "ملاحظات" : "Notes"}</div>
                                <div className="mt-1">{x.notes}</div>
                              </div>
                              <button data-testid={`button-clear-notes-${x.id}`} className="rounded-xl p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground" onClick={() => setItems((all) => all.map((it) => (it.id === x.id ? { ...it, notes: undefined } : it)))}>
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="card-surface rounded-3xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{locale === "ar" ? "قواعد" : "Rules"}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {locale === "ar" ? "تأكد أن كل قرار يطابق قيود قطر." : "Decisions must respect Qatar workflow gates."}
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
                    {locale === "ar" ? "لا اعتماد قبل الدفع PAID." : "No approval before payment is PAID."}
                  </div>
                </div>
                <div data-testid="rule-sign" className="rounded-2xl border bg-card/70 p-4 text-sm">
                  <div className="font-semibold">{locale === "ar" ? "التوقيع" : "Signature"}</div>
                  <div className="mt-1 text-muted-foreground">
                    {locale === "ar" ? "الشريك المدير فقط يوقع." : "Managing Partner signs only."}
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
                  <span className="font-mono text-xs text-muted-foreground">21:44</span> · {locale === "ar" ? "تم استلام المسودة" : "Draft received"} · APPR-7702
                </div>
                <div data-testid="audit-2" className="rounded-2xl border bg-card/70 p-3 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">21:52</span> · {locale === "ar" ? "بانتظار توقيع الشريك المدير" : "Awaiting Partner signature"}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
