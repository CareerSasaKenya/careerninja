/**
 * Minimal A4 PDF from plain text. Used to email / store CVs without a browser.
 * Helvetica WinAnsi — non-latin characters are replaced with '?'.
 */

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const FONT_SIZE = 11;
const LINE_HEIGHT = 14;
const CHARS_PER_LINE = 90;

function pdfEscape(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, (ch) => {
      const code = ch.charCodeAt(0);
      if (code < 256) return `\\${code.toString(8).padStart(3, '0')}`;
      return '?';
    });
}

function wrapLine(line: string): string[] {
  const trimmed = line.replace(/\t/g, '  ');
  if (trimmed.length <= CHARS_PER_LINE) return [trimmed || ' '];
  const parts: string[] = [];
  let rest = trimmed;
  while (rest.length > CHARS_PER_LINE) {
    let cut = rest.lastIndexOf(' ', CHARS_PER_LINE);
    if (cut < 20) cut = CHARS_PER_LINE;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut).trimStart();
  }
  if (rest) parts.push(rest);
  return parts;
}

function wrapText(text: string): string[] {
  const lines: string[] = [];
  for (const raw of text.replace(/\r\n/g, '\n').split('\n')) {
    lines.push(...wrapLine(raw));
  }
  return lines.length ? lines : [' '];
}

function pageContent(lines: string[]): string {
  const commands = [
    'BT',
    `/F1 ${FONT_SIZE} Tf`,
    `${LINE_HEIGHT} TL`,
    `${MARGIN} ${PAGE_HEIGHT - MARGIN} Td`,
  ];
  for (const line of lines) {
    commands.push(`(${pdfEscape(line)}) Tj`, 'T*');
  }
  commands.push('ET');
  return commands.join('\n');
}

export function buildPlaintextPdf(text: string, title = 'CV'): Uint8Array {
  const allLines = wrapText(text);
  const linesPerPage = Math.max(1, Math.floor((PAGE_HEIGHT - MARGIN * 2) / LINE_HEIGHT));
  const pages: string[] = [];
  for (let i = 0; i < allLines.length; i += linesPerPage) {
    pages.push(pageContent(allLines.slice(i, i + linesPerPage)));
  }
  if (!pages.length) pages.push(pageContent([' ']));

  const objects: string[] = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');

  const kids = pages.map((_, i) => `${3 + i} 0 R`).join(' ');
  objects.push(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`);

  const contentStart = 3 + pages.length;
  pages.forEach((_, i) => {
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents ${contentStart + i} 0 R /Resources << /Font << /F1 ${contentStart + pages.length} 0 R >> >> >>`
    );
  });
  pages.forEach((stream) => {
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  const header = '%PDF-1.4\n';
  let body = '';
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(header.length + body.length);
    body += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefPos = header.length + body.length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  const safeTitle = pdfEscape(title.slice(0, 80));
  const trailer =
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info << /Title (${safeTitle}) /Creator (CareerSasa) >> >>\nstartxref\n${xrefPos}\n%%EOF\n`;

  return new TextEncoder().encode(header + body + xref + trailer);
}

export function pdfLooksValid(bytes: Uint8Array): boolean {
  const head = String.fromCharCode(...bytes.slice(0, 8));
  return head.startsWith('%PDF-');
}
