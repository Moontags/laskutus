interface Props {
  status: string;
}

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  DRAFT:     { label: "Luonnos",    classes: "bg-gray-100 text-gray-700" },
  SENT:      { label: "Lähetetty",  classes: "bg-blue-100 text-blue-700" },
  VIEWED:    { label: "Avattu",     classes: "bg-purple-100 text-purple-700" },
  PAID:      { label: "Maksettu",   classes: "bg-green-100 text-green-700" },
  OVERDUE:   { label: "Erääntynyt", classes: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Peruutettu", classes: "bg-gray-100 text-gray-400" },
};

export default function InvoiceStatusBadge({ status }: Props) {
  const s = STATUS_MAP[status] ?? { label: status, classes: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.classes}`}>
      {s.label}
    </span>
  );
}