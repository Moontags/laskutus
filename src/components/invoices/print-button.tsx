"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  function handlePrint() {
    const elementsToHide = document.querySelectorAll("aside, header, nav, .no-print");
    elementsToHide.forEach((el) => {
      (el as HTMLElement).style.visibility = "hidden";
      (el as HTMLElement).style.position = "fixed";
      (el as HTMLElement).style.top = "-9999px";
    });

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        elementsToHide.forEach((el) => {
          (el as HTMLElement).style.visibility = "";
          (el as HTMLElement).style.position = "";
          (el as HTMLElement).style.top = "";
        });
      }, 500);
    }, 100);
  }

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors"
    >
      <Printer size={15} />
      Tulosta / PDF
    </button>
  );
}
