import * as IntentLauncher from 'expo-intent-launcher';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { EncodingType, StorageAccessFramework, writeAsStringAsync } from 'expo-file-system/legacy';
import { formatMoney, formatTxDate, reportFileName, toDDMMYYYY } from './format';
import { downloadReportPdf } from './pdfDownload';
import { sortByDateDesc, topCategories, totals } from './reports';

const escape = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const MAX_ROWS = 300;

/**
 * Monochrome A4 report: summary, category breakdown and the transaction list.
 * nameOf (optional) adds a Customer column, used for admin reports.
 */
export function buildReportHtml({ title, subtitle, periodLabel, list, nameOf }) {
  const t = totals(list);
  const cats = topCategories(list, 20);
  const rows = sortByDateDesc(list).slice(0, MAX_ROWS);

  return `<!doctype html>
<html><head><meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181B; margin: 32px; font-size: 12px; }
  header { border-bottom: 3px solid #18181B; padding-bottom: 12px; margin-bottom: 18px; }
  h1 { margin: 0; font-size: 24px; letter-spacing: .5px; }
  h2 { font-size: 14px; margin: 22px 0 8px; text-transform: uppercase; letter-spacing: 1px; color: #3F3F46; }
  .muted { color: #71717A; }
  .cards { display: flex; gap: 10px; }
  .card { flex: 1; border: 1px solid #E4E4E7; border-radius: 10px; padding: 12px; }
  .card b { display: block; font-size: 18px; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; background: #F4F4F5; padding: 7px 8px; font-size: 11px; text-transform: uppercase; color: #52525B; }
  td { padding: 7px 8px; border-bottom: 1px solid #F4F4F5; }
  td.num, th.num { text-align: right; white-space: nowrap; }
  .bar { height: 8px; background: #E4E4E7; border-radius: 4px; overflow: hidden; }
  .bar span { display: block; height: 100%; background: #3F3F46; }
  footer { margin-top: 28px; font-size: 10px; color: #A1A1AA; text-align: center; }
</style></head>
<body>
  <header>
    <h1>JanaFlow · ${escape(title)}</h1>
    <div class="muted">${escape(subtitle)} · Period: ${escape(periodLabel)} · Generated ${toDDMMYYYY(new Date())}</div>
  </header>

  <div class="cards">
    <div class="card">Income<b>${formatMoney(t.income)}</b></div>
    <div class="card">Expense<b>${formatMoney(t.expense)}</b></div>
    <div class="card">Net Saved<b>${formatMoney(t.balance, { sign: true })}</b></div>
    <div class="card">Transactions<b>${list.length}</b></div>
  </div>

  <h2>Spending by Category</h2>
  ${
    cats.length
      ? `<table><tr><th>Category</th><th style="width:45%"></th><th class="num">Amount</th><th class="num">Share</th></tr>
      ${cats
        .map((c) => {
          const share = t.expense ? Math.round((c.amount / t.expense) * 100) : 0;
          return `<tr><td>${escape(c.category)}</td><td><div class="bar"><span style="width:${share}%"></span></div></td><td class="num">${formatMoney(c.amount)}</td><td class="num">${share}%</td></tr>`;
        })
        .join('')}</table>`
      : '<p class="muted">No expenses in this period.</p>'
  }

  <h2>Transactions${list.length > MAX_ROWS ? ` (latest ${MAX_ROWS} of ${list.length})` : ''}</h2>
  ${
    rows.length
      ? `<table><tr><th>Date</th>${nameOf ? '<th>Customer</th>' : ''}<th>Title</th><th>Category</th><th class="num">Amount</th></tr>
      ${rows
        .map(
          (r) =>
            `<tr><td>${escape(formatTxDate(r.date))}</td>${nameOf ? `<td>${escape(nameOf(r.userId))}</td>` : ''}<td>${escape(r.title)}</td><td>${escape(r.category)}</td><td class="num">${r.type === 'income' ? '+' : '−'}${formatMoney(r.amount)}</td></tr>`,
        )
        .join('')}</table>`
      : '<p class="muted">No transactions in this period.</p>'
  }

  <footer>JanaFlow · Finance Budget Tracker · This report was generated on the device; no data was sent to a server.</footer>
</body></html>`;
}

let exportInProgress = false;

