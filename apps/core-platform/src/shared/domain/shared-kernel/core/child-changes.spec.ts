import * as assert from "node:assert/strict";
import { test } from "node:test";

import { ChildChanges } from "./child-changes";

interface FakeChild {
  readonly id: string;
  readonly name: string;
}

const idOf = (child: FakeChild): string => child.id;

test("tracks inserted children and exposes them in order", () => {
  const changes = new ChildChanges<FakeChild>(idOf);
  changes.trackInsert({ id: "1", name: "a" });
  changes.trackInsert({ id: "2", name: "b" });

  const snapshot = changes.toSnapshot();
  assert.deepEqual(
    snapshot.inserts.map((child) => child.id),
    ["1", "2"],
  );
  assert.equal(snapshot.updates.length, 0);
  assert.equal(snapshot.removedIds.length, 0);
});

test("tracks updated children by id", () => {
  const changes = new ChildChanges<FakeChild>(idOf);
  changes.trackUpdate({ id: "1", name: "changed" });

  const snapshot = changes.toSnapshot();
  assert.equal(snapshot.inserts.length, 0);
  assert.deepEqual(snapshot.updates, [{ id: "1", name: "changed" }]);
  assert.equal(snapshot.removedIds.length, 0);
});

test("tracks removed children by id", () => {
  const changes = new ChildChanges<FakeChild>(idOf);
  changes.trackRemoval("1");

  const snapshot = changes.toSnapshot();
  assert.equal(snapshot.inserts.length, 0);
  assert.equal(snapshot.updates.length, 0);
  assert.deepEqual(snapshot.removedIds, ["1"]);
});

test("a removal takes precedence over a pending update for the same id", () => {
  const changes = new ChildChanges<FakeChild>(idOf);
  changes.trackUpdate({ id: "1", name: "updated" });
  changes.trackRemoval("1");

  const snapshot = changes.toSnapshot();
  assert.equal(snapshot.updates.length, 0);
  assert.deepEqual(snapshot.removedIds, ["1"]);
});

test("an update after a removal is ignored", () => {
  const changes = new ChildChanges<FakeChild>(idOf);
  changes.trackRemoval("1");
  changes.trackUpdate({ id: "1", name: "should not persist" });

  const snapshot = changes.toSnapshot();
  assert.equal(snapshot.updates.length, 0);
  assert.deepEqual(snapshot.removedIds, ["1"]);
});

test("a removal clears a pending insert for the same id", () => {
  const changes = new ChildChanges<FakeChild>(idOf);
  changes.trackInsert({ id: "1", name: "new" });
  changes.trackRemoval("1");

  const snapshot = changes.toSnapshot();
  assert.equal(snapshot.inserts.length, 0);
  assert.deepEqual(snapshot.removedIds, ["1"]);
});

test("hasChanges is false when nothing is tracked", () => {
  const changes = new ChildChanges<FakeChild>(idOf);
  assert.equal(changes.hasChanges(), false);
  changes.trackUpdate({ id: "1", name: "a" });
  assert.equal(changes.hasChanges(), true);
});

test("an update of a pending insert refreshes the insert instead of tracking an update", () => {
  const changes = new ChildChanges<FakeChild>(idOf);
  changes.trackInsert({ id: "1", name: "new" });
  changes.trackUpdate({ id: "1", name: "final" });

  const snapshot = changes.toSnapshot();
  assert.deepEqual(snapshot.inserts, [{ id: "1", name: "final" }]);
  assert.equal(snapshot.updates.length, 0);
});
