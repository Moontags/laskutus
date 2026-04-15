import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 50,
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  companyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  invoiceTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#111",
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 11,
    color: "#555",
    textAlign: "right",
    marginTop: 2,
  },
  addressBlock: {
    fontSize: 9,
    lineHeight: 1.6,
    color: "#444",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 20,
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 7,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 9,
    color: "#1a1a1a",
    fontFamily: "Helvetica-Bold",
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ebebeb",
  },
  tableHeaderText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  tableCell: {
    fontSize: 9,
    color: "#1a1a1a",
  },
  colDescription: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colUnit: { flex: 0.8, textAlign: "center" },
  colPrice: { flex: 1.2, textAlign: "right" },
  colVat: { flex: 0.8, textAlign: "right" },
  colTotal: { flex: 1.2, textAlign: "right" },
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  totalsBox: {
    width: 200,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalLabel: { fontSize: 9, color: "#555" },
  totalValue: { fontSize: 9, color: "#1a1a1a" },
  totalDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    marginVertical: 4,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  grandTotalLabel: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#1a1a1a" },
  grandTotalValue: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#1a1a1a" },
  paymentSection: {
    marginTop: 30,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
  },
  paymentTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#333",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paymentRow: { flexDirection: "row", marginBottom: 4 },
  paymentLabel: { fontSize: 8, color: "#888", width: 80 },
  paymentValue: { fontSize: 8, color: "#1a1a1a", fontFamily: "Helvetica-Bold", flex: 1 },
  notes: { marginTop: 16, fontSize: 8, color: "#555", lineHeight: 1.6 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#e5e5e5",
    paddingTop: 8,
  },
  footerText: { fontSize: 7, color: "#aaa" },
  vatSummarySection: { marginTop: 8 },
  vatSummaryTitle: {
    fontSize: 7,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  vatSummaryRow: { flexDirection: "row", gap: 20, marginBottom: 2 },
  vatSummaryText: { fontSize: 8, color: "#555" },
});

export interface InvoicePDFProps {
  invoice: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    reference: string | null;
    notes: string | null;
    subtotal: number;
    vatAmount: number;
    total: number;
    bankAccount: string | null;
    bankBic: string | null;
    currency: string;
    items: {
      description: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      vatRate: number;
      lineTotal: number;
      vatAmount: number;
      totalAmount: number;
      sortOrder: number;
    }[];
    customer: {
      name: string;
      street: string;
      postalCode: string;
      city: string;
      country: string;
      businessId: string | null;
      vatNumber: string | null;
      email: string;
    };
  };
  organization: {
    name: string;
    businessId: string;
    vatNumber: string | null;
    street: string;
    postalCode: string;
    city: string;
    email: string;
    phone: string | null;
    website: string | null;
    bankAccount: string | null;
    bankBic: string | null;
    lateInterestRate: number;
    penaltyFee: number;
    defaultPaymentTerms: string | null;
  };
}

function formatEur(amount: number) {
  return amount.toFixed(2).replace(".", ",") + " €";
}

