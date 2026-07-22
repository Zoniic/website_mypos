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

        <label htmlFor="email" className="mt-6 block text-sm font-medium text-text-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoFocus
          autoComplete="username"
          className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40 px-3 py-2 text-text-1"
        />

        <label htmlFor="password" className="mt-4 block text-sm font-medium text-text-2">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40 px-3 py-2 text-text-1"
        />

        {error && <p className="mt-3 text-sm text-error">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 w-full rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-4 py-2.5 font-semibold text-white shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
        >
          {isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
