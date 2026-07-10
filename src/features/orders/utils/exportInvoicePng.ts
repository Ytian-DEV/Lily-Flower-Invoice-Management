import { toPng } from 'html-to-image';

export async function exportInvoicePng(element: HTMLElement, fileName: string) {
  await document.fonts.ready;

  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  });

  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
