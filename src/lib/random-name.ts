const adjectives = [
  "Swift", "Mystic", "Cosmic", "Brave", "Clever",
  "Gentle", "Fierce", "Jolly", "Lucky", "Noble",
  "Quiet", "Rapid", "Shiny", "Silver", "Velvet",
  "Amber", "Bright", "Crimson", "Dapper", "Electric",
  "Frosty", "Golden", "Humble", "Icy", "Jade",
  "Kind", "Lunar", "Mellow", "Neon", "Oak",
  "Pale", "Quaint", "Royal", "Sable", "Tranquil",
  "Urban", "Vivid", "Wild", "Zen", "Bold",
];

const animals = [
  "Fox", "Wolf", "Bear", "Hawk", "Owl",
  "Deer", "Lynx", "Raven", "Badger", "Crane",
  "Dove", "Elk", "Falcon", "Goat", "Heron",
  "Ibex", "Jay", "Koala", "Lark", "Mole",
  "Newt", "Otter", "Puma", "Quail", "Robin",
  "Seal", "Tiger", "Urchin", "Viper", "Whale",
  "Yak", "Zebra", "Finch", "Gecko", "Hare",
  "Iris", "Jackal", "Kite", "Lynx", "Moth",
];

export function generateRandomName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${animal}${num}`;
}
