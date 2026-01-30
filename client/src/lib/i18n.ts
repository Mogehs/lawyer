export type Locale = "en" | "ar";

type Dict = Record<string, string>;

type Dictionaries = Record<Locale, Dict>;

export const dictionaries: Dictionaries = {
  en: {
    appName: "Qatar Law Firm Management",

    loginTitle: "Sign in",
    loginSubtitle: "This is a UI prototype. No real credentials required.",
    roleLabel: "Role",
    roleSecretary: "Secretary",
    roleDraftingLawyer: "Drafting Lawyer",
    roleApprovingLawyer: "Approving Lawyer",
    rolePartner: "Managing Partner",
    roleLegalSecretary: "Legal Secretary",
    roleAccountant: "Accountant",
    language: "Language",
    theme: "Theme",
    continue: "Continue",

    secretaryWorkspace: "Secretary Workspace",
    secretarySubtitle: "Payments first → then case creation → then assignments.",

    tabPayments: "Payments",
    tabCases: "Cases",
    tabWhatsApp: "WhatsApp",
    tabAudit: "Audit",

    newPayment: "New payment",
    createCase: "Create case",
    openCase: "Open case",
    markPaid: "Mark as paid",

    paymentGateTitle: "Payment is mandatory",
    paymentGateDesc: "If payment status is not PAID, the workflow is blocked.",

    tableRef: "Ref",
    tableClient: "Client",
    tableStage: "Stage",
    tableAmount: "Amount",
    tableStatus: "Status",
    tableActions: "Actions",

    statusPaid: "PAID",
    statusUnpaid: "UNPAID",

    judicialStages: "Judicial stages (Qatar)",
    stageProsecution: "Prosecution",
    stageInvestigation: "Investigation",
    stageFirstInstance: "First Instance",
    stageAppeal: "Appeal",
    stageCassation: "Cassation (Tamyeez)",
    stageEnforcement: "Enforcement",

    whatsappPrimary: "WhatsApp is primary",
    whatsappDesc: "Send manual messages or use system reminders (UI-only here).",

    auditTrail: "Audit trail",
    auditDesc: "Every action creates an immutable log entry (mocked).",
  },
  ar: {
    appName: "نظام إدارة مكتب محاماة قطر",

    loginTitle: "تسجيل الدخول",
    loginSubtitle: "هذه نسخة واجهة فقط. لا توجد بيانات دخول حقيقية.",
    roleLabel: "الدور",
    roleSecretary: "السكرتارية",
    roleDraftingLawyer: "محامي صياغة",
    roleApprovingLawyer: "محامي اعتماد",
    rolePartner: "الشريك المدير",
    roleLegalSecretary: "سكرتير قانوني",
    roleAccountant: "محاسب",
    language: "اللغة",
    theme: "المظهر",
    continue: "متابعة",

    secretaryWorkspace: "لوحة السكرتارية",
    secretarySubtitle: "الدفع أولاً → ثم فتح القضية → ثم التعيينات.",

    tabPayments: "المدفوعات",
    tabCases: "القضايا",
    tabWhatsApp: "واتساب",
    tabAudit: "سجل التدقيق",

    newPayment: "دفعة جديدة",
    createCase: "إنشاء قضية",
    openCase: "فتح القضية",
    markPaid: "تعيين كمدفوع",

    paymentGateTitle: "الدفع إلزامي",
    paymentGateDesc: "إذا لم تكن حالة الدفع مدفوع، يتم حظر سير العمل.",

    tableRef: "المرجع",
    tableClient: "العميل",
    tableStage: "المرحلة",
    tableAmount: "المبلغ",
    tableStatus: "الحالة",
    tableActions: "الإجراءات",

    statusPaid: "مدفوع",
    statusUnpaid: "غير مدفوع",

    judicialStages: "المراحل القضائية (قطر)",
    stageProsecution: "النيابة",
    stageInvestigation: "التحقيق",
    stageFirstInstance: "أولى",
    stageAppeal: "الاستئناف",
    stageCassation: "التمييز",
    stageEnforcement: "التنفيذ",

    whatsappPrimary: "الواتساب هو القناة الأساسية",
    whatsappDesc: "إرسال رسائل يدوياً أو تذكيرات النظام (واجهة فقط هنا).",

    auditTrail: "سجل التدقيق",
    auditDesc: "كل إجراء ينشئ سجل غير قابل للتعديل (بيانات تجريبية).",
  },
};

export function t(locale: Locale, key: keyof (typeof dictionaries)["en"]) {
  return dictionaries[locale][key] ?? dictionaries.en[key] ?? String(key);
}
