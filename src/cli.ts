#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import { loadConfig, validateConfig } from './config';
import CopyTradingBot from './index';
import { PolymarketService } from './services/polymarket';
import * as readline from 'readline';

const program = new Command();

let botInstance: CopyTradingBot | null = null;

// Create readline interface for interactive CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function printBanner() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║     Polymarket Copy Trading Bot - CLI Interface           ║
╚═══════════════════════════════════════════════════════════╝
  `);
}

function printSeparator() {
  console.log('\n' + '─'.repeat(60) + '\n');
}

// Initialize bot instance
function getBot(): CopyTradingBot {
  if (!botInstance) {
    try {
      botInstance = new CopyTradingBot();
    } catch (error: any) {
      console.error('❌ Error initializing bot:', error.message);
      // give the user actionable next steps when config is missing
      if (error.message.includes('trader must be configured')) {
        console.error(
          '👉 Please add at least one trader in the TRADERS environment variable ' +
          '(or run `npm run cli setup`). See README for formatting.'
        );
      }
      process.exit(1);
    }
  }
  return botInstance;
}

// Start command
program
  .command('start')
  .description('Start the copy trading bot')
  .option('-d, --daemon', 'Run in daemon mode (non-interactive)')
  .action(async (options) => {
    printBanner();
    const bot = getBot();

    try {
      await bot.start();

      if (options.daemon) {
        console.log('✅ Bot started in daemon mode');
        // Keep process alive
        process.stdin.resume();
      } else {
        printSeparator();
        console.log('✅ Bot is running! Press Ctrl+C to stop.\n');
        console.log('💡 Use "npm run cli status" to check status');
        console.log('💡 Use "npm run cli trades" to view recent trades');
        printSeparator();

        // Keep process alive and show interactive menu
        showInteractiveMenu();
      }
    } catch (error: any) {
      console.error('❌ Error starting bot:', error.message);
      process.exit(1);
    }
  });

// Stop command
program
  .command('stop')
  .description('Stop the copy trading bot')
  .action(async () => {
    const bot = getBot();
    await bot.stop();
    botInstance = null;
    console.log('✅ Bot stopped successfully');
    process.exit(0);
  });

// Status command
program
  .command('status')
  .description('Check bot status')
  .action(() => {
    printBanner();
    const bot = getBot();
    const status = bot.getStatus();

    console.log('📊 Bot Status:');
    console.log(`   Running: ${status.running ? '✅ Yes' : '❌ No'}`);
    console.log(`   Traders: ${status.traders}`);
    printSeparator();
  });

// Config command
program
  .command('config')
  .description('View current configuration')
  .action(() => {
    printBanner();
    try {
      const config = loadConfig();
      console.log('⚙️  Configuration:');
      console.log(`   API URL: ${config.polymarketApiUrl}`);
      console.log(`   Copy Enabled: ${config.copySettings.enabled ? '✅' : '❌'}`);
      console.log(`   Min Trade Amount: $${config.copySettings.minAmount}`);
      console.log(`   Max Trade Amount: $${config.copySettings.maxAmount}`);
      console.log(`   Slippage Tolerance: ${(config.copySettings.slippageTolerance * 100).toFixed(2)}%`);
      console.log(`   Traders: ${config.traders.length}`);
      config.traders.forEach((trader, index) => {
        console.log(`      ${index + 1}. ${trader.name || 'Unnamed'} (${trader.address.slice(0, 10)}...)`);
      });
      printSeparator();
    } catch (error: any) {
      console.error('❌ Error loading config:', error.message);
    }
  });

// Trades command
program
  .command('trades')
  .description('View recent trades from monitored traders')
  .option('-l, --limit <number>', 'Number of trades to show', '10')
  .action(async (options) => {
    printBanner();
    try {
      const config = loadConfig();
      const polymarket = new PolymarketService(config.polymarketApiUrl);

      console.log('📊 Fetching recent trades...\n');

      for (const trader of config.traders) {
        console.log(`👤 Trader: ${trader.name || trader.address}`);
        const trades = await polymarket.getTradesByUser(trader.address, parseInt(options.limit));

        if (trades.length === 0) {
          console.log('   No recent trades found\n');
          continue;
        }

        trades.slice(0, parseInt(options.limit)).forEach((trade, index) => {
          console.log(`   ${index + 1}. ${trade.type.toUpperCase()} ${trade.amount} @ $${trade.price}`);
          console.log(`      Market: ${trade.market.slice(0, 20)}...`);
          console.log(`      Time: ${new Date(trade.timestamp).toLocaleString()}\n`);
        });
      }

      printSeparator();
    } catch (error: any) {
      console.error('❌ Error fetching trades:', error.message);
    }
  });

// Markets command
program
  .command('markets')
  .description('List active Polymarket markets')
  .option('-l, --limit <number>', 'Number of markets to show', '20')
  .action(async (options) => {
    printBanner();
    try {
      const config = loadConfig();
      const polymarket = new PolymarketService(config.polymarketApiUrl);

      console.log('📊 Fetching active markets...\n');
      const markets = await polymarket.getMarkets(true);

      markets.slice(0, parseInt(options.limit)).forEach((market, index) => {
        console.log(`${index + 1}. ${market.question}`);
        console.log(`   ID: ${market.id}`);
        console.log(`   Volume: $${parseFloat(market.volume).toFixed(2)}`);
        console.log(`   Liquidity: $${parseFloat(market.liquidity).toFixed(2)}`);
        console.log(`   End Date: ${new Date(market.endDate).toLocaleString()}\n`);
      });

      printSeparator();
    } catch (error: any) {
      console.error('❌ Error fetching markets:', error.message);
    }
  });

// Setup command
program
  .command('setup')
  .description('Interactive setup wizard')
  .action(async () => {
    printBanner();
    console.log('🔧 Interactive Setup Wizard\n');

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'privateKey',
        message: 'Enter your wallet private key:',
        validate: (input) => input.length > 0 || 'Private key is required',
      },
      {
        type: 'input',
        name: 'minTradeAmount',
        message: 'Minimum trade amount (USD):',
        default: '0.01',
        validate: (input) => !isNaN(parseFloat(input)) || 'Must be a number',
      },
      {
        type: 'input',
        name: 'maxTradeAmount',
        message: 'Maximum trade amount (USD):',
        default: '100',
        validate: (input) => !isNaN(parseFloat(input)) || 'Must be a number',
      },
      {
        type: 'input',
        name: 'traderAddress',
        message: 'Enter trader address to copy (or press Enter to skip):',
      },
    ]);

    console.log('\n✅ Configuration saved!');
    console.log('📝 Please update your .env file with these values:');
    console.log('\nPRIVATE_KEY=' + answers.privateKey);
    console.log('MIN_TRADE_AMOUNT=' + answers.minTradeAmount);
    console.log('MAX_TRADE_AMOUNT=' + answers.maxTradeAmount);
    if (answers.traderAddress) {
      console.log(`TRADERS=[{"address":"${answers.traderAddress}"}]`);
    }
    printSeparator();
  });

// Interactive menu
function showInteractiveMenu() {
  const menu = `
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

