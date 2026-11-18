# FableBot — Story Seed Studio

A small offline-first writing tool that turns a genre, theme, character, and seed word into a five-beat story outline. It is designed to help a human writer get unstuck — not to replace the writer.

## Features

- Four story palettes: fantasy, science fiction, mystery, and cozy wonder.
- Deterministic generation: identical inputs produce the same outline.
- Five narrative beats: opening image, strange arrival, complication, turning point, and resolution.
- Repeatable seed words for exploration and collaboration.
- Copy or download an outline as Markdown.
- Recent story notebook stored locally in the browser.
- No account, API key, network call, model download, or runtime dependency.

## Run locally

Requires Node.js 20+ for tests. The browser app is static.

```bash
git clone https://github.com/banerjeeankita1907-hub/fablebot.git
cd fablebot
npm test
npm run check
python -m http.server 4174
```

Open [http://localhost:4174](http://localhost:4174).

## How the generator works

The engine hashes the selected genre, theme, character, and seed into a deterministic pseudo-random stream. It then selects one item from each curated genre palette and assembles a five-beat outline. The same inputs always reproduce the same outline; changing the seed explores a different combination.

This is a transparent template-based generator. **It does not call an LLM or load a BERT model.** The old repository contained tokenizer metadata and an empty ONNX placeholder, not a usable inference checkpoint; those unused placeholder assets have been removed so the project does not imply model capabilities it does not have.

## Project structure

```text
index.html          Accessible story-studio shell
src/app.js          Browser UI, notebook, copy and Markdown download
src/engine.js       Deterministic generation and Markdown export
tests/engine.test.js
.github/workflows/ci.yml
```

## Tests

```bash
npm run check
npm test
```

Tests cover determinism, genre coverage, input validation, defaults, and Markdown export using Node's built-in test runner.

## Privacy

Recent outlines are saved in this browser's `localStorage`. There is no server synchronization. Do not use a shared browser for private writing; clear browser storage to remove the local notebook.

## License

MIT. See [LICENSE](LICENSE).
