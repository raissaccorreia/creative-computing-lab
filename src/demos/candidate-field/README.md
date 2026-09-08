# Candidate Field

Candidate Field is the first renderer investigation after Search Flow Explorer.
It renders a deterministic collection of synthetic candidates and keeps three
things stable while the state changes: candidate ids, selection, and the HTML
explanation path.

The public view uses SVG by default and exposes product volumes of 50, 250,
1,000, and 5,000 marks. The experimental Canvas 2D layer is available at
`/?demo=candidate-field&renderer=canvas`; it uses the same model, state, pointer
selection, and HTML details path.

The comparison harness, repeated measurements, and guarded stress profiles
belong to the next layers of the investigation. This PR does not claim that
Canvas is faster or better than SVG.
