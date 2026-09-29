import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { safeSitePath } from "./safePath";

/** Turns on "edit on site" mode for this browser and opens the page (default: Thai home). */
export async function GET(request: Request) {
  (await draftMode()).enable();
  redirect(safeSitePath(new URL(request.url).searchParams.get("path")));
}
