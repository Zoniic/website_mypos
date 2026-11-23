import { HONEYPOT_FIELD } from "@/lib/formInput";

/**
 * Hidden anti-spam field for public forms. People never see or fill it;
 * simple bots that fill every input do, and the server action then drops the
 * submission (see isBotSubmission in src/lib/formInput.ts).
 */
export function HoneypotField() {
  return (
    <input
      type="text"
      name={HONEYPOT_FIELD}
      tabIndex={-1}
      autoComplete="off"
      defaultValue=""
      className="hidden"
      aria-hidden="true"
    />
  );
}
