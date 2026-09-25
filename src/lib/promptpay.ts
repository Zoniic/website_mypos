/**
 * PromptPay "Thai QR Payment" payload (EMVCo merchant-presented QR), the
 * format every Thai banking app scans. With an amount it's a one-time
 * "dynamic" QR, so the customer can't mistype the total.
 *
 * Spec summary: TLV fields (2-digit ID, 2-digit length, value), merchant
 * account in field 29 under PromptPay's AID, currency 764 (THB), country
 * TH, and a CRC16-CCITT (0xFFFF, poly 0x1021) checksum in field 63.
 */

const PROMPTPAY_AID = "A000000677010111";

function field(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

/** CRC16/CCITT-FALSE. Check value for "123456789" is 0x29B1. */
export function crc16(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function accountField(id: string): string {
  if (id.length === 10) {
    // Mobile: country code 66 without the leading 0, left-padded to 13 digits.
    return field("01", `0066${id.slice(1)}`);
  }
  if (id.length === 13) return field("02", id); // National ID / tax ID
  return field("03", id); // 15-digit e-wallet ID
}

/**
 * @param target Digits only: 10-digit mobile, 13-digit national/tax ID or
 *   15-digit e-wallet (see cleanPromptPayId).
 * @param amount THB; omit for an open-amount (static) QR.
 */
export function promptPayPayload(target: string, amount?: number): string {
  const body =
    field("00", "01") +
    field("01", amount ? "12" : "11") +
    field("29", field("00", PROMPTPAY_AID) + accountField(target)) +
    field("58", "TH") +
    field("53", "764") +
    (amount ? field("54", amount.toFixed(2)) : "") +
    "6304";
  return body + crc16(body);
}
