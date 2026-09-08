# Candidate Field

Candidate Field is the first renderer investigation after Search Flow Explorer.
It renders a deterministic collection of synthetic candidates and keeps three
things stable while the state changes: candidate ids, selection, and the HTML
explanation path.

The public view uses SVG by default and exposes product volumes of 50, 250,
1,000, and 5,000 marks. The experimental Canvas 2D layer is available at
`/?demo=candidate-field&renderer=canvas`; it uses the same model, state, pointer
selection, and HTML details path.

The comparison view is available at `/?demo=candidate-field-comparison`. It
keeps renderer, state, and volume presets bounded, measures a fresh renderer
mount directionally, and reports when a renderer-specific ceiling prevents a
stress workload from mounting. The repeatable external profile is:

```bash
pnpm stress:candidate-field
```

The profile uses a temporary external Chrome context and reports product and
stress results as evidence, not as a universal performance claim. PR #8 does
not choose SVG or Canvas; that decision belongs to the repeated evidence note.
