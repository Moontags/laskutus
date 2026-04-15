import { z } from "zod";

export const customerSchema = z.object({
	name: z.string().min(1, "Nimi on pakollinen"),
	businessId: z.string().optional(),
	vatNumber: z.string().optional(),
	email: z.string().email("Virheellinen sähköposti"),
	phone: z.string().optional(),
	contactPerson: z.string().optional(),
	street: z.string().min(1, "Katuosoite on pakollinen"),
	city: z.string().min(1, "Kaupunki on pakollinen"),
	postalCode: z.string().min(1, "Postinumero on pakollinen"),
	country: z.string().default("FI"),
	notes: z.string().optional(),
});

export const productSchema = z.object({
	name: z.string().min(1, "Nimi on pakollinen"),
	description: z.string().optional(),
	unit: z.string().default("kpl"),
	unitPrice: z.coerce.number().min(0, "Hinnan täytyy olla positiivinen"),
	vatRate: z.coerce.number().default(25.5),
});

export const invoiceItemSchema = z.object({
	description: z.string().min(1, "Kuvaus on pakollinen"),
	quantity: z.coerce.number().min(0.01, "Määrä on pakollinen"),
	unit: z.string().default("kpl"),
	unitPrice: z.coerce.number().min(0, "Hinta on pakollinen"),
	vatRate: z.coerce.number().default(25.5),
	productId: z.string().optional(),
	sortOrder: z.number().default(0),
});

export const invoiceSchema = z.object({
	customerId: z.string().min(1, "Asiakas on pakollinen"),
	invoiceDate: z.string().min(1, "Laskupäivä on pakollinen"),
	dueDate: z.string().min(1, "Eräpäivä on pakollinen"),
	notes: z.string().optional(),
	internalNotes: z.string().optional(),
	items: z.array(invoiceItemSchema).min(1, "Lisää vähintään yksi rivi"),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;