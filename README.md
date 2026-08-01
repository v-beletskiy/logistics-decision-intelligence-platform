## Documentation

The project documentation is organized into multiple areas:

- **MVP** — the first end-to-end delivery scope and its explicit exclusions
- **C4** — software architecture (LikeC4 DSL)
- **ADRs** — Architecture Decision Records
- **Domain** — Domain-Driven Design documentation (Markdown and Excalidraw)

### C4 Diagrams

The architecture is maintained using LikeC4.

After modifying any `.c4` files, regenerate the rendered diagrams:

```bash
pnpm c4:export
```

Commit both the `.c4` sources and the generated diagrams.

### Domain Documentation

DDD diagrams are maintained as `.excalidraw` files. Can preview and edit via Excalidraw IDE extensions.

After modifying an Excalidraw diagram, export it as an **SVG** with the **same filename** and save it alongside the source file. This allows the diagrams to be previewed directly on GitHub while keeping the editable Excalidraw source under version control.

Example:

```text
context-map.excalidraw
context-map.svg
```

Commit both the `.excalidraw` source and the exported `.svg`.
