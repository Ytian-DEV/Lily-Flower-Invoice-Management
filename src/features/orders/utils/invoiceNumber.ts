export function createInvoiceNumber(sequence: number, date = new Date()) {
  const datePart = date.toISOString().slice(0, 10).replaceAll('-', '');
  const sequencePart = sequence.toString().padStart(4, '0');

  return `INV-${datePart}-${sequencePart}`;
}
