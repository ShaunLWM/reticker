# reticker

A [Python-ported](https://github.com/impredicative/reticker) stock tickers extractor using Regular Expressions.

## Installation

```bash
npm install reticker
# -- or
yarn add reticker
```

## Usage

```python
import TickerExtractor from "reticker"

const tickerExtractor = new TickerExtractor();

const tickers = await tickerExtractor.extract("Comparing FNGU vs $WEBL vs SOXL- who wins? And what about $cldl vs $Skyu? IMHO, SOXL is king!\nBTW, will the $w+$Z pair still grow?");
# ['FNGU', 'WEBL', 'SOXL', 'CLDL', 'SKYU', 'W', 'Z']

const tickers = await tickerExtractor.extract("Which of BTC-USD, $ETH-USD and $ada-usd is best?\nWhat about $Brk.a and $Brk.B? Compare futures MGC=F and SIL=F.");
# ['BTC-USD', 'ETH-USD', 'ADA-USD', 'BRK.A', 'BRK.B', 'MGC=F', 'SIL=F']
```

### Options

```
new TickerExtractor(deduplicate = true, options: TickerMatchConfig)

// deduplicate - Removes duplicate tickers from result

# TickerMatchConfig
prefixedUppercase?: boolean = true;
unprefixedUppercase?: boolean = true;
prefixedLowercase?: boolean = true;
prefixedTitlecase?: boolean = true;
separators?: string | undefined | null = ".-=";
```

## TODO

- Match `^STI`
- Match `9988.hk`

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Credits

[reticker](https://github.com/impredicative/reticker)
