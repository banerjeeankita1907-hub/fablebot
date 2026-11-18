import { GENRES, generateStorySeed, toMarkdown } from "./engine.js";

const STORAGE_KEY = "fablebot.saved-seeds.v1";
const $ = (selector) => document.querySelector(selector);
let currentStory = null;

function safeSavedStories() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data)
      ? data.filter((story) => story && typeof story.title === "string" && Array.isArray(story.beats)).slice(0, 8)
      : [];
  } catch {
    return [];
  }
}

let savedStories = safeSavedStories();

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderStory(story) {
  currentStory = story;
  $("#empty-state").hidden = true;
  const result = $("#story-result");
  result.hidden = false;
  $("#story-title").textContent = story.title;
  $("#story-logline").textContent = story.logline;
  $("#story-genre").textContent = story.genreLabel;
  $("#story-seed").textContent = `SEED · ${story.seed}`;

  const beats = $("#story-beats");
  beats.replaceChildren();
  story.beats.forEach((beat, index) => {
    const card = el("article", "beat-card");
    const number = el("span", "beat-number", String(index + 1).padStart(2, "0"));
    const content = el("div", "beat-content");
    content.append(el("h3", "", beat.label), el("p", "", beat.text));
    card.append(number, content);
    beats.append(card);
  });
  saveStory(story);
}

function saveStory(story) {
  savedStories = [story, ...savedStories.filter((item) => item.seed !== story.seed || item.theme !== story.theme)].slice(0, 8);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedStories));
  } catch {
    // Story generation remains usable when storage is disabled or full.
  }
  renderSaved();
}

function renderSaved() {
  const list = $("#saved-list");
  list.replaceChildren();
  if (!savedStories.length) {
    list.append(el("p", "saved-empty", "Your generated outlines will collect here."));
    return;
  }
  savedStories.forEach((story, index) => {
    const item = el("button", "saved-item");
    item.type = "button";
    item.dataset.index = String(index);
    item.append(el("span", "saved-index", String(index + 1).padStart(2, "0")), el("span", "saved-title", story.title), el("span", "saved-arrow", "↗"));
    list.append(item);
  });
}

function buildStory() {
  const data = new FormData($("#story-form"));
  const story = generateStorySeed({
    genre: data.get("genre"),
    theme: data.get("theme"),
    hero: data.get("hero"),
    seed: data.get("seed"),
  });
  renderStory(story);
}

$("#story-form").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    buildStory();
  } catch (error) {
    const note = $(".form-note");
    note.textContent = error.message;
    note.classList.add("error");
  }
});

$("#story-form").addEventListener("input", () => {
  $(".form-note").textContent = "Change the seed word to explore a different combination. Keep it to recreate the same outline.";
  $(".form-note").classList.remove("error");
});

$("#saved-list").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-index]");
  if (!button) return;
  const story = savedStories[Number(button.dataset.index)];
  if (story) renderStory(story);
});

$("#copy-button").addEventListener("click", async () => {
  if (!currentStory) return;
  try {
    await navigator.clipboard.writeText(toMarkdown(currentStory));
    $("#copy-button").textContent = "Copied ✓";
  } catch {
    $("#copy-button").textContent = "Clipboard unavailable";
  }
  setTimeout(() => { $("#copy-button").textContent = "Copy outline"; }, 1800);
});

$("#download-button").addEventListener("click", () => {
  if (!currentStory) return;
  const file = new Blob([toMarkdown(currentStory)], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = el("a");
  anchor.href = url;
  anchor.download = `${currentStory.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "story-seed"}.md`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
});

$("#remix-button").addEventListener("click", () => {
  const seedInput = $("#seed");
  const base = seedInput.value.trim() || "fablebot";
  seedInput.value = `${base}-${Math.random().toString(36).slice(2, 6)}`.slice(0, 48);
  buildStory();
});

renderSaved();
