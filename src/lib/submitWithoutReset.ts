"use client";

import { startTransition, type FormEvent } from "react";

/**
 * Submit handler for `<form onSubmit>` that dispatches a useActionState
 * action without React's automatic post-action form reset. Passing the
 * action to `<form action>` instead makes React clear every uncontrolled
 * field (and every selected file) once the action returns — even when it
 * returns a validation error — forcing the user to re-enter everything.
 */
export function submitWithoutReset(formAction: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };
}
