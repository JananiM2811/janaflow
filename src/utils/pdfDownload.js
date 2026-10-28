// Native builds create the PDF with expo-print (see pdf.js); the direct download is web-only
// and lives in pdfDownload.web.js.
export function downloadReportPdf() {
  throw new Error('downloadReportPdf is only available on web');
}
