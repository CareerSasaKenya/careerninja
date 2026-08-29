'use client';

/**
 * Client-side A4 PDF from a React element (CV or cover letter templates).
 * Uses html2pdf.js so Tailwind classes on the mounted node still apply.
 */

import type { ReactElement } from 'react';

export async function downloadReactElementAsPdf(options: {
  element: ReactElement;
  filename: string;
  waitMs?: number;
}): Promise<void> {
  const { element, filename, waitMs = 300 } = options;

  const [html2pdf, { createRoot }] = await Promise.all([
    import('html2pdf.js').then((m) => m.default),
    import('react-dom/client'),
  ]);

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0';
  wrapper.style.left = '-9999px';
  wrapper.style.width = '794px';
  wrapper.style.zIndex = '-1';
  document.body.appendChild(wrapper);

  const root = createRoot(wrapper);

  try {
    await new Promise<void>((resolve) => {
      root.render(element);
      setTimeout(() => resolve(), waitMs);
    });

    const templateEl = wrapper.firstElementChild as HTMLElement | null;
    if (!templateEl) {
      throw new Error('Nothing rendered to export');
    }

    const unlockOverflow = (el: HTMLElement) => {
      el.style.height = 'auto';
      el.style.maxHeight = 'none';
      el.style.overflow = 'visible';
      Array.from(el.children).forEach((child) => unlockOverflow(child as HTMLElement));
    };
    unlockOverflow(templateEl);
    templateEl.style.minHeight = '1123px';

    const opt = {
      margin: 0,
      filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    await (html2pdf as any)().set(opt).from(templateEl).save();
  } finally {
    root.unmount();
    wrapper.remove();
  }
}

export function pdfFilename(title: string): string {
  const base = title.trim().replace(/\s+/g, '_') || 'document';
  return base.endsWith('.pdf') ? base : `${base}.pdf`;
}
