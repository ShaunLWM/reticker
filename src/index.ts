// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./@types/index.d.ts" />

import escapeStringRegexp, { BLACKLIST_GENERAL } from "./lib/Helper";

export default class TickerExtractor {
  private deduplicate: boolean;
  private config: TickerMatchConfig;
  private _mapping: Record<string, string[] | string> = {};

  constructor(deduplicate = true, config?: TickerMatchConfig) {
    this.deduplicate = deduplicate;
    this.config = Object.assign(
      {
        prefixedUppercase: true,
        unprefixedUppercase: true,
        prefixedLowercase: true,
        prefixedTitlecase: true,
        separators: ".-=",
      },
      config ?? {}
    );
  }

  get mapping(): Record<string, string[] | string> {
    return this._mapping;
  }

  set mapping(obj: Record<string, string[] | string>) {
    this._mapping = obj;
  }

  private appendPatterns(part1: string, part2: string, seperator: string) {
    const patterns = [];
    if (this.config.separators) {
      patterns.push(`${part1}${seperator}${part2}`);
    }

    patterns.push(part1);
    return patterns;
  }

  async pattern(): Promise<RegExp> {
    const patternFormat = "\\b{pattern}\\b";
    const posPrefix = "(?<=\\$)";
    const negPrefix = "(?<!\\$)";
    const separator = "[" + escapeStringRegexp(this.config.separators ?? "") + "]";
    const patterns = [];

    if (this.config.prefixedUppercase) {
      patterns.push(...this.appendPatterns(`${posPrefix}[A-Z]{1,6}`, "[A-Z]{1,3}", separator));
    }

    if (this.config.unprefixedUppercase) {
      patterns.push(...this.appendPatterns(`${negPrefix}[A-Z]{2,6}`, "[A-Z]{1,3}", separator));
    }

    if (this.config.prefixedLowercase) {
      patterns.push(...this.appendPatterns(`${posPrefix}[a-z]{1,6}`, "[a-z]{1,3}", separator));
    }
    if (this.config.prefixedTitlecase) {
      patterns.push(...this.appendPatterns(`${posPrefix}[A-Z]{1}[a-z]{2,5}`, "[A-Za-z]{1}[a-z]{0,2}", separator));
    }

    const compiledPatterns = patterns.map((pattern) => patternFormat.replace(/{pattern}/, pattern));
    return new RegExp(compiledPatterns.join("|"), "g");
  }

  async extract(text: string): Promise<string[]> {
    const pattern = await this.pattern();
    const matches = Array.from(text.matchAll(pattern), (x) => x[0])
      .map((p) => p.toUpperCase())
      .filter((item) => !BLACKLIST_GENERAL.includes(item))
      .map((p) => this._mapping[p] ?? p)
      .map((p) => (Array.isArray(p) ? p : [p]))
      .flat();

    if (this.deduplicate) {
      return [...new Set(matches)];
    }
    return matches;
  }
}
