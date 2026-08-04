/**
 * Read-only projection of the child changes recorded by an aggregate.
 */
export interface ChildChangeSet<TChild> {
  readonly inserts: readonly TChild[];
  readonly updates: readonly TChild[];
  readonly removedIds: readonly string[];
}

/**
 * Tracks which child entities of an aggregate changed since it was loaded,
 * so a repository can persist exactly the insert/update/delete commands
 * required. Children are classified deterministically by the domain
 * (created vs. loaded-then-modified vs. removed); no snapshots are needed.
 *
 * A removal takes precedence over a pending update for the same child, and an
 * update of a pending insert refreshes that insert instead of tracking a
 * separate update.
 */
export class ChildChanges<TChild> {
  private readonly inserts = new Map<string, TChild>();
  private readonly updates = new Map<string, TChild>();
  private readonly removedIds = new Set<string>();

  constructor(private readonly idOf: (child: TChild) => string) {}

  trackInsert(child: TChild): void {
    const id = this.idOf(child);
    this.inserts.set(id, child);
  }

  trackUpdate(child: TChild): void {
    const id = this.idOf(child);
    if (this.removedIds.has(id)) return;
    if (this.inserts.has(id)) {
      this.inserts.set(id, child);
      return;
    }
    this.updates.set(id, child);
  }

  trackRemoval(id: string): void {
    this.updates.delete(id);
    this.inserts.delete(id);
    this.removedIds.add(id);
  }

  toSnapshot(): ChildChangeSet<TChild> {
    return {
      inserts: [...this.inserts.values()],
      updates: [...this.updates.values()],
      removedIds: [...this.removedIds],
    };
  }

  hasChanges(): boolean {
    return (
      this.inserts.size > 0 || this.updates.size > 0 || this.removedIds.size > 0
    );
  }
}
