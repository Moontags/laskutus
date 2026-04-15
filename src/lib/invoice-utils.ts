export function calculateLineTotal(quantity: number, unitPrice: number) {
	return Math.round(quantity * unitPrice * 100) / 100;
}

export function calculateVatAmount(lineTotal: number, vatRate: number) {
	return Math.round(lineTotal * (vatRate / 100) * 100) / 100;
}

export function calculateTotalAmount(lineTotal: number, vatAmount: number) {
	return Math.round((lineTotal + vatAmount) * 100) / 100;
}

export function calculateInvoiceTotals(items: {
	quantity: number;
	unitPrice: number;
	vatRate: number;
}[]) {
	let subtotal = 0;
	let vatAmount = 0;

	for (const item of items) {
		const lineTotal = calculateLineTotal(item.quantity, item.unitPrice);
		const itemVat = calculateVatAmount(lineTotal, item.vatRate);
		subtotal += lineTotal;
		vatAmount += itemVat;
	}

	return {
		subtotal: Math.round(subtotal * 100) / 100,
		vatAmount: Math.round(vatAmount * 100) / 100,
		total: Math.round((subtotal + vatAmount) * 100) / 100,
	};
}

export function generateInvoiceNumber(prefix: string, nextNumber: number) {
	const year = new Date().getFullYear();
	const padded = String(nextNumber).padStart(4, "0");
	return `${prefix}-${year}-${padded}`;
}

export function calculateFinnishReference(invoiceNumber: string): string {
	const digits = invoiceNumber.replace(/\D/g, "");
	const weights = [7, 3, 1];
	let sum = 0;
	for (let i = 0; i < digits.length; i++) {
		sum += parseInt(digits[digits.length - 1 - i]) * weights[i % 3];
	}
	const checkDigit = (10 - (sum % 10)) % 10;
	return digits + checkDigit;
}

export function formatCurrency(amount: number, currency = "EUR") {
	return new Intl.NumberFormat("fi-FI", {
		style: "currency",
		currency,
	}).format(amount);
}

export function formatDate(date: string | Date) {
	return new Intl.DateTimeFormat("fi-FI").format(new Date(date));
}

export function addDays(date: Date, days: number) {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}