// exportReportPdf with the "Preparing…" / done / error toasts every export button shows
export async function exportReportWithToast(options, showToast) {
  if (exportInProgress) return; // a second tap while the share sheet is open would fail
  exportInProgress = true;
  showToast({ tone: 'info', icon: 'file-pdf-box', title: 'Preparing your PDF…', message: 'Collecting the report details.' });
  try {
    const result = await exportReportPdf(options);
    if (result.mode === 'downloaded') {
      showToast({ tone: 'success', icon: 'download', title: 'PDF downloaded', message: `${result.fileName} is saved in your Downloads folder.` });
      // Android shows no download notification for app-saved files, so confirm with a dialog
      if (Platform.OS === 'android') {
        Alert.alert('PDF downloaded ✓', `${result.fileName}\n\nSaved in: Downloads`, [
          { text: 'OK', style: 'cancel' },
          { text: 'Open PDF', onPress: () => openAndroidPdf(result.uri, showToast) },
        ]);
      }
    }
  } catch (e) {
    const message = String(e?.message || e);
    showToast({ tone: 'danger', icon: 'file-alert-outline', title: 'Could not create PDF', message });
    if (Platform.OS !== 'web') {
      // manual fallback: the system print screen has "Save as PDF"
      Alert.alert('Could not download PDF', message, [
        { text: 'Close', style: 'cancel' },
        ...(e?.html ? [{ text: 'Save via Print', onPress: () => Print.printAsync({ html: e.html }).catch(() => {}) }] : []),
      ]);
    }
  } finally {
    exportInProgress = false;
  }
}

const FLAG_GRANT_READ_URI_PERMISSION = 1;

// Opens the saved file in the phone's PDF viewer
async function openAndroidPdf(contentUri, showToast) {
  try {
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', { data: contentUri, type: 'application/pdf', flags: FLAG_GRANT_READ_URI_PERMISSION });
  } catch (e) {
    showToast({ tone: 'warning', icon: 'file-alert-outline', title: 'No PDF viewer found', message: 'Open the file from your Downloads folder or the Files app.' });
  }
}

// Android folder the user allowed once (Storage Access Framework); later downloads reuse it
let androidDownloadDir = null;

async function saveToAndroidDownloads(base64, fileName) {
  if (!androidDownloadDir) {
    const perm = await StorageAccessFramework.requestDirectoryPermissionsAsync(StorageAccessFramework.getUriForDirectoryInRoot('Download'));
    if (!perm.granted) return null;
    androidDownloadDir = perm.directoryUri;
  }
  try {
    const target = await StorageAccessFramework.createFileAsync(androidDownloadDir, fileName.replace(/\.pdf$/, ''), 'application/pdf');
    await writeAsStringAsync(target, base64, { encoding: EncodingType.Base64 });
    return target;
  } catch (e) {
    androidDownloadDir = null; // permission revoked or folder gone: ask again next time
    throw e;
  }
}

/**
 * Web: generates a real PDF file (jsPDF) and downloads it directly.
 * Android: creates the PDF and writes it straight into Downloads. The first time, Android asks
 * once for access to the Downloads folder; after that every export saves automatically.
 * iPhone (no Downloads folder) or if Android access is refused: opens the share sheet.
 * Last resort: the system print screen, whose "Save as PDF" saves the same report.
 */
export async function exportReportPdf(options) {
  if (Platform.OS === 'web') {
    return { mode: 'downloaded', fileName: downloadReportPdf(options) };
  }
  const html = buildReportHtml(options);
  const fileName = reportFileName(options.title, options.periodLabel);

  // each step is named so a failure on the phone says exactly where it stopped
  let step = 'Creating the PDF';
  try {
    const { uri, base64 } = await Print.printToFileAsync({ html, base64: Platform.OS === 'android' });
    if (Platform.OS === 'android') {
      step = 'Saving to Downloads';
      const saved = await saveToAndroidDownloads(base64, fileName);
      if (saved) return { mode: 'downloaded', fileName, uri: saved };
      step = 'Folder permission';
      throw new Error('Access to the Download folder was not given. Tap "Use this folder" → "Allow" when Android asks.');
    }
    step = 'Opening the share sheet';
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Save or share JanaFlow report', UTI: 'com.adobe.pdf' });
    return { mode: 'shared', uri };
  } catch (e) {
    const err = new Error(`${step} failed: ${e?.message || e}`);
    err.html = html;
    throw err;
  }
}
