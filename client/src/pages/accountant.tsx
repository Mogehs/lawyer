import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Bell,
  CreditCard,
  Globe,
  Lock,
  Receipt,
  Search,
  ShieldCheck,
  Wallet,
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

type PaymentStatus = "PAID" | "UNPAID";

type PaymentRow = {
  id: string;
  invoiceId?: string;
  client: string;
  amountQar: number;
  method: "Cash" | "Bank transfer" | "Card" | "Cheque";
  status: PaymentStatus;
  linkedCaseId?: string;
  createdAt: string;
};

const seed: PaymentRow[] = [
  {
    id: "PAY-7821",
    invoiceId: "INV-2026-0191",
    client: "Al Noor Trading W.L.L.",
    amountQar: 12000,
    method: "Bank transfer",
    status: "PAID",
    linkedCaseId: "CASE-2026-0103",
    createdAt: "2026-01-30 09:20",
  },
  {
    id: "PAY-7815",
    invoiceId: "INV-2026-0188",
    client: "Doha Properties",
    amountQar: 5000,
    method: "Cash",
    status: "UNPAID",
    createdAt: "2026-01-30 10:05",
  },
];

function moneyQar(n: number) {
  return `QAR ${n.toLocaleString()}`;
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

function MarkPaidModal({
  locale,
  item,
  onMark,
}: {
  locale: "en" | "ar";
  item: PaymentRow;
  onMark: (payload: { receiptNo: string; notes?: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [receiptNo, setReceiptNo] = useState("");
  const [notes, setNotes] = useState("");

  const blocked = item.status === "PAID";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setReceiptNo("");
          setNotes("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          data-testid={`button-open-markpaid-${item.id}`}
          className="h-10 rounded-2xl"
          disabled={blocked}
        >
          <Receipt className="mr-2 h-4 w-4" />
          {locale === "ar" ? "تعيين كمدفوع" : "Mark paid"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[720px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-left">{locale === "ar" ? "تأكيد الدفع" : "Confirm payment"}</DialogTitle>
        </DialogHeader>

        {blocked ? (
          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
            {locale === "ar" ? "هذا الدفع مُسجل كـ PAID بالفعل." : "This payment is already PAID."}
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="rounded-2xl border bg-card/70 p-4">
              <div className="font-mono text-xs text-muted-foreground">{item.id}</div>
              <div className="mt-1 text-sm font-semibold">{item.client}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {moneyQar(item.amountQar)} · {item.method}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label data-testid="label-receipt">{locale === "ar" ? "رقم الإيصال" : "Receipt number"}</Label>
                <Input
                  data-testid="input-receipt"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  className="h-11 rounded-2xl"
                  placeholder="RCPT-2026-001"
                />
              </div>
              <div className="grid gap-2">
                <Label data-testid="label-notes">{locale === "ar" ? "ملاحظات" : "Notes"}</Label>
                <Input data-testid="input-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="h-11 rounded-2xl" placeholder={locale === "ar" ? "اختياري" : "Optional"} />
              </div>
            </div>

            <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4" />
                <div>
                  <div className="font-semibold text-foreground">{locale === "ar" ? "قاعدة" : "Rule"}</div>
                  <div className="mt-1">
                    {locale === "ar" ? "فتح Case محظور حتى يصبح الدفع PAID." : "Opening a Case is blocked until payment is PAID."}
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
            disabled={blocked || receiptNo.trim().length < 3}
            onClick={() => {
              onMark({ receiptNo: receiptNo.trim(), notes: notes.trim() || undefined });
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

export default function AccountantPage() {
  const { locale, isDark } = useUiState();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PaymentRow[]>(seed);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => [x.id, x.invoiceId ?? "", x.client, x.status, x.method].join(" ").toLowerCase().includes(q));
  }, [items, query]);

  function markPaid(id: string) {
    setItems((all) => all.map((x) => (x.id === id ? { ...x, status: "PAID" } : x)));
  }

  return (
    <div className={`app-bg min-h-screen ${locale === "ar" ? "dir-rtl" : ""} ${isDark ? "dark" : ""}`}>
      <div className="mx-auto max-w-[1240px] px-4 py-3 lg:px-6">
        <header className="sticky-blur sticky top-3 z-20 mb-5 mt-2 rounded-3xl border px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <div data-testid="text-role-title" className="text-base font-semibold">
                  {locale === "ar" ? "لوحة المحاسب" : "Accountant Dashboard"}
                </div>
                <div data-testid="text-role-subtitle" className="mt-0.5 text-sm text-muted-foreground">
                  {locale === "ar"
                    ? "تسجيل الدفعات وتأكيد PAID (للسماح بفتح Case)."
                    : "Record payments and confirm PAID (to unlock Case opening)."}
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
                    placeholder={locale === "ar" ? "بحث في المدفوعات..." : "Search payments..."}
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
                <div data-testid="text-payments-title" className="text-sm font-semibold">
                  {locale === "ar" ? "المدفوعات" : "Payments"}
                </div>
                <div data-testid="text-payments-desc" className="mt-1 text-sm text-muted-foreground">
                  {locale === "ar" ? "كل شيء يبدأ بالدفع." : "Everything starts with payment."}
                </div>
              </div>
              <Badge data-testid="badge-unpaid" variant="secondary" className="rounded-full">
                {items.filter((x) => x.status === "UNPAID").length} {locale === "ar" ? "غير مدفوع" : "unpaid"}
              </Badge>
            </div>

            <Separator className="my-5" />

            <div className="grid gap-3">
              {filtered.map((p) => {
                const isUnpaid = p.status !== "PAID";

                return (
                  <div key={p.id} data-testid={`row-payment-${p.id}`} className="rounded-3xl border bg-card/60 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div data-testid={`text-payment-id-${p.id}`} className="font-mono text-xs text-muted-foreground">
                            {p.id}
                          </div>
                          <Badge data-testid={`badge-status-${p.id}`} variant="secondary" className="rounded-full">
                            {p.status}
                          </Badge>
                          <Badge data-testid={`badge-method-${p.id}`} variant="secondary" className="rounded-full">
                            {p.method}
                          </Badge>
                        </div>
                        <div data-testid={`text-payment-client-${p.id}`} className="mt-2 text-sm font-semibold">
                          {p.client}
                        </div>
                        <div data-testid={`text-payment-meta-${p.id}`} className="mt-1 text-sm text-muted-foreground">
                          {p.invoiceId ? `Invoice: ${p.invoiceId}` : "Invoice: —"} · {moneyQar(p.amountQar)}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">{p.createdAt}</div>
                      </div>

                      <div className="flex flex-col gap-2 md:items-end">
                        <MarkPaidModal locale={locale} item={p} onMark={() => markPaid(p.id)} />

                        {isUnpaid ? (
                          <div data-testid={`gate-payment-${p.id}`} className="rounded-2xl border bg-muted/40 p-3 text-sm text-muted-foreground md:max-w-[280px]">
                            <div className="flex items-start gap-2">
                              <Lock className="mt-0.5 h-4 w-4" />
                              <div>
                                <div className="font-semibold text-foreground">{locale === "ar" ? "قيد" : "Gate"}</div>
                                <div className="mt-1">
                                  {locale === "ar" ? "فتح Case محظور حتى يصبح PAID." : "Case opening is blocked until PAID."}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}
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
                  <div className="text-sm font-semibold">{locale === "ar" ? "قواعد" : "Rules"}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {locale === "ar" ? "تسجيل الدفع قبل فتح Case." : "Record payment before opening Case."}
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
                    {locale === "ar" ? "لا توجد Case بدون دفع PAID." : "No Case without PAID payment."}
                  </div>
                </div>
                <div data-testid="rule-audit" className="rounded-2xl border bg-card/70 p-4 text-sm">
                  <div className="font-semibold">{locale === "ar" ? "التدقيق" : "Audit"}</div>
                  <div className="mt-1 text-muted-foreground">
                    {locale === "ar" ? "كل تغيير في الدفع يجب أن يُسجل." : "Every payment change must be logged."}
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
                  <span className="font-mono text-xs text-muted-foreground">09:20</span> · {locale === "ar" ? "تم تسجيل الدفع" : "Payment recorded"} · PAY-7821
                </div>
                <div data-testid="audit-2" className="rounded-2xl border bg-card/70 p-3 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">10:05</span> · {locale === "ar" ? "فاتورة غير مدفوعة" : "Invoice unpaid"} · PAY-7815
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
