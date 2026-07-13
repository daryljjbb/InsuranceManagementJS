// Customer structure example
export const CustomerTemplate = {
    id: 0,
    first_name: "",
    last_name: "",
    age: 0,
    createdAt: ""
};

// Policy structure example
export const PolicyTemplate = {
    policyId: 0,
    customerId: 0,
    type: "",
    premium: 0,
    agencyFee: 0,
    dateAdded: ""
};

// LineItem structure example
export const LineItemTemplate = {
    label: "",
    amount: 0
};

// Invoice status and type constants
export const InvoiceStatus = {
    OPEN: "OPEN",
    PARTIALLY_PAID: "PARTIALLY_PAID",
    PAID: "PAID"
};

export const InvoiceType = {
    PREMIUM_ONLY: "PREMIUM_ONLY",
    AGENCY_FEE_ONLY: "AGENCY_FEE_ONLY",
    PREMIUM_PLUS_AGENCY_FEE: "PREMIUM_PLUS_AGENCY_FEE"
};

// Payment structure example
export const PaymentTemplate = {
    paymentId: 0,
    invoiceId: 0,
    amount: 0,
    datePaid: ""
};

// Invoice structure example
export const InvoiceTemplate = {
    invoiceId: 0,
    policyId: 0,
    invoiceType: InvoiceType.PREMIUM_ONLY,
    lineItems: [],
    amountDue: 0,
    amountPaid: 0,
    status: InvoiceStatus.OPEN,
    dateGenerated: "",
    payments: []
};
