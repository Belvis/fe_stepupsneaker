export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    notation: "standard",
    currency: "VND",
    currencyDisplay: "symbol",
  }).format(value);
}
