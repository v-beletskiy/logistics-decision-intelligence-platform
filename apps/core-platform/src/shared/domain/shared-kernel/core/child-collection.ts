import { DomainException } from "../exceptions/domain.exception";
import { ChildChanges, type ChildChangeSet } from "./child-changes";

/**
 * Owns an ordered list of child entities of an aggregate together with the
 * insert/update/remove tracking required to persist them explicitly.
 *
 * The aggregate never reads the tracking directly for its business rules; it
 * uses `add`/`replace`/`remove`/`touch`/`reorder`/`all`, and the repository
 * reads `changes()` to build its insert/update/delete commands. The first
 * element is returned via `first()` for the common single-child case.
 */
export class ChildCollection<TChild> {
  private readonly items: TChild[];
  private readonly tracker: ChildChanges<TChild>;

  constructor(
    private readonly idOf: (child: TChild) => string,
    initial: readonly TChild[] = [],
    initialAreInserts = false,
  ) {
    this.items = [...initial];
    this.tracker = new ChildChanges(idOf);
    if (initialAreInserts) {
      for (const child of this.items) {
        this.tracker.trackInsert(child);
      }
    }
  }

  add(child: TChild): void {
    this.items.push(child);
    this.tracker.trackInsert(child);
  }

  replace(id: string, child: TChild): void {
    const index = this.indexOf(id);
    if (index === -1) {
      throw new DomainException("The child does not belong to this aggregate.");
    }
    this.items[index] = child;
    this.tracker.trackUpdate(child);
  }

  remove(id: string): void {
    const index = this.indexOf(id);
    if (index === -1) {
      throw new DomainException("The child does not belong to this aggregate.");
    }
    this.items.splice(index, 1);
    this.tracker.trackRemoval(id);
  }

  /** Marks an existing child as modified after an in-place state change. */
  touch(id: string): void {
    const index = this.indexOf(id);
    if (index === -1) {
      throw new DomainException("The child does not belong to this aggregate.");
    }
    this.tracker.trackUpdate(this.items[index]);
  }

  all(): readonly TChild[] {
    return [...this.items];
  }

  first(): TChild | undefined {
    return this.items[0];
  }

  get length(): number {
    return this.items.length;
  }

  changes(): ChildChangeSet<TChild> {
    return this.tracker.toSnapshot();
  }

  private indexOf(id: string): number {
    return this.items.findIndex((child) => this.idOf(child) === id);
  }
}