function formatDateFi(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

function groupVatRates(items: InvoicePDFProps["invoice"]["items"]) {
  const groups: Record<number, { base: number; vat: number }> = {};
  for (const item of items) {
    if (!groups[item.vatRate]) groups[item.vatRate] = { base: 0, vat: 0 };
    groups[item.vatRate].base += item.lineTotal;
    groups[item.vatRate].vat += item.vatAmount;
  }
  return Object.entries(groups).map(([rate, vals]) => ({ rate: Number(rate), ...vals }));
}

function InvoicePDFContent({ invoice, organization }: InvoicePDFProps) {
  const sortedItems = [...invoice.items].sort((a, b) => a.sortOrder - b.sortOrder);
  const vatGroups = groupVatRates(sortedItems);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.companyName}>{organization.name}</Text>
          <View style={styles.addressBlock}>
            <Text>{organization.street}</Text>
            <Text>{organization.postalCode} {organization.city}</Text>
            <Text>Y-tunnus: {organization.businessId}</Text>
            {organization.vatNumber && <Text>ALV-tunnus: {organization.vatNumber}</Text>}
            <Text>{organization.email}</Text>
            {organization.phone && <Text>{organization.phone}</Text>}
          </View>
        </View>
        <View>
          <Text style={styles.invoiceTitle}>LASKU</Text>
          <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={[styles.infoBlock, { flex: 2 }]}>
          <Text style={styles.infoLabel}>Laskutetaan</Text>
          <Text style={[styles.infoValue, { marginBottom: 2 }]}>{invoice.customer.name}</Text>
          <View style={styles.addressBlock}>
            <Text>{invoice.customer.street}</Text>
            <Text>{invoice.customer.postalCode} {invoice.customer.city}</Text>
            {invoice.customer.businessId && <Text>Y-tunnus: {invoice.customer.businessId}</Text>}
            {invoice.customer.vatNumber && <Text>ALV-tunnus: {invoice.customer.vatNumber}</Text>}
          </View>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Laskupäivä</Text>
          <Text style={styles.infoValue}>{formatDateFi(invoice.invoiceDate)}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Eräpäivä</Text>
          <Text style={styles.infoValue}>{formatDateFi(invoice.dueDate)}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Viitenumero</Text>
          <Text style={styles.infoValue}>{invoice.reference ?? "—"}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colDescription]}>Kuvaus</Text>
          <Text style={[styles.tableHeaderText, styles.colQty]}>Määrä</Text>
          <Text style={[styles.tableHeaderText, styles.colUnit]}>Yks.</Text>
          <Text style={[styles.tableHeaderText, styles.colPrice]}>Á-hinta</Text>
          <Text style={[styles.tableHeaderText, styles.colVat]}>ALV%</Text>
          <Text style={[styles.tableHeaderText, styles.colTotal]}>Yhteensä</Text>
        </View>
        {sortedItems.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colDescription]}>{item.description}</Text>
            <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, styles.colUnit]}>{item.unit}</Text>
            <Text style={[styles.tableCell, styles.colPrice]}>{formatEur(item.unitPrice)}</Text>
            <Text style={[styles.tableCell, styles.colVat]}>{item.vatRate}%</Text>
            <Text style={[styles.tableCell, styles.colTotal]}>{formatEur(item.totalAmount)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalsSection}>
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Veroton yhteensä</Text>
            <Text style={styles.totalValue}>{formatEur(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>ALV yhteensä</Text>
            <Text style={styles.totalValue}>{formatEur(invoice.vatAmount)}</Text>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Yhteensä</Text>
            <Text style={styles.grandTotalValue}>{formatEur(invoice.total)}</Text>
          </View>
        </View>
      </View>

      {vatGroups.length > 0 && (
        <View style={styles.vatSummarySection}>
          <Text style={styles.vatSummaryTitle}>ALV-erittely</Text>
          {vatGroups.map((g) => (
            <View key={g.rate} style={styles.vatSummaryRow}>
              <Text style={styles.vatSummaryText}>ALV {g.rate}%:</Text>
              <Text style={styles.vatSummaryText}>Veroton {formatEur(g.base)}</Text>
              <Text style={styles.vatSummaryText}>ALV {formatEur(g.vat)}</Text>
              <Text style={styles.vatSummaryText}>Yhteensä {formatEur(g.base + g.vat)}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.paymentSection}>
        <Text style={styles.paymentTitle}>Maksutiedot</Text>
        {organization.bankAccount && (
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Tilinumero</Text>
            <Text style={styles.paymentValue}>{organization.bankAccount}</Text>
          </View>
        )}
        {organization.bankBic && (
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>BIC</Text>
            <Text style={styles.paymentValue}>{organization.bankBic}</Text>
          </View>
        )}
        {invoice.reference && (
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Viitenumero</Text>
            <Text style={styles.paymentValue}>{invoice.reference}</Text>
          </View>
        )}
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Eräpäivä</Text>
          <Text style={styles.paymentValue}>{formatDateFi(invoice.dueDate)}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Summa</Text>
          <Text style={styles.paymentValue}>{formatEur(invoice.total)}</Text>
        </View>
        {organization.lateInterestRate > 0 && (
          <View style={[styles.paymentRow, { marginTop: 6 }]}>
            <Text style={[styles.paymentLabel, { width: 120 }]}>Viivästyskorko</Text>
            <Text style={styles.paymentValue}>{organization.lateInterestRate}% (korkolain mukaan)</Text>
          </View>
        )}
        {organization.penaltyFee > 0 && (
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { width: 120 }]}>Muistutuskulut</Text>
            <Text style={styles.paymentValue}>{formatEur(organization.penaltyFee)}</Text>
          </View>
        )}
        {organization.defaultPaymentTerms && (
          <View style={[styles.paymentRow, { marginTop: 6 }]}>
            <Text style={[styles.paymentLabel, { width: 120 }]}>Maksuehto</Text>
            <Text style={styles.paymentValue}>{organization.defaultPaymentTerms}</Text>
          </View>
        )}
      </View>

      {invoice.notes && <Text style={styles.notes}>{invoice.notes}</Text>}

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>{organization.name} — {organization.businessId}</Text>
        <Text style={styles.footerText}>{invoice.invoiceNumber}</Text>
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) => `Sivu ${pageNumber} / ${totalPages}`}
        />
      </View>
    </Page>
  );
}

export default function InvoicePDF(props: InvoicePDFProps) {
  return (
    <Document>
      <InvoicePDFContent {...props} />
    </Document>
  );
}

export function InvoiceDocument(props: InvoicePDFProps) {
  return (
    <Document>
      <InvoicePDFContent {...props} />
    </Document>
  );
}