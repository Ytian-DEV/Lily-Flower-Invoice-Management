function inlineComputedStyles(source: Element, target: Element) {
  const computedStyle = window.getComputedStyle(source);

  Array.from(computedStyle).forEach((property) => {
    target.setAttribute(
      'style',
      `${target.getAttribute('style') ?? ''}${property}:${computedStyle.getPropertyValue(property)};`,
    );
  });

  Array.from(source.children).forEach((sourceChild, index) => {
    const targetChild = target.children.item(index);

    if (targetChild) {
      inlineComputedStyles(sourceChild, targetChild);
    }
  });
}

async function imageToDataUrl(image: HTMLImageElement) {
  const response = await fetch(image.currentSrc || image.src);
  const blob = await response.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Invoice image could not be exported.'));
    reader.readAsDataURL(blob);
  });
}

async function inlineImages(source: HTMLElement, target: HTMLElement) {
  const sourceImages = Array.from(source.querySelectorAll('img'));
  const targetImages = Array.from(target.querySelectorAll('img'));

  await Promise.all(
    sourceImages.map(async (sourceImage, index) => {
      const targetImage = targetImages[index];

      if (!targetImage || !sourceImage.src) {
        return;
      }

      targetImage.src = await imageToDataUrl(sourceImage);
    }),
  );
}

export async function exportInvoicePng(element: HTMLElement, fileName: string) {
  await document.fonts.ready;

  const scale = 2;
  const rect = element.getBoundingClientRect();
  const clone = element.cloneNode(true) as HTMLElement;

  inlineComputedStyles(element, clone);
  await inlineImages(element, clone);
  clone.style.margin = '0';
  clone.style.width = `${rect.width}px`;

  const html = new XMLSerializer().serializeToString(clone);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width * scale}" height="${rect.height * scale}" viewBox="0 0 ${rect.width} ${rect.height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">${html}</div>
      </foreignObject>
    </svg>
  `;
  const image = new Image();
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Invoice PNG export failed.'));
    image.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;

  const context = canvas.getContext('2d');

  if (!context) {
    URL.revokeObjectURL(url);
    throw new Error('Canvas export is not supported in this browser.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);

  const pngUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = pngUrl;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
