import { PolymarketService } from './polymarket';
import { TradeSignal, BotConfig } from '../types';

export class TradeExecutor {
  private polymarket: PolymarketService;
  private config: BotConfig;
  private executedTrades: Set<string> = new Set();

  constructor(
    polymarket: PolymarketService,
    config: BotConfig
  ) {
    this.polymarket = polymarket;
    this.config = config;
  }

  async executeTrade(signal: TradeSignal): Promise<boolean> {
    // Check if trade was already executed
    const tradeId = `${signal.traderAddress}-${signal.marketId}-${signal.timestamp}`;
    if (this.executedTrades.has(tradeId)) {
      return false;
    }

    // Validate trade amount
    const amount = parseFloat(signal.amount);
    if (amount < this.config.copySettings.minAmount) {
      console.log(`Trade amount ${amount} below minimum ${this.config.copySettings.minAmount}`);
      return false;
    }

    if (amount > this.config.copySettings.maxAmount) {
      console.log(`Trade amount ${amount} above maximum ${this.config.copySettings.maxAmount}`);
      return false;
    }

    // Check if copy trading is enabled
    if (!this.config.copySettings.enabled) {
      console.log('Copy trading is disabled');
      return false;
    }

    // Execute the trade
    const success = await this.polymarket.executeTrade(
      signal.marketId,
      signal.outcome,
      signal.side,
      signal.amount,
      signal.price
    );

    // Mark as executed
    if (success) {
      this.executedTrades.add(tradeId);
    }

    // Log trade execution
    const status = success ? '✅ EXECUTED' : '❌ FAILED';
    console.log(`\n${status} Trade:`);
    console.log(`   Market: ${signal.marketId}`);
    console.log(`   Outcome: ${signal.outcome}`);
    console.log(`   Side: ${signal.side.toUpperCase()}`);
    console.log(`   Amount: ${signal.amount}`);
    console.log(`   Price: ${signal.price}`);
    console.log(`   Trader: ${signal.traderAddress.slice(0, 10)}...`);
    console.log(`   Time: ${new Date(signal.timestamp).toLocaleString()}\n`);

    return success;
  }

  shouldCopyTrade(signal: TradeSignal): boolean {
    // Check if trader is in watch list
    const trader = this.config.traders.find(
      (t) => t.address.toLowerCase() === signal.traderAddress.toLowerCase()
    );

    if (!trader) {
      return false;
    }

    // Check if market is in allowed list (if specified)
    if (trader.markets && trader.markets.length > 0) {
      if (!trader.markets.includes(signal.marketId)) {
        return false;
      }
    }

    // Check amount constraints
    const amount = parseFloat(signal.amount);
    if (trader.minTradeAmount && amount < trader.minTradeAmount) {
      return false;
    }

    if (trader.maxTradeAmount && amount > trader.maxTradeAmount) {
      return false;
    }

    return true;
  }
}

