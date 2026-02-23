# Polymarket Copy Trading Bot

A TypeScript-based CLI bot for automatically copying trades from selected traders on Polymarket.

**Telegram:** [@topsecretagent_007](https://t.me/topsecretagent_007)  
**GitHub:** [https://github.com/topsecretagent007/polymarket-trading-bot](https://github.com/topsecretagent007/polymarket-trading-bot)

## Features

- 🤖 **CLI Interface** - Easy-to-use command-line interface
- 📊 **Copy Trading** - Automatically copy trades from selected traders
- 📝 **Console Logging** - All trade activities logged to console
- ⚙️ **Configurable** - Set min/max trade amounts, slippage tolerance, and more
- 📈 **Real-time Monitoring** - Monitor multiple traders simultaneously

## Installation

1. Clone the repository:
```bash
git clone https://github.com/topsecretagent007/polymarket-trading-bot.git
cd polymarket-trading-bot
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

1. Copy the example environment file:
```bash
cp env.example .env
```

2. Edit `.env` with your configuration:
```env
# Polymarket Configuration
POLYMARKET_API_URL=https://clob.polymarket.com

# Wallet Private Key (for executing trades)
PRIVATE_KEY=your_private_key_here

# Copy Trading Settings
COPY_ENABLED=true
MIN_TRADE_AMOUNT=0.01
MAX_TRADE_AMOUNT=100
SLIPPAGE_TOLERANCE=0.01

# Traders to Copy (JSON array)
TRADERS=[{"address":"0x123...","name":"Trader1","minTradeAmount":0.1,"maxTradeAmount":10}]
```

## Usage

### CLI Commands

#### Start the bot:
```bash
npm run cli start
```

#### Start in daemon mode (non-interactive):
```bash
npm run cli start -- --daemon
```

#### Check bot status:
```bash
npm run cli status
```

#### View recent trades:
```bash
npm run cli trades
```

#### View active markets:
```bash
npm run cli markets
```

#### View configuration:
```bash
npm run cli config
```

#### Interactive setup wizard:
```bash
npm run cli setup
```

#### Stop the bot:
```bash
npm run cli stop
```

### Interactive Menu

When you start the bot without `--daemon` flag, you'll see an interactive menu:

```
╔═══════════════════════════════════════════════════════════╗
║                    Interactive Menu                       ║
╠═══════════════════════════════════════════════════════════╣
║  1. Check Status                                          ║
║  2. View Recent Trades                                    ║
║  3. View Markets                                          ║
║  4. View Configuration                                    ║
║  5. Stop Bot                                              ║
║  0. Exit                                                  ║
╚═══════════════════════════════════════════════════════════╝
```

## Development

### Run in development mode:
```bash
npm run dev
```

### Watch mode (auto-rebuild):
```bash
npm run watch
```

## Project Structure

```
polymarket-copy-trading-bot/
├── src/
│   ├── cli.ts              # CLI interface
│   ├── index.ts            # Main bot class
│   ├── config/             # Configuration management
│   ├── services/           # Service classes
│   │   ├── polymarket.ts   # Polymarket API client
│   │   └── tradeExecutor.ts # Trade execution logic
│   └── types/              # TypeScript type definitions
├── dist/                   # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

1. **Monitoring**: The bot continuously monitors trades from configured trader addresses
2. **Filtering**: Trades are filtered based on your configuration (min/max amounts, markets, etc.)
3. **Execution**: Approved trades are automatically executed on your behalf
4. **Logging**: All trade activities are logged to the console with detailed information

## Support

For issues and questions, contact [@topsecretagent_007](https://t.me/topsecretagent_007) on Telegram.