Select an option: `;

  rl.question(menu, async (answer) => {
    switch (answer.trim()) {
      case '1':
        const bot = getBot();
        const status = bot.getStatus();
        console.log(`\n📊 Status: ${status.running ? 'Running' : 'Stopped'}`);
        console.log(`👥 Traders: ${status.traders}\n`);
        showInteractiveMenu();
        break;

      case '2':
        try {
          const config = loadConfig();
          const polymarket = new PolymarketService(config.polymarketApiUrl);
          const trades = await polymarket.getRecentTrades(undefined, 5);
          console.log('\n📊 Recent Trades:');
          trades.forEach((trade, i) => {
            console.log(`${i + 1}. ${trade.type} ${trade.amount} @ $${trade.price}`);
          });
          console.log();
        } catch (error: any) {
          console.error('Error:', error.message);
        }
        showInteractiveMenu();
        break;

      case '3':
        try {
          const config = loadConfig();
          const polymarket = new PolymarketService(config.polymarketApiUrl);
          const markets = await polymarket.getMarkets(true);
          console.log(`\n📊 Active Markets: ${markets.length}\n`);
          markets.slice(0, 5).forEach((m, i) => {
            console.log(`${i + 1}. ${m.question}`);
          });
          console.log();
        } catch (error: any) {
          console.error('Error:', error.message);
        }
        showInteractiveMenu();
        break;

      case '4':
        try {
          const config = loadConfig();
          console.log('\n⚙️  Configuration:');
          console.log(`   Copy Enabled: ${config.copySettings.enabled}`);
          console.log(`   Min Amount: $${config.copySettings.minAmount}`);
          console.log(`   Max Amount: $${config.copySettings.maxAmount}`);
          console.log(`   Traders: ${config.traders.length}\n`);
        } catch (error: any) {
          console.error('Error:', error.message);
        }
        showInteractiveMenu();
        break;

      case '5':
        const botToStop = getBot();
        await botToStop.stop();
        console.log('\n✅ Bot stopped\n');
        rl.close();
        process.exit(0);
        break;

      case '0':
        rl.close();
        process.exit(0);
        break;

      default:
        console.log('\n❌ Invalid option\n');
        showInteractiveMenu();
    }
  });
}

// Main CLI setup
program
  .name('polymarket-bot')
  .description('CLI interface for Polymarket Copy Trading Bot')
  .version('1.0.0');

// Handle no command - show help
if (process.argv.length === 2) {
  printBanner();
  program.help();
}

program.parse(process.argv);

