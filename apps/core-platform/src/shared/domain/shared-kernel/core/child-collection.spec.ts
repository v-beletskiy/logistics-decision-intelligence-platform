import * as assert from "node:assert/strict";
import { test } from "node:test";

import { ChildCollection } from "./child-collection";

interface FakeChild {
  readonly id: string;
  readonly name: string;
}

const idOf = (child: FakeChild): string => child.id;

const child = (id: string, name: string): FakeChild => ({ id, name });

test("add pushes children in order and tracks them as inserts", () => {
  const collection = new ChildCollection<FakeChild>(idOf);
  collection.add(child("1", "a"));
  collection.add(child("2", "b"));

  assert.deepEqual(collection.all(), [child("1", "a"), child("2", "b")]);
  assert.equal(collection.length, 2);
  const changes = collection.changes();
  assert.deepEqual(changes.inserts, [child("1", "a"), child("2", "b")]);
  assert.equal(changes.updates.length, 0);
  assert.equal(changes.removedIds.length, 0);
});

test("replace swaps a child in place and tracks an update", () => {
  const collection = new ChildCollection<FakeChild>(idOf, [child("1", "a")]);
  const updated = child("1", "changed");
  collection.replace("1", updated);

  assert.deepEqual(collection.all(), [updated]);
  const changes = collection.changes();
  assert.equal(changes.inserts.length, 0);
  assert.deepEqual(changes.updates, [updated]);
  assert.equal(changes.removedIds.length, 0);
});

test("remove splices a child out and tracks a removal", () => {
  const collection = new ChildCollection<FakeChild>(idOf, [
    child("1", "a"),
    child("2", "b"),
  ]);
  collection.remove("1");

  assert.deepEqual(collection.all(), [child("2", "b")]);
  const changes = collection.changes();
  assert.equal(changes.inserts.length, 0);
  assert.equal(changes.updates.length, 0);
  assert.deepEqual(changes.removedIds, ["1"]);
});

test("initial children are tracked as inserts when marked as new", () => {
  const collection = new ChildCollection<FakeChild>(
    idOf,
    [child("1", "a"), child("2", "b")],
    true,
  );

  assert.deepEqual(collection.changes().inserts, [
    child("1", "a"),
    child("2", "b"),
  ]);
});

test("initial children are not tracked when loaded for update", () => {
  const collection = new ChildCollection<FakeChild>(idOf, [child("1", "a")]);

  assert.equal(collection.changes().inserts.length, 0);
  assert.equal(collection.changes().updates.length, 0);
  assert.equal(collection.changes().removedIds.length, 0);
});

test("all returns a copy so callers cannot mutate the collection", () => {
  const collection = new ChildCollection<FakeChild>(idOf, [child("1", "a")]);
  (collection.all() as FakeChild[]).splice(0, 1);

  assert.equal(collection.length, 1);
});

test("first returns the head child or undefined", () => {
  const collection = new ChildCollection<FakeChild>(idOf, [child("1", "a")]);
  assert.deepEqual(collection.first(), child("1", "a"));
  assert.equal(new ChildCollection<FakeChild>(idOf).first(), undefined);
});

test("replace and remove reject unknown child ids", () => {
  const collection = new ChildCollection<FakeChild>(idOf, [child("1", "a")]);

  assert.throws(
    () => collection.replace("99", child("99", "x")),
    /does not belong/,
  );
  assert.throws(() => collection.remove("99"), /does not belong/);
});

test("touch tracks an existing child as an update after in-place change", () => {
  const collection = new ChildCollection<FakeChild>(idOf, [child("1", "a")]);
  collection.touch("1");

  assert.deepEqual(collection.changes().updates, [child("1", "a")]);
  assert.equal(collection.changes().inserts.length, 0);
  assert.equal(collection.changes().removedIds.length, 0);
});

test("touch rejects unknown child ids", () => {
  const collection = new ChildCollection<FakeChild>(idOf, [child("1", "a")]);

  assert.throws(() => collection.touch("99"), /does not belong/);
});
