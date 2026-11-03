// Orders placed on this phone/computer, so customers can track them
// without keeping the order number. Stored only in this browser.
const KEY = "umwambaro-my-orders";
const MAX = 20;

export type MyOrder = { orderNumber: string; phone: string; total: number; placedAt: string };

export function getMyOrders(): MyOrder[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((o) => o && typeof o.orderNumber === "string" && typeof o.phone === "string") : [];
  } catch {
    return [];
  }
}

export function saveMyOrder(order: MyOrder) {
  try {
    const rest = getMyOrders().filter((o) => o.orderNumber !== order.orderNumber);
    localStorage.setItem(KEY, JSON.stringify([order, ...rest].slice(0, MAX)));
  } catch { /* storage blocked: tracking by number still works */ }
}

export function forgetMyOrder(orderNumber: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify(getMyOrders().filter((o) => o.orderNumber !== orderNumber)));
  } catch { /* ignore */ }
}
