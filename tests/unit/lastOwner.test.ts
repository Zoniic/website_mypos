import assert from "node:assert/strict";
import { test } from "node:test";
import { wouldLeaveNoOwner } from "../../src/lib/lastOwner";

const owner = (id: number) => ({ id, role: "owner" });
const editor = (id: number) => ({ id, role: "editor" });

test("demoting the only owner leaves no owner", () => {
  assert.equal(wouldLeaveNoOwner([owner(1), editor(2)], { kind: "setRole", id: 1, role: "editor" }), true);
});

test("deleting the only owner leaves no owner", () => {
  assert.equal(wouldLeaveNoOwner([owner(1), editor(2)], { kind: "delete", id: 1 }), true);
});

test("with two owners, demoting one is fine", () => {
  assert.equal(wouldLeaveNoOwner([owner(1), owner(2)], { kind: "setRole", id: 1, role: "editor" }), false);
});

test("with two owners, deleting one is fine", () => {
  assert.equal(wouldLeaveNoOwner([owner(1), owner(2)], { kind: "delete", id: 2 }), false);
});

test("deleting an editor is fine", () => {
  assert.equal(wouldLeaveNoOwner([owner(1), editor(2)], { kind: "delete", id: 2 }), false);
});

test("setting an editor to editor is fine", () => {
  assert.equal(wouldLeaveNoOwner([owner(1), editor(2)], { kind: "setRole", id: 2, role: "editor" }), false);
});

test("promoting an editor to owner is fine", () => {
  assert.equal(wouldLeaveNoOwner([owner(1), editor(2)], { kind: "setRole", id: 2, role: "owner" }), false);
});

test("self-demote with another owner present is fine", () => {
  assert.equal(wouldLeaveNoOwner([owner(1), owner(2), editor(3)], { kind: "setRole", id: 1, role: "editor" }), false);
});

test("self-demote of the only owner is refused", () => {
  assert.equal(wouldLeaveNoOwner([owner(1)], { kind: "setRole", id: 1, role: "editor" }), true);
});

test("two owners demoting each other one after the other: the second is refused", () => {
  const first = [owner(1), owner(2)];
  assert.equal(wouldLeaveNoOwner(first, { kind: "setRole", id: 1, role: "editor" }), false);
  const afterFirst = [editor(1), owner(2)];
  assert.equal(wouldLeaveNoOwner(afterFirst, { kind: "setRole", id: 2, role: "editor" }), true);
});
