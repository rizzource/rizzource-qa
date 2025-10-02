// Utility functions to generate and download Outline as PDF and DOCX
// Uses jsPDF for PDF and docx for Word documents

import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
} from "docx";

const sanitizeFileName = (str = "outline") =>
  str
    .toString()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toLowerCase();

const buildTitle = (outline) => {
  const parts = [outline?.title].filter(Boolean);
  return parts.join(" - ") || "outline";
};

const buildMetaLines = (outline) => {
  return [
    outline?.topic ? `Topic: ${outline.topic}` : null,
    outline?.professor ? `Professor: ${outline.professor}` : null,
    outline?.year ? `Year: ${outline.year}` : null,
    Array.isArray(outline?.tags) && outline.tags.length
      ? `Tags: ${outline.tags.join(", ")}`
      : null,
  ].filter(Boolean);
};

export const downloadOutlineAsPDF = async (outline) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  let cursorY = margin;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  const title = buildTitle(outline);
  doc.text(title, margin, cursorY);
  cursorY += 24;

  // Meta
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const metaLines = buildMetaLines(outline);
  metaLines.forEach((line) => {
    doc.text(line, margin, cursorY);
    cursorY += 16;
  });
  if (metaLines.length) cursorY += 8;

  // Notes
  const notes = outline?.notes || "No notes available.";
  doc.setFontSize(12);
  const contentWidth = pageWidth - margin * 2;
  const lines = doc.splitTextToSize(notes, contentWidth);

  lines.forEach((line) => {
    if (cursorY > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      cursorY = margin;
    }
    doc.text(line, margin, cursorY);
    cursorY += 16;
  });

  const fileName = `${sanitizeFileName(title)}.pdf`;
  doc.save(fileName);
};

export const downloadOutlineAsDocx = async (outline) => {
  const title = buildTitle(outline);
  const metaLines = buildMetaLines(outline);
  const notes = outline?.notes || "No notes available.";

  const paragraphs = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
    }),
    ...metaLines.map((m) => new Paragraph({ text: m })),
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [
        new TextRun({ text: notes }),
      ],
    }),
  ];

  const doc = new Document({
    sections: [
      {
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${sanitizeFileName(title)}.docx`;
  saveAs(blob, fileName);
};

export const downloadOutlineBoth = async (outline) => {
  // Trigger sequentially to ensure both downloads are generated
  await downloadOutlineAsPDF(outline);
  await downloadOutlineAsDocx(outline);
};
