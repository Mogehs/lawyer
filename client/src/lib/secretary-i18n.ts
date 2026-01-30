import type { Locale } from "./i18n";

export type SecretaryKey =
  | "secTitle"
  | "secSubtitle"
  | "navOverview"
  | "navPayments"
  | "navCases"
  | "navSessions"
  | "navDocuments"
  | "navTasks"
  | "navWhatsApp"
  | "navAudit"
  | "searchPlaceholder"
  | "back"
  | "paymentMandatoryTitle"
  | "paymentMandatoryDesc"
  | "overviewQuickActions"
  | "overviewQuickActionsDesc"
  | "overviewSelectedCase"
  | "overviewSelectedCaseDesc"
  | "selectCase"
  | "gateStatus"
  | "gateStatusDesc"
  | "gatePayment"
  | "gatePaymentDesc"
  | "gateSignature"
  | "gateSignatureDesc"
  | "gateSubmission"
  | "gateSubmissionDesc"
  | "ok"
  | "blocked"
  | "myTasks"
  | "myTasksDesc"
  | "today"
  | "done"
  | "payments"
  | "paymentsDesc"
  | "paymentDetails"
  | "paymentDetailsDesc"
  | "cases"
  | "casesDesc"
  | "manageSelected"
  | "manageSelectedDesc"
  | "sessions"
  | "sessionsDesc"
  | "newSession"
  | "manageSession"
  | "manageSessionDesc"
  | "uploadSubmissionProof"
  | "recordSessionOutcome"
  | "documents"
  | "documentsDesc"
  | "poaFiles"
  | "clientDocuments"
  | "rules"
  | "tasks"
  | "tasksDesc"
  | "filter"
  | "filterDesc"
  | "whatsapp"
  | "whatsappDesc"
  | "sendMessage"
  | "sendMessageDesc"
  | "audit"
  | "auditDesc"
  | "modalCreatePaymentTitle"
  | "modalCreatePaymentCta"
  | "modalCancel"
  | "clientName"
  | "phoneWhatsApp"
  | "invoiceOptional"
  | "stage"
  | "method"
  | "amountQar"
  | "paymentStatus"
  | "notes"
  | "optionalNotes"
  | "rule"
  | "gate"
  | "caseOpeningBlockedUnlessPaid"
  | "paymentCanBeRecordedBeforeCase"
  | "modalOpenCaseTitle"
  | "selectPaidPayment"
  | "choosePayment"
  | "caseType"
  | "caseTitleOptional"
  | "internalTitle"
  | "intakeNotes"
  | "onlyPaidPaymentsOpenCase"
  | "modalOpenCaseCta"
  | "noEligiblePayments"
  | "markPaid"
  | "openCase"
  | "linkedToCase"
  | "poa"
  | "uploadPoa"
  | "poaNumber"
  | "poaExpiry"
  | "files"
  | "mockUploader"
  | "add"
  | "noFilesAdded"
  | "save"
  | "uploadClientDocs"
  | "assignLawyers"
  | "draftingLawyer"
  | "approvingLawyer"
  | "recordDecision"
  | "decisionUpdate"
  | "closeCaseNow"
  | "closeCase"
  | "archiveCase"
  | "archiveWarning"
  | "createSession"
  | "sessionDate"
  | "submissionRequired"
  | "submissionProof"
  | "referenceNumber"
  | "submissionDate"
  | "proofFilesPdf"
  | "sessionOutcome"
  | "sessionStatus";

type Dict = Record<SecretaryKey, string>;

