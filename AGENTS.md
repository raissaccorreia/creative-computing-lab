# Agent guidelines for Creative Computing Lab

This repository is a public lab for small, executable experiments in creative computing. Agents working here should treat it as both a demonstration space and a reusable technical reference—not a product, a premature library, or a loose collection of unrelated samples.

## Purpose

Each experiment should be, at the same time:

- an executable demonstration of a few clear principles;
- a reusable technical reference;
- a public artifact understandable by other developers;
- a recorded experiment with results, limitations, and a decision.

## Agents must

- Keep one problem, one primary demonstration, and one success criterion per experiment.
- Use English for names, code, APIs, commits, and public documentation.
- Keep public docs short, clear, and honest about scope.
- Explain in `README.md`: problem, principles, demonstration, local setup, architecture, validation, reuse, and limitations.
- Prefer synthetic data, original assets, or materials with a compatible license.
- Include `.env.example` without credentials when external configuration is required.
- Pin versions and keep install and run steps reproducible.
- Apply accessibility, responsiveness, error states, and performance work in proportion to the experiment.
- Declare document language and avoid rigid assumptions about language, text direction, dates, numbers, and currency.
- Allow text expansion and use native `Intl` APIs for cultural formatting when needed.
- Test the behaviors that support the demonstration’s thesis.
- Record relevant decisions in short notes, not lengthy documentation.

## Agents must not

- Expose secrets, personal data, client data, private paths, or internal information.
- Copy code, content, fonts, or assets without checking license and attribution.
- Import proprietary code from other private projects.
- Expand scope without updating the question and success criterion.
- Add dependencies, paid services, or data collection without a documented need.
- Present prototypes, benchmarks, or experimental security as production-ready.
- Hide limitations, negative results, or incompatibilities.
- Generate generic portfolio pages that distract from the demonstration.

## Minimal public structure

```text
.
├── AGENTS.md
├── README.md
├── LICENSE
├── .gitignore
├── .env.example        # only when needed
├── docs/               # decisions or results when necessary
├── src/
└── tests/
```

Structure may change with the technology, but demonstration, documentation, and validation should stay easy to find.

## Definition of done

An experiment is ready to publish when it:

- installs and runs from the repository instructions;
- offers a clear demonstration in a few minutes;
- shows which principles are being demonstrated;
- has automated validation appropriate to the risk;
- reports relevant performance, accessibility, and limitations;
- contains no private or unlicensed material;
- states exactly what can be reused elsewhere;
- ends with a decision: continue, incorporate, reformulate, or archive.

## Before publishing

Review Git history, ignored files, environment variables, sample data, licenses, links, metadata, and visible copy. Publish only what can remain public permanently.
