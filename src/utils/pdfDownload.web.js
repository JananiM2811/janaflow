import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { formatMoney, formatTxDate, reportFileName, toDDMMYYYY } from './format';
import { sortByDateDesc, topCategories, totals } from './reports';

// The built-in PDF fonts have no ₹ glyph, so amounts are written as "Rs."
const money = (n, opts) => formatMoney(n, opts).replace('₹', 'Rs. ');
const clean = (s) => String(s ?? '').replace(/₹/g, 'Rs. ').replace(/[−–—]/g, '-');

const INK = [24, 24, 27];
const MUTED = [113, 113, 122];
const HEAD = { fillColor: [244, 244, 245], textColor: [82, 82, 91], fontStyle: 'bold', fontSize: 8 };

/** Web: builds a real A4 PDF with jsPDF and downloads it straight away (no print dialog). */
export function downloadReportPdf({ title, subtitle, periodLabel, list, nameOf }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const left = 40;
  const t = totals(list);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text(`JanaFlow  |  ${clean(title)}`, left, 54);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`${clean(subtitle)}   |   Period: ${clean(periodLabel)}   |   Generated ${toDDMMYYYY(new Date())}`, left, 72);
  doc.setDrawColor(...INK);
  doc.setLineWidth(2);
  doc.line(left, 82, 555, 82);

  autoTable(doc, {
    startY: 96,
    head: [['Income', 'Expense', 'Net Saved', 'Transactions']],
    body: [[money(t.income), money(t.expense), money(t.balance, { sign: true }), String(list.length)]],
    theme: 'grid',
    headStyles: HEAD,
    bodyStyles: { fontSize: 13, fontStyle: 'bold', textColor: INK },
    styles: { lineColor: [228, 228, 231], cellPadding: 8 },
    margin: { left, right: 40 },
  });

  const cats = topCategories(list, 20);
  let y = doc.lastAutoTable.finalY + 26;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text('SPENDING BY CATEGORY', left, y);
  autoTable(doc, {
    startY: y + 8,
    head: [['Category', 'Amount', 'Share']],
    body: cats.length
      ? cats.map((c) => [c.category, money(c.amount), `${t.expense ? Math.round((c.amount / t.expense) * 100) : 0}%`])
      : [['No expenses in this period', '', '']],
    theme: 'striped',
    headStyles: HEAD,
    styles: { fontSize: 9, textColor: INK },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    margin: { left, right: 40 },
  });

  y = doc.lastAutoTable.finalY + 26;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`TRANSACTIONS (${list.length})`, left, y);
  const rows = sortByDateDesc(list).map((r) => [
    formatTxDate(r.date),
    ...(nameOf ? [nameOf(r.userId)] : []),
    clean(r.title),
    r.category,
    r.type === 'income' ? 'Income' : 'Expense',
    `${r.type === 'income' ? '+' : '-'}${money(r.amount)}`,
  ]);
  autoTable(doc, {
    startY: y + 8,
    head: [['Date', ...(nameOf ? ['Customer'] : []), 'Title', 'Category', 'Type', 'Amount']],
    body: rows.length ? rows : [['No transactions in this period']],
    theme: 'striped',
    headStyles: HEAD,
    styles: { fontSize: 8.5, textColor: INK },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: { [nameOf ? 5 : 4]: { halign: 'right' } },
    margin: { left, right: 40 },
  });

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(161, 161, 170);
    doc.text(`JanaFlow  |  Page ${p} of ${pages}  |  Generated on this device`, 297, 820, { align: 'center' });
  }

  const fileName = reportFileName(title, periodLabel);
  doc.save(fileName);
  return fileName;
}
