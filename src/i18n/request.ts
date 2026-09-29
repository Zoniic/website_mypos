import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { getEditableMessages, getMessages } from "@/lib/messages";
import { isEditMode } from "@/lib/editMode";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await isEditMode()) ? await getEditableMessages(locale) : await getMessages(locale),
  };
});