export const secretaryDictionaries: Record<Locale, Dict> = {
  en: {
    secTitle: "Secretary Workspace",
    secSubtitle: "Payments first → then case opening → then assignments.",
    navOverview: "Overview",
    navPayments: "Payments",
    navCases: "Cases",
    navSessions: "Sessions",
    navDocuments: "Documents",
    navTasks: "Tasks",
    navWhatsApp: "WhatsApp",
    navAudit: "Audit",
    searchPlaceholder: "Search payments, cases, sessions...",
    back: "Back",

    paymentMandatoryTitle: "Payment is mandatory",
    paymentMandatoryDesc: "If payment status is not PAID, the next workflow step is blocked.",

    overviewQuickActions: "Quick actions",
    overviewQuickActionsDesc: "Secretary-only operations.",
    overviewSelectedCase: "Selected case",
    overviewSelectedCaseDesc: "Pick a case to manage documents, sessions and decisions.",
    selectCase: "Select a case",

    gateStatus: "Gate status",
    gateStatusDesc: "These blocks match the Qatar workflow rules.",
    gatePayment: "Payment gate",
    gatePaymentDesc: "Blocks case creation until PAID",
    gateSignature: "Signature gate",
    gateSignatureDesc: "Only Managing Partner signs memorandums",
    gateSubmission: "Submission gate",
    gateSubmissionDesc: "No session without official submission",
    ok: "OK",
    blocked: "Blocked",

    myTasks: "My tasks",
    myTasksDesc: "Quick queue for secretary work.",
    today: "Today",
    done: "Done",

    payments: "Payments",
    paymentsDesc: "Invoice first, payment before case is allowed.",
    paymentDetails: "Payment details",
    paymentDetailsDesc: "For WhatsApp templates and audit.",

    cases: "Cases",
    casesDesc: "Open, assign, close and archive.",
    manageSelected: "Manage selected",
    manageSelectedDesc: "All secretary duties on a case.",

    sessions: "Sessions & submissions",
    sessionsDesc: "No session without official submission proof.",
    newSession: "New session",
    manageSession: "Manage session",
    manageSessionDesc: "Select a session to record submission and outcome.",
    uploadSubmissionProof: "Upload submission proof",
    recordSessionOutcome: "Record session outcome",

    documents: "Document control",
    documentsDesc: "POA + client documents are managed by secretary.",
    poaFiles: "POA files",
    clientDocuments: "Client documents",
    rules: "Rules",

    tasks: "Tasks",
    tasksDesc: "Assigned tasks across roles (mock).",
    filter: "Filter",
    filterDesc: "View tasks for a specific case.",

    whatsapp: "WhatsApp",
    whatsappDesc: "Manual and automated logs (mock). WhatsApp is primary channel.",
    sendMessage: "Send message",
    sendMessageDesc: "Templates aligned to your rules.",

    audit: "Audit trail",
    auditDesc: "Every action creates a log entry (mock).",

    modalCreatePaymentTitle: "Create payment record (before case)",
    modalCreatePaymentCta: "Create payment",
    modalCancel: "Cancel",

    clientName: "Client name",
    phoneWhatsApp: "Phone (WhatsApp)",
    invoiceOptional: "Invoice ID (optional)",
    stage: "Stage",
    method: "Method",
    amountQar: "Amount (QAR)",
    paymentStatus: "Payment status",
    notes: "Notes",
    optionalNotes: "Optional notes...",
    rule: "Rule",
    gate: "Gate",
    caseOpeningBlockedUnlessPaid: "Case opening is blocked unless PAID.",
    paymentCanBeRecordedBeforeCase: "Payment can be recorded before case creation.",

    modalOpenCaseTitle: "Open case from PAID payment",
    selectPaidPayment: "Select a PAID payment",
    choosePayment: "Choose payment",
    caseType: "Case type",
    caseTitleOptional: "Case title (optional)",
    internalTitle: "Internal title",
    intakeNotes: "Any intake notes...",
    onlyPaidPaymentsOpenCase: "Only PAID payments can open a case.",
    modalOpenCaseCta: "Open case",
    noEligiblePayments: "No eligible payments. Create a payment and mark it PAID first.",

    markPaid: "Mark as paid",
    openCase: "Open case",
    linkedToCase: "Linked to case",

    poa: "POA",
    uploadPoa: "Upload POA",
    poaNumber: "POA number",
    poaExpiry: "POA expiry",
    files: "Files",
    mockUploader: "Mock uploader: type a filename and add it.",
    add: "Add",
    noFilesAdded: "No files added.",
    save: "Save",

    uploadClientDocs: "Upload client documents",
    assignLawyers: "Assign lawyers",
    draftingLawyer: "Drafting lawyer",
    approvingLawyer: "Approving lawyer",

    recordDecision: "Record decision",
    decisionUpdate: "Decision / update",
    closeCaseNow: "Close case now?",
    closeCase: "Close case",

    archiveCase: "Archive case",
    archiveWarning: "Archiving is permanent and read-only. Full history is preserved.",

    createSession: "Create session",
    sessionDate: "Session date",
    submissionRequired: "Submission required",

    submissionProof: "Submission proof",
    referenceNumber: "Reference number",
    submissionDate: "Submission date",
    proofFilesPdf: "Proof files (PDF)",

    sessionOutcome: "Session outcome",
    sessionStatus: "Session status",
  },

  ar: {
    secTitle: "لوحة السكرتارية",
    secSubtitle: "الدفع أولاً → ثم فتح القضية → ثم التعيينات.",

    navOverview: "نظرة عامة",
    navPayments: "المدفوعات",
    navCases: "القضايا",
    navSessions: "الجلسات",
    navDocuments: "المستندات",
    navTasks: "المهام",
    navWhatsApp: "واتساب",
    navAudit: "سجل التدقيق",

    searchPlaceholder: "ابحث في المدفوعات والقضايا والجلسات...",
    back: "رجوع",

    paymentMandatoryTitle: "الدفع إلزامي",
    paymentMandatoryDesc: "إذا لم تكن حالة الدفع مدفوعة، يتم حظر الخطوة التالية.",

    overviewQuickActions: "إجراءات سريعة",
    overviewQuickActionsDesc: "عمليات خاصة بالسكرتارية.",
    overviewSelectedCase: "القضية المختارة",
    overviewSelectedCaseDesc: "اختر قضية لإدارة المستندات والجلسات والقرارات.",
    selectCase: "اختر قضية",

    gateStatus: "حالة القيود",
    gateStatusDesc: "هذه القيود تطابق قواعد سير العمل في قطر.",
    gatePayment: "قيد الدفع",
    gatePaymentDesc: "يمنع إنشاء القضية حتى يصبح الدفع مدفوعاً",
    gateSignature: "قيد التوقيع",
    gateSignatureDesc: "الشريك المدير فقط يوقّع المذكرات",
    gateSubmission: "قيد الإيداع",
    gateSubmissionDesc: "لا جلسة بدون إثبات إيداع رسمي",
    ok: "مسموح",
    blocked: "محظور",

    myTasks: "مهامي",
    myTasksDesc: "قائمة سريعة لمهام السكرتارية.",
    today: "اليوم",
    done: "تم",

    payments: "المدفوعات",
    paymentsDesc: "يمكن تسجيل الدفع قبل فتح القضية.",
    paymentDetails: "تفاصيل الدفع",
    paymentDetailsDesc: "لاستخدامها في واتساب وسجل التدقيق.",

    cases: "القضايا",
    casesDesc: "فتح، تعيين، إغلاق وأرشفة.",
    manageSelected: "إدارة المختار",
    manageSelectedDesc: "كل مهام السكرتارية على القضية.",

    sessions: "الجلسات والإيداعات",
    sessionsDesc: "لا جلسة بدون إثبات إيداع رسمي.",
    newSession: "جلسة جديدة",
    manageSession: "إدارة الجلسة",
    manageSessionDesc: "اختر جلسة لتسجيل الإيداع والنتيجة.",
    uploadSubmissionProof: "رفع إثبات الإيداع",
    recordSessionOutcome: "تسجيل نتيجة الجلسة",

    documents: "إدارة المستندات",
    documentsDesc: "إدارة POA ومستندات العميل بواسطة السكرتارية.",
    poaFiles: "ملفات POA",
    clientDocuments: "مستندات العميل",
    rules: "القواعد",

    tasks: "المهام",
    tasksDesc: "مهام موزعة على الأدوار (تجريبي).",
    filter: "تصفية",
    filterDesc: "عرض المهام لقضية محددة.",

    whatsapp: "واتساب",
    whatsappDesc: "سجل رسائل يدوي/تلقائي (تجريبي). واتساب هو القناة الأساسية.",
    sendMessage: "إرسال رسالة",
    sendMessageDesc: "قوالب متوافقة مع القواعد.",

    audit: "سجل التدقيق",
    auditDesc: "كل إجراء ينشئ سجل تدقيق (تجريبي).",

    modalCreatePaymentTitle: "إنشاء سجل دفع (قبل فتح القضية)",
    modalCreatePaymentCta: "إنشاء الدفع",
    modalCancel: "إلغاء",

    clientName: "اسم العميل",
    phoneWhatsApp: "الهاتف (واتساب)",
    invoiceOptional: "رقم الفاتورة (اختياري)",
    stage: "المرحلة",
    method: "طريقة الدفع",
    amountQar: "المبلغ (QAR)",
    paymentStatus: "حالة الدفع",
    notes: "ملاحظات",
    optionalNotes: "ملاحظات اختيارية...",
    rule: "قاعدة",
    gate: "قيد",
    caseOpeningBlockedUnlessPaid: "فتح القضية محظور ما لم يكن الدفع مدفوعاً.",
    paymentCanBeRecordedBeforeCase: "يمكن تسجيل الدفع قبل فتح القضية.",

    modalOpenCaseTitle: "فتح قضية من دفع مدفوع",
    selectPaidPayment: "اختر دفعاً مدفوعاً",
    choosePayment: "اختر الدفع",
    caseType: "نوع القضية",
    caseTitleOptional: "عنوان القضية (اختياري)",
    internalTitle: "عنوان داخلي",
    intakeNotes: "ملاحظات الاستقبال...",
    onlyPaidPaymentsOpenCase: "يمكن فتح القضية فقط من دفعات مدفوعة.",
    modalOpenCaseCta: "فتح القضية",
    noEligiblePayments: "لا توجد دفعات مؤهلة. أنشئ دفعة ثم اجعلها مدفوعة.",

    markPaid: "تعيين كمدفوع",
    openCase: "فتح القضية",
    linkedToCase: "مرتبط بالقضية",

    poa: "POA",
    uploadPoa: "رفع POA",
    poaNumber: "رقم POA",
    poaExpiry: "انتهاء POA",
    files: "الملفات",
    mockUploader: "رفع تجريبي: اكتب اسم الملف ثم أضفه.",
    add: "إضافة",
    noFilesAdded: "لا توجد ملفات.",
    save: "حفظ",

    uploadClientDocs: "رفع مستندات العميل",
    assignLawyers: "تعيين المحامين",
    draftingLawyer: "محامي الصياغة",
    approvingLawyer: "محامي الاعتماد",

    recordDecision: "تسجيل قرار",
    decisionUpdate: "القرار / التحديث",
    closeCaseNow: "إغلاق القضية الآن؟",
    closeCase: "إغلاق القضية",

    archiveCase: "أرشفة القضية",
    archiveWarning: "الأرشفة نهائية (قراءة فقط) مع حفظ كامل السجل.",

    createSession: "إنشاء جلسة",
    sessionDate: "تاريخ الجلسة",
    submissionRequired: "الإيداع مطلوب",

    submissionProof: "إثبات الإيداع",
    referenceNumber: "رقم المرجع",
    submissionDate: "تاريخ الإيداع",
    proofFilesPdf: "ملفات الإثبات (PDF)",

    sessionOutcome: "نتيجة الجلسة",
    sessionStatus: "حالة الجلسة",
  },
};

export function ts(locale: Locale, key: SecretaryKey) {
  return secretaryDictionaries[locale][key] ?? secretaryDictionaries.en[key] ?? String(key);
}
