import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { safeSitePath } from "../safePath";

/** Leaves edit mode and returns to the same page as a normal visitor. */
export async function GET(request: Request) {
  (await draftMode()).disable();
  redirect(safeSitePath(new URL(request.url).searchParams.get("path")));
}
