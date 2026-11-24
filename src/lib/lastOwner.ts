/** Pure last-owner rule, kept apart from the database code so tests can import it. */
export type OwnerChange = { kind: "delete"; id: number } | { kind: "setRole"; id: number; role: string };

/** True when applying the change would leave the system without an owner. */
export function wouldLeaveNoOwner(users: { id: number; role: string }[], change: OwnerChange): boolean {
  const after = users
    .filter((u) => !(change.kind === "delete" && u.id === change.id))
    .map((u) => (change.kind === "setRole" && u.id === change.id ? { ...u, role: change.role } : u));
  return !after.some((u) => u.role === "owner");
}
