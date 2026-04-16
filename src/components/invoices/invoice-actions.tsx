"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Send, XCircle, RotateCcw, Mail } from "lucide-react";

interface Props {
  invoiceId: string;
  currentStatus: string;
  customerEmail?: string;
}

const STATUS_ACTIONS = [
  { status: "SENT", label: "Merkitse lähetetyksi", icon: Send, show: ["DRAFT"] },
  { status: "PAID", label: "Merkitse maksetuksi", icon: CheckCircle, show: ["SENT", "VIEWED", "OVERDUE"] },
  { status: "OVERDUE", label: "Merkitse erääntyneeksi", icon: XCircle, show: ["SENT", "VIEWED"] },
  { status: "DRAFT", label: "Palauta luonnokseksi", icon: RotateCcw, show: ["SENT", "VIEWED", "CANCELLED"] },
  { status: "CANCELLED", label: "Peruuta lasku", icon: XCircle, show: ["DRAFT", "SENT", "VIEWED"] },
];

export default function InvoiceActions({ invoiceId, currentStatus, customerEmail }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const availableActions = STATUS_ACTIONS.filter((a) => a.show.includes(currentStatus));

  async function handleStatusChange(status: string) {
    if (!confirm("Muutetaanko laskun tila?")) return;
    setLoading(true);
    setMessage(null);

    await fetch(`/api/invoices/${invoiceId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    router.refresh();
    setLoading(false);
  }

  async function handleSend() {
    if (!customerEmail) {
      setMessage({ type: "error", text: "Asiakkaalla ei ole sähköpostiosoitetta" });
      return;
    }
    if (!confirm(`Lähetetäänkö lasku osoitteeseen ${customerEmail}?`)) return;

    setSendLoading(true);
    setMessage(null);

    const res = await fetch(`/api/invoices/${invoiceId}/send`, {
      method: "POST",
    });

    if (res.ok) {
      setMessage({ type: "success", text: `Lasku lähetetty osoitteeseen ${customerEmail}` });
      router.refresh();
      setTimeout(() => setMessage(null), 2000);
    } else {
      const data = await res.json();
      setMessage({ type: "error", text: data.error || "Lähetys epäonnistui" });
    }
    setSendLoading(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleSend}
          disabled={sendLoading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          <Mail size={14} />
          {sendLoading ? "Lähetetään..." : "Lähetä sähköpostilla"}
        </button>

        {availableActions.map(({ status, label, icon: Icon }) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {message && (
        <p className={`text-sm px-3 py-2 rounded-lg ${
          message.type === "success"
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-600"
        }`}>
          {message.text}
        </p>
      )}
    </div>
  );
}