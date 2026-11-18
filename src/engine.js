export const GENRES = Object.freeze({
  fantasy: {
    label: "Fantasy",
    settings: ["the floating gardens of Aster", "a city built around a sleeping giant", "the last library of the old kingdom"],
    wonders: ["a map that changes when someone tells the truth", "a bell that rings before a storm", "a river that carries forgotten names"],
    companions: ["a retired dragon-cartographer", "a clockmaker who speaks to moths", "a quiet apprentice with an impossible memory"],
    pressures: ["the winter star has vanished from the sky", "the royal archive has begun erasing its own books", "every mirror shows tomorrow instead of today"],
    reveals: ["the missing wonder has been protecting the town from its own wish", "the apparent villain has been keeping an older promise", "the map was drawn by the hero's future self"],
    endings: ["the kingdom is saved, but its oldest rule must change", "the hero returns with a smaller treasure and a truer name", "a new path appears, and the hero chooses not to walk it alone"],
  },
  "science-fiction": {
    label: "Science fiction",
    settings: ["an orbital greenhouse above a silent Earth", "a research station at the edge of a mapped wormhole", "a city where memories can be backed up"],
    wonders: ["a signal arriving from a satellite that was never launched", "a machine that predicts questions but not answers", "a seed bank containing tomorrow's weather"],
    companions: ["an archivist AI with one missing day", "a pilot who refuses to use autopilot", "a botanist who studies extinct sound"],
    pressures: ["the station's clock has drifted eleven years overnight", "the colony receives two contradictory rescue messages", "someone has quietly rewritten the mission's destination"],
    reveals: ["the signal is a message sent by the crew's own experiment", "the backup contains a memory no one remembers making", "the safest route is the one the ship was built to avoid"],
    endings: ["the crew chooses a slower future they can understand", "the discovery is shared rather than owned", "the mission succeeds, but the definition of home changes"],
  },
  mystery: {
    label: "Mystery",
    settings: ["a rain-soaked railway hotel", "a seaside museum before its reopening", "a neighbourhood where every clock stopped at 9:17"],
    wonders: ["a guestbook entry written in disappearing ink", "a key that fits no door in the building", "a photograph with one extra shadow"],
    companions: ["a careful night receptionist", "a retired stage magician", "a local reporter who collects unsent letters"],
    pressures: ["the only witness changes their story at every telling", "the evidence room has been opened from the inside", "a second copy of the missing object appears"],
    reveals: ["the most reliable witness has been protecting someone, not lying for profit", "the timeline was correct, but the order of events was not", "the clue was hidden in a perfectly ordinary act of kindness"],
    endings: ["the case closes with an apology instead of an arrest", "the truth is revealed, and one mystery is deliberately left open", "the detective finds the answer in the place everyone overlooked"],
  },
  cozy: {
    label: "Cozy wonder",
    settings: ["a tiny bookshop beside a canal", "a village bakery at the end of a windy lane", "a greenhouse behind an old community hall"],
    wonders: ["a recipe that tastes like a forgotten summer", "a parcel delivered to the same doorstep every spring", "a garden that blooms only when neighbours cooperate"],
    companions: ["a retired postmaster with an excellent memory", "a shy ceramic artist", "a child who asks unusually precise questions"],
    pressures: ["the town's favourite gathering place may have to close", "a long-standing misunderstanding resurfaces before the festival", "the community garden has lost its source of water"],
    reveals: ["the missing ingredient has been shared among the neighbours all along", "the old letter was meant for the whole village", "the person everyone thought had left has been quietly helping"],
    endings: ["the festival begins with a table big enough for everyone", "the shop reopens with a new purpose and familiar faces", "the final clue becomes the first page of a shared project"],
  },
});

const TITLES = [
  "The Last Map of {place}",
  "A Small Light for {place}",
  "The Secret Between {place}",
  "Where the Story Begins",
  "The Quiet Wonder of {place}",
];

function cleanText(value, field, maxLength, fallback) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text && fallback) return fallback;
  if (!text) throw new RangeError(`${field} cannot be empty`);
  if (text.length > maxLength) throw new RangeError(`${field} must be ${maxLength} characters or fewer`);
  return text;
}

function hash(value) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function randomFor(seed) {
  let state = hash(seed) || 1;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function choose(items, random) {
  return items[Math.floor(random() * items.length)];
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function generateStorySeed({ genre = "fantasy", theme, hero, seed = "" } = {}) {
  if (!Object.hasOwn(GENRES, genre)) throw new RangeError("Choose a supported genre");
  const cleanTheme = cleanText(theme, "Theme", 70);
  const cleanHero = cleanText(hero, "Hero", 36, "The Wanderer");
  const cleanSeed = cleanText(seed, "Seed", 48, "fablebot-default");
  const pack = GENRES[genre];
  const random = randomFor([genre, cleanTheme, cleanHero, cleanSeed].join("|"));

  const setting = choose(pack.settings, random);
  const wonder = choose(pack.wonders, random);
  const companion = choose(pack.companions, random);
  const pressure = choose(pack.pressures, random);
  const reveal = choose(pack.reveals, random);
  const ending = choose(pack.endings, random);
  const titlePattern = choose(TITLES, random);
  const place = setting.split(" ").slice(-3).join(" ");

  const beats = [
    { label: "Opening image", text: `In ${setting}, ${cleanHero} has become known for one thing: caring about ${cleanTheme}. Life is steady, if a little too predictable.` },
    { label: "The strange arrival", text: `Everything changes when ${wonder} appears. ${cleanHero} finds a clue that points toward a much larger story.` },
    { label: "The complication", text: `With help from ${companion}, ${cleanHero} follows the trail. But ${pressure}, and the cost of finding an answer becomes personal.` },
    { label: "The turning point", text: `Just when the obvious explanation seems certain, ${reveal}. ${cleanHero} must decide what matters more: being right, or doing what is right.` },
    { label: "The resolution", text: `${ending}. The final image echoes the opening, but ${cleanHero} now understands ${cleanTheme} differently.` },
  ];

  const title = titleCase(titlePattern.replace("{place}", place));
  const logline = `When ${wonder}, ${cleanHero} must follow a trail through ${setting} before ${pressure}.`;
  return {
    genre,
    genreLabel: pack.label,
    theme: cleanTheme,
    hero: cleanHero,
    seed: cleanSeed,
    title,
    logline,
    beats,
    writingPrompt: `Write a ${pack.label.toLowerCase()} story about ${cleanTheme}. Center it on ${cleanHero}. Use the five beats below as a flexible outline, but make the characters' choices and consequences feel specific and earned.`,
  };
}

export function toMarkdown(story) {
  if (!story || typeof story.title !== "string" || !Array.isArray(story.beats)) {
    throw new TypeError("A generated story seed is required");
  }
  const sections = story.beats.map((beat, index) => `### ${index + 1}. ${beat.label}\n\n${beat.text}`);
  return [
    `# ${story.title}`,
    `**Genre:** ${story.genreLabel}  `,
    `**Theme:** ${story.theme}  `,
    `**Hero:** ${story.hero}  `,
    `**Seed:** ${story.seed}`,
    "",
    story.logline,
    "",
    ...sections,
    "",
    "## Writing prompt",
    "",
    story.writingPrompt,
    "",
    "> This outline is a starting point. Change any beat, add your own details, and follow the most interesting character choice.",
    "",
  ].join("\n");
}
