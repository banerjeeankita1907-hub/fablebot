import test from "node:test";
import assert from "node:assert/strict";
import { GENRES, generateStorySeed, toMarkdown } from "../src/engine.js";

const input = { genre: "mystery", theme: "a missing song", hero: "Mira", seed: "blue-hour" };

test("generates the same story for the same inputs", () => {
  assert.deepEqual(generateStorySeed(input), generateStorySeed(input));
});

test("returns a complete five-beat outline and a writing prompt", () => {
  const story = generateStorySeed(input);
  assert.equal(story.genreLabel, "Mystery");
  assert.equal(story.beats.length, 5);
  assert.ok(story.title.length > 0);
  assert.ok(story.logline.includes("Mira"));
  assert.ok(story.writingPrompt.includes("a missing song"));
});

test("supports every published genre pack", () => {
  for (const genre of Object.keys(GENRES)) {
    const story = generateStorySeed({ genre, theme: "a secret garden", hero: "Ari", seed: "test" });
    assert.equal(story.genre, genre);
    assert.equal(story.beats.length, 5);
  }
});

test("rejects unsupported genres and invalid field lengths", () => {
  assert.throws(() => generateStorySeed({ genre: "western", theme: "a secret", hero: "Mira" }), /supported genre/);
  assert.throws(() => generateStorySeed({ theme: "", hero: "Mira" }), /Theme cannot be empty/);
  assert.throws(() => generateStorySeed({ theme: "x".repeat(71), hero: "Mira" }), /70 characters/);
  assert.throws(() => generateStorySeed({ theme: "a secret", hero: "x".repeat(37) }), /36 characters/);
});

test("uses a documented default hero and seed when omitted", () => {
  const story = generateStorySeed({ theme: "a quiet signal" });
  assert.equal(story.hero, "The Wanderer");
  assert.equal(story.seed, "fablebot-default");
});

test("exports the generated outline as Markdown", () => {
  const markdown = toMarkdown(generateStorySeed(input));
  assert.match(markdown, /^# /);
  assert.match(markdown, /## Writing prompt/);
  assert.match(markdown, /### 5\. The resolution/);
  assert.throws(() => toMarkdown(null), /required/);
});
