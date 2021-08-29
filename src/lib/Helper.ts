export default function escapeStringRegexp(str: string): string {
  if (typeof str !== "string") {
    throw new TypeError("Expected a string");
  }

  // Escape characters with special meaning either inside or outside character sets.
  // Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
  return str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}

export const BLACKLIST_GENERAL = [
  "AMA",
  "ARK",
  "BTW",
  "CAGR",
  "CEO",
  "CNBC",
  "COVID",
  "ETF",
  "EU",
  "FAANG",
  "FOREX",
  "FUD",
  "FYI",
  "GLOBAL",
  "HODL",
  "IMHO",
  "LOL",
  "MARKETS",
  "METALS",
  "MONEY",
  "NASDAQ",
  "NFT",
  "NYSE",
  "PFOF",
  "SEC",
  "SPAC",
  "THE",
  "WSB",
  // Profanity
  "ANAL",
  "ANUS",
  "ASS",
  "BLOW",
  "CLIT",
  "COCK",
  "CUM",
  "CUNT",
  "DICK",
  "DLDO",
  "DUMP",
  "LUBE",
  "PISS",
  "SPUNK",
  "SUX",
  "TITS",
  "WTF",
];
