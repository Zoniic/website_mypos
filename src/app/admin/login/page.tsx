"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  const [error, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-2xl border border-border bg-surface-1 p-8"
      >
        <h1 className="text-xl font-bold">MYPOS Admin</h1>
        <p className="mt-1 text-sm text-text-2">Sign in to manage site content.</p>

        <label htmlFor="password" className="mt-6 block text-sm font-medium text-text-2">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-text-1"
        />

        {error && <p className="mt-3 text-sm text-error">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 w-full rounded-button bg-[image:var(--gradient-primary)] px-4 py-2.5 font-semibold text-text-1 shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
        >
          {isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
