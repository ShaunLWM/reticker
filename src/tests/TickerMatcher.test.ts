import "jest-extended";
import TickerExtractor from "../";
import { BLACKLIST_GENERAL } from "../lib/Helper";

describe("TickerExtractor", () => {
  describe("Default Configuration", () => {
    let tickerMatcher: TickerExtractor;
    beforeEach(() => {
      tickerMatcher = new TickerExtractor(true);
    });

    it("should match the most basic tickers", async () => {
      const matches = await tickerMatcher.extract("i love these stocks $ARKX and $ARKK");
      expect(matches).toIncludeSameMembers(["ARKX", "ARKK"]);
    });

    it("should match the most basic tickers (2)", async () => {
      const matches = await tickerMatcher.extract(
        "Comparing FNGU vs $WEBL vs SOXL- who wins? And what about $cldl vs $Skyu? BTW, will the $w+$Z pair still grow? IMHO, SOXL is king!"
      );
      expect(matches).toIncludeSameMembers(["FNGU", "WEBL", "SOXL", "CLDL", "SKYU", "W", "Z"]);
    });

    it("should match tickers with seperators", async () => {
      const matches = await tickerMatcher.extract(
        "Which of BTC-USD, $ETH-USD and $ada-usd is best? What about $Brk.a and $Brk.B? BRK-B is cheaper. Let's also pick between futures MGC=F and ALI=F."
      );
      expect(matches).toIncludeSameMembers([
        "BTC-USD",
        "ETH-USD",
        "ADA-USD",
        "BRK.A",
        "BRK.B",
        "BRK-B",
        "MGC=F",
        "ALI=F",
      ]);
    });

    it("should match all cases of tickers", async () => {
      const matches = await tickerMatcher.extract("i love these stocks $ARKX and $ARKK");
      expect(matches).toIncludeSameMembers(["ARKX", "ARKK"]);
    });

    it("should ONLY match the correct tickers", async () => {
      const matches = await tickerMatcher.extract("i love these stocks $ARKX and $ARKK. priced at $1200 & $1.25");
      expect(matches).toIncludeSameMembers(["ARKX", "ARKK"]);
    });

    it("should have no matches", async () => {
      const matches = await tickerMatcher.extract("Test text");
      expect(matches.length).toBe(0);
      expect(matches).toIncludeSameMembers([]);
    });

    it("should remove duplicates", async () => {
      const matches = await tickerMatcher.extract("SPY is not QQQ. It is SPY");
      expect(matches).toIncludeSameMembers(["SPY", "QQQ"]);
    });
  });

  describe("Configuration (deduplicated=false)", () => {
    let tickerMatcher: TickerExtractor;
    beforeEach(() => {
      tickerMatcher = new TickerExtractor(false);
    });

    it("should not remove duplicates", async () => {
      const matches = await tickerMatcher.extract("SPY is not QQQ. It is SPY");
      expect(matches).toIncludeSameMembers(["SPY", "QQQ", "SPY"]);
    });
  });

  describe("Testing Blacklist", () => {
    let tickerMatcher: TickerExtractor;
    const originalBlacklist = [...BLACKLIST_GENERAL];
    const text = "BLCN, BLOK or DAPP?";

    beforeEach(() => {
      tickerMatcher = new TickerExtractor(true);
      BLACKLIST_GENERAL.length = 0;
      BLACKLIST_GENERAL.push(...originalBlacklist);
    });

    it("should extract properly", async () => {
      expect(BLACKLIST_GENERAL.includes("BLCN")).toBe(false);
      expect(BLACKLIST_GENERAL.includes("BLOK")).toBe(false);
      const matches = await tickerMatcher.extract(text);
      expect(matches).toIncludeSameMembers(["BLCN", "BLOK", "DAPP"]);
    });

    it("should properly blacklist tickers", async () => {
      BLACKLIST_GENERAL.push("BLCN");
      BLACKLIST_GENERAL.push("BLOK");
      let matches = await tickerMatcher.extract(text);
      expect(matches).toIncludeSameMembers(["DAPP"]);

      BLACKLIST_GENERAL.pop();
      matches = await tickerMatcher.extract(text);
      expect(matches).toIncludeSameMembers(["BLOK", "DAPP"]);

      BLACKLIST_GENERAL.pop();
      matches = await tickerMatcher.extract(text);
      expect(matches).toIncludeSameMembers(["BLCN", "BLOK", "DAPP"]);

      expect(BLACKLIST_GENERAL).toIncludeAllMembers(originalBlacklist);
    });
  });

  describe("Testing Tickers mappings", () => {
    let tickerMatcher: TickerExtractor;
    const text = "ADA BTC RIOT";
    beforeEach(() => {
      tickerMatcher = new TickerExtractor(false);
    });

    it("should be an empty mapping", () => {
      expect(tickerMatcher.mapping).toBeObject();
      expect(tickerMatcher.mapping).toContainAllKeys([]);
    });

    it("should map tickers mapping properly", async () => {
      tickerMatcher.mapping["ADA"] = "ADA-USD";
      tickerMatcher.mapping["BTC"] = "BTC-USD";
      const matches = await tickerMatcher.extract(text);
      expect(matches).toIncludeSameMembers(["ADA-USD", "BTC-USD", "RIOT"]);
    });

    it("should map double tickers mapping properly", async () => {
      tickerMatcher.mapping["COMP"] = ["COMP", "COMP-USD"];
      const matches = await tickerMatcher.extract(
        `Is COMP for the equity "Compass, Inc." or is it for the cryptocurrency "Compound USD"?`
      );
      expect(matches).toIncludeSameMembers(["COMP", "COMP-USD", "USD"]);
    });

    it("should map single tickers mapping properly", async () => {
      tickerMatcher.mapping["USD"] = ["DXY"];
      tickerMatcher.mapping["COMP"] = ["COMP", "COMP-USD"];
      const matches = await tickerMatcher.extract(
        `Is COMP for the equity "Compass, Inc." or is it for the cryptocurrency "Compound USD"?`
      );
      expect(matches).toIncludeSameMembers(["COMP", "COMP-USD", "DXY"]);
    });
  });

  describe("Varied configuration", () => {
    it("prefixedUppercase", async () => {
      expect(await new TickerExtractor().extract("$ARKX")).toIncludeSameMembers(["ARKX"]);
      expect(await new TickerExtractor(true).extract("$ARKX")).toIncludeSameMembers(["ARKX"]);
      expect(
        await new TickerExtractor(true, {
          prefixedUppercase: true,
        }).extract("$ARKX")
      ).toIncludeSameMembers(["ARKX"]);
      expect(
        await new TickerExtractor(true, {
          prefixedUppercase: false,
        }).extract("$ARKX")
      ).toIncludeSameMembers([]);
    });

    it("unprefixedUppercase", async () => {
      expect(await new TickerExtractor().extract("ARKX")).toIncludeSameMembers(["ARKX"]);
      expect(await new TickerExtractor(true).extract("ARKX")).toIncludeSameMembers(["ARKX"]);
      expect(
        await new TickerExtractor(true, {
          unprefixedUppercase: true,
        }).extract("ARKX")
      ).toIncludeSameMembers(["ARKX"]);
      expect(
        await new TickerExtractor(true, {
          unprefixedUppercase: false,
        }).extract("ARKX")
      ).toIncludeSameMembers([]);
    });

    it("prefixedLowercase", async () => {
      expect(await new TickerExtractor().extract("$arkx")).toIncludeSameMembers(["ARKX"]);
      expect(await new TickerExtractor(true).extract("$arkx")).toIncludeSameMembers(["ARKX"]);
      expect(
        await new TickerExtractor(true, {
          prefixedLowercase: true,
        }).extract("$arkx")
      ).toIncludeSameMembers(["ARKX"]);
      expect(
        await new TickerExtractor(true, {
          prefixedLowercase: false,
        }).extract("$arkx")
      ).toIncludeSameMembers([]);
    });

    it("prefixedTitlecase", async () => {
      expect(await new TickerExtractor().extract("$Arkx")).toIncludeSameMembers(["ARKX"]);
      expect(await new TickerExtractor(true).extract("$Arkx")).toIncludeSameMembers(["ARKX"]);
      expect(
        await new TickerExtractor(true, {
          prefixedTitlecase: true,
        }).extract("$Arkx")
      ).toIncludeSameMembers(["ARKX"]);
      expect(
        await new TickerExtractor(true, {
          prefixedTitlecase: false,
        }).extract("$Arkx")
      ).toIncludeSameMembers([]);
    });

    it("separators", async () => {
      expect(await new TickerExtractor().extract("BTC-USD")).toIncludeSameMembers(["BTC-USD"]);
      expect(await new TickerExtractor(true).extract("BTC-USD")).toIncludeSameMembers(["BTC-USD"]);
      expect(
        await new TickerExtractor(true, {
          separators: "-",
        }).extract("BTC-USD")
      ).toIncludeSameMembers(["BTC-USD"]);
      expect(
        await new TickerExtractor(true, {
          separators: ".",
        }).extract("BTC-USD")
      ).toIncludeSameMembers(["BTC", "USD"]);
      expect(
        await new TickerExtractor(true, {
          separators: "=",
        }).extract("BTC-USD")
      ).toIncludeSameMembers(["BTC", "USD"]);
      expect(
        await new TickerExtractor(true, {
          separators: null,
        }).extract("BTC-USD")
      ).toIncludeSameMembers(["BTC", "USD"]);
      expect(
        await new TickerExtractor(true, {
          separators: "",
        }).extract("BTC-USD")
      ).toIncludeSameMembers(["BTC", "USD"]);
      expect(
        await new TickerExtractor(true, {
          separators: ".-",
        }).extract("BTC-USD")
      ).toIncludeSameMembers(["BTC-USD"]);
      expect(
        await new TickerExtractor(true, {
          separators: ".=",
        }).extract("BTC-USD")
      ).toIncludeSameMembers(["BTC", "USD"]);
    });
  });
});
