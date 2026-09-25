export const STATUS_LABELS: Record<string, string> = {
  pending_payment: "รอชำระเงิน",
  paid: "ชำระแล้ว",
  preparing: "กำลังเตรียมสินค้า",
  shipped: "จัดส่งแล้ว",
  completed: "สำเร็จ",
  cancelled: "ยกเลิก",
};

export const STATUS_STYLES: Record<string, string> = {
  pending_payment: "bg-primary-600 text-white",
  paid: "bg-success/15 text-success",
  preparing: "bg-accent-50 text-accent-600",
  shipped: "bg-accent-50 text-accent-600",
  completed: "bg-surface-2 text-text-2",
  cancelled: "bg-surface-2 text-text-3 line-through",
};

export const PAYMENT_LABELS: Record<string, string> = {
  promptpay: "PromptPay QR",
  bank_transfer: "โอนผ่านธนาคาร",
};
