import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Bell,
  FileText,
  Globe,
  Lock,
  Search,
  ShieldCheck,
  Upload,
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

import { ts } from "@/lib/secretary-i18n";
import { useUiState } from "@/lib/ui-state";

type PortalItem = {
  id: string;
  caseId: string;
  client: string;
  paymentStatus: "PAID" | "UNPAID";
  signedByPartner: boolean;
  portalSubmissionRequired: boolean;
  submitted: boolean;
  submissionRef?: string;
  submissionDate?: string;
  proofFiles: string[];
};

const seed: PortalItem[] = [
  {
    id: "PORT-9901",
    caseId: "CASE-2026-0103",
    client: "Al Noor Trading W.L.L.",
    paymentStatus: "PAID",
    signedByPartner: true,
    portalSubmissionRequired: true,
    submitted: false,
    proofFiles: [],
  },
  {
    id: "PORT-9832",
    caseId: "CASE-2026-0091",
    client: "Doha Properties",
    paymentStatus: "PAID",
    signedByPartner: false,
    portalSubmissionRequired: true,
    submitted: false,
    proofFiles: [],
  },
  {
    id: "PORT-9700",
    caseId: "CASE-2026-0060",
    client: "Private (Confidential)",
    paymentStatus: "UNPAID",
    signedByPartner: true,
    portalSubmissionRequired: true,
    submitted: false,
    proofFiles: [],
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

function UploadProofModal({
  locale,
  item,
  onUpload,
}: {
  locale: "en" | "ar";
  item: PortalItem;
  onUpload: (payload: { submissionRef: string; submissionDate: string; proofFiles: string[] }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [ref, setRef] = useState("");
  const [date, setDate] = useState("");
  const [fileName, setFileName] = useState("");
  const [files, setFiles] = useState<string[]>([]);

  const blocked = item.paymentStatus !== "PAID" || !item.signedByPartner;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setRef("");
          setDate("");
          setFileName("");
          setFiles([]);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          data-testid={`button-upload-proof-${item.id}`}
          className="h-10 rounded-2xl"
          disabled={item.submitted}
        >
          <Upload className="mr-2 h-4 w-4" />
          {locale === "ar" ? "رفع إثبات الإيداع" : "Upload proof"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[820px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-left">{locale === "ar" ? "إثبات الإيداع (Portal)" : "Submission proof (Portal)"}</DialogTitle>
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
                      ? "لا يمكن الإيداع قبل الدفع PAID."
                      : "Cannot submit before payment is PAID."
                    : locale === "ar"
                      ? "يتطلب توقيع الشريك المدير قبل الإيداع."
                      : "Requires Managing Partner signature before submission."}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="rounded-2xl border bg-card/70 p-4">
              <div className="font-mono text-xs text-muted-foreground">{item.caseId}</div>
              <div className="mt-1 text-sm font-semibold">{item.client}</div>
              <div className="mt-1 text-sm text-muted-foreground">{item.id}</div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label data-testid="label-ref">{locale === "ar" ? "رقم المرجع" : "Reference number"}</Label>
                <Input data-testid="input-ref" value={ref} onChange={(e) => setRef(e.target.value)} className="h-11 rounded-2xl" placeholder="REF-123" />
              </div>
              <div className="grid gap-2">
                <Label data-testid="label-date">{locale === "ar" ? "تاريخ الإيداع" : "Submission date"}</Label>
                <Input data-testid="input-date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-2xl" placeholder="2026-02-03" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label data-testid="label-files">{locale === "ar" ? "ملفات الإثبات (PDF)" : "Proof files (PDF)"}</Label>
              <div className="rounded-2xl border bg-card/60 p-4">
                <div className="text-xs text-muted-foreground">
                  {locale === "ar" ? "رفع تجريبي: اكتب اسم الملف ثم اضفه." : "Mock uploader: type a filename and add it."}
                </div>
                <div className="mt-3 flex gap-2">
                  <Input data-testid="input-file" value={fileName} onChange={(e) => setFileName(e.target.value)} className="h-10 rounded-2xl" placeholder="submission-proof.pdf" />
                  <Button
                    data-testid="button-add-file"
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
                    <div data-testid="text-no-files" className="text-sm text-muted-foreground">
                      {locale === "ar" ? "لا توجد ملفات." : "No files added."}
                    </div>
                  ) : (
                    files.map((f, idx) => (
                      <div key={`${f}-${idx}`} data-testid={`row-file-${idx}`} className="flex items-center justify-between rounded-xl border bg-card/70 px-3 py-2 text-sm">
                        <span className="truncate">{f}</span>
                        <button data-testid={`button-remove-file-${idx}`} className="rounded-lg p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground" onClick={() => setFiles((all) => all.filter((_, i) => i !== idx))}>
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
                    {locale === "ar" ? "لا توجد Session بدون إثبات إيداع رسمي عند الحاجة." : "No Session without official submission proof when required."}
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
            disabled={blocked || ref.trim().length < 3 || date.trim().length < 8 || files.length === 0}
            onClick={() => {
              onUpload({ submissionRef: ref.trim(), submissionDate: date.trim(), proofFiles: files });
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

export default function LegalSecretaryPage() {
  const { locale, isDark } = useUiState();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PortalItem[]>(seed);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => [x.caseId, x.client, x.id].join(" ").toLowerCase().includes(q));
  }, [items, query]);

  function upload(id: string, payload: { submissionRef: string; submissionDate: string; proofFiles: string[] }) {
    setItems((all) =>
      all.map((x) =>
        x.id === id
          ? {
              ...x,
              submitted: true,
              submissionRef: payload.submissionRef,
              submissionDate: payload.submissionDate,
              proofFiles: payload.proofFiles,
            }
          : x
      )
    );
  }

  return (
    <div className={`app-bg min-h-screen ${locale === "ar" ? "dir-rtl" : ""} ${isDark ? "dark" : ""}`}>
      <div className="mx-auto max-w-[1240px] px-4 py-3 lg:px-6">
        <header className="sticky-blur sticky top-3 z-20 mb-5 mt-2 rounded-3xl border px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent/10 text-accent">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div data-testid="text-role-title" className="text-base font-semibold">
                  {locale === "ar" ? "لوحة السكرتير القانوني" : "Legal Secretary Dashboard"}
                </div>
                <div data-testid="text-role-subtitle" className="mt-0.5 text-sm text-muted-foreground">
                  {locale === "ar"
                    ? "رفع الإيداعات عبر Portal وإرفاق إثبات الإيداع لفتح Session (بعد التوقيع)."
                    : "Submit via the Portal and upload submission proof to unlock Sessions (after signature)."}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 md:flex">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input data-testid="input-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={locale === "ar" ? "بحث..." : "Search portal queue..."} className="h-10 w-[320px] rounded-2xl pl-9" />
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
                  {locale === "ar" ? "قائمة Portal" : "Portal queue"}
                </div>
                <div data-testid="text-queue-desc" className="mt-1 text-sm text-muted-foreground">
                  {locale === "ar" ? "الرفع الرسمي وإثباته." : "Official submission and proof."}
                </div>
              </div>
              <Badge data-testid="badge-pending" variant="secondary" className="rounded-full">
                {filtered.filter((x) => !x.submitted).length} {locale === "ar" ? "غير مُودع" : "unsent"}
              </Badge>
            </div>

            <Separator className="my-5" />

            <div className="grid gap-3">
              {filtered.map((x) => {
                const blocked = x.paymentStatus !== "PAID" || !x.signedByPartner;

                return (
                  <div key={x.id} data-testid={`card-portal-${x.id}`} className="rounded-3xl border bg-card/60 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div data-testid={`text-portal-id-${x.id}`} className="font-mono text-xs text-muted-foreground">
                            {x.id}
                          </div>
                          <Badge data-testid={`badge-payment-${x.id}`} variant="secondary" className="rounded-full">
                            {x.paymentStatus}
                          </Badge>
                          <Badge data-testid={`badge-signed-${x.id}`} variant="secondary" className="rounded-full">
                            {x.signedByPartner ? (locale === "ar" ? "موقّع" : "Signed") : locale === "ar" ? "غير موقّع" : "Not signed"}
                          </Badge>
                          <Badge data-testid={`badge-submitted-${x.id}`} variant="secondary" className="rounded-full">
                            {x.submitted ? (locale === "ar" ? "تم الإيداع" : "Submitted") : locale === "ar" ? "غير مُودع" : "Not submitted"}
                          </Badge>
                        </div>
                        <div data-testid={`text-case-${x.id}`} className="mt-2 text-sm font-semibold">
                          {x.caseId} — {x.client}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:items-end">
                        <UploadProofModal locale={locale} item={x} onUpload={(payload) => upload(x.id, payload)} />

                        {blocked && !x.submitted ? (
                          <div className="rounded-2xl border bg-muted/40 p-3 text-sm text-muted-foreground md:max-w-[280px]">
                            <div className="flex items-start gap-2">
                              <Lock className="mt-0.5 h-4 w-4" />
                              <div>
                                <div className="font-semibold text-foreground">{locale === "ar" ? "محظور" : "Blocked"}</div>
                                <div className="mt-1">
                                  {locale === "ar" ? "يتطلب دفع PAID وتوقيع الشريك المدير." : "Requires PAID payment and Partner signature."}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {x.submitted ? (
                      <>
                        <Separator className="my-4" />
                        <div data-testid={`text-proof-${x.id}`} className="rounded-2xl border bg-card/70 p-3 text-sm">
                          <div className="text-xs font-semibold text-muted-foreground">{locale === "ar" ? "الإثبات" : "Proof"}</div>
                          <div className="mt-1">
                            <span className="text-foreground/70">{locale === "ar" ? "مرجع" : "Ref"}:</span> {x.submissionRef} · <span className="text-foreground/70">{locale === "ar" ? "تاريخ" : "Date"}:</span> {x.submissionDate}
                          </div>
                          <div className="mt-2 text-muted-foreground">
                            <span className="text-foreground/70">{locale === "ar" ? "ملفات" : "Files"}:</span> {x.proofFiles.join(", ")}
                          </div>
                        </div>
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
                    {locale === "ar" ? "Portal بعد التوقيع." : "Portal submission happens after signature."}
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
                    {locale === "ar" ? "لا إيداع إذا لم يكن الدفع PAID." : "No submission if payment is not PAID."}
                  </div>
                </div>
                <div data-testid="rule-sign" className="rounded-2xl border bg-card/70 p-4 text-sm">
                  <div className="font-semibold">{locale === "ar" ? "التوقيع" : "Signature"}</div>
                  <div className="mt-1 text-muted-foreground">
                    {locale === "ar" ? "يتطلب توقيع الشريك المدير." : "Requires Managing Partner signature."}
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
                  <span className="font-mono text-xs text-muted-foreground">22:16</span> · {locale === "ar" ? "جاهز للإيداع" : "Ready for submission"} · PORT-9901
                </div>
                <div data-testid="audit-2" className="rounded-2xl border bg-card/70 p-3 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">22:19</span> · {locale === "ar" ? "تم رفع إثبات" : "Proof uploaded"}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
