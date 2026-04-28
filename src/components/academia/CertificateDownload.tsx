"use client";

import { useCallback } from "react";

interface CertificateDownloadProps {
  courseTitle: string;
  userName: string;
  certificateNumber: string;
  issuedAt: string;
}

export default function CertificateDownload({
  courseTitle, userName, certificateNumber, issuedAt,
}: CertificateDownloadProps) {
  const download = useCallback(async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    const w = 297;
    const h = 210;

    // Background
    doc.setFillColor(27, 35, 48); // #1B2330 navy
    doc.rect(0, 0, w, h, "F");

    // Border
    doc.setDrawColor(0, 168, 168); // teal
    doc.setLineWidth(1);
    doc.rect(10, 10, w - 20, h - 20);
    doc.setLineWidth(0.3);
    doc.rect(13, 13, w - 26, h - 26);

    // Header
    doc.setTextColor(0, 168, 168);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("3TOUCH TRIBE", w / 2, 35, { align: "center" });

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.text("CERTIFICADO DE FINALIZACIÓN", w / 2, 55, { align: "center" });

    // Divider line
    doc.setDrawColor(0, 168, 168);
    doc.setLineWidth(0.5);
    doc.line(w / 2 - 40, 62, w / 2 + 40, 62);

    // "otorgado a"
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Se otorga a", w / 2, 78, { align: "center" });

    // Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text(userName, w / 2, 95, { align: "center" });

    // "por completar"
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("por completar satisfactoriamente el curso", w / 2, 112, { align: "center" });

    // Course title
    doc.setTextColor(0, 168, 168);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    // Wrap long titles
    const titleLines = doc.splitTextToSize(courseTitle, 200);
    doc.text(titleLines, w / 2, 128, { align: "center" });

    // Date and certificate number
    const dateStr = new Date(issuedAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${dateStr}`, w / 2 - 50, 165, { align: "center" });
    doc.text(`Certificado Nº: ${certificateNumber}`, w / 2 + 50, 165, { align: "center" });

    // Footer
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("www.3touchtribe.com", w / 2, 190, { align: "center" });

    doc.save(`certificado-${certificateNumber}.pdf`);
  }, [courseTitle, userName, certificateNumber, issuedAt]);

  return (
    <button onClick={download} className="btn-primary !text-sm">
      📜 Descargar certificado
    </button>
  );
}
