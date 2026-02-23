import { loadConfig, validateConfig } from './config';
import { PolymarketService } from './services/polymarket';
import { TradeExecutor } from './services/tradeExecutor';
import { TradeSignal } from './types';

class CopyTradingBot {
  private config: ReturnType<typeof loadConfig>;
  private polymarket: PolymarketService;
  private tradeExecutor: TradeExecutor;
  private isRunning: boolean = false;

  constructor() {
    console.log('🚀 Initializing Polymarket Copy Trading Bot...');
    
    // Load configuration
    this.config = loadConfig();
    validateConfig(this.config);

    // Initialize services
    this.polymarket = new PolymarketService(this.config.polymarketApiUrl);
    this.tradeExecutor = new TradeExecutor(
      this.polymarket,
      this.config
    );
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Bot is already running');
      return;
    }

    console.log('✅ Starting bot...');
    this.isRunning = true;

    // Get trader addresses
    const traderAddresses = this.config.traders.map((t) => t.address);
    console.log(`👀 Monitoring ${traderAddresses.length} trader(s):`, traderAddresses);

    // Subscribe to trades
    this.polymarket.subscribeToTrades(traderAddresses, async (signal: TradeSignal) => {
      console.log('📊 New trade signal detected:', {
        market: signal.marketId,
        outcome: signal.outcome,
        side: signal.side,
        amount: signal.amount,
        trader: signal.traderAddress,
      });

      // Check if we should copy this trade
      if (this.tradeExecutor.shouldCopyTrade(signal)) {
        console.log('✅ Trade approved for copying');
        await this.tradeExecutor.executeTrade(signal);
      } else {
        console.log('⏭️ Trade skipped (does not meet criteria)');
      }
    });

    console.log(`✅ Bot started! Monitoring ${traderAddresses.length} trader(s)`);
    console.log('✅ Bot is now running and monitoring trades');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Stopping bot...');
    this.isRunning = false;
    this.polymarket.unsubscribeFromTrades();
    console.log('✅ Bot stopped');
  }

  getStatus(): { running: boolean; traders: number } {
    return {
      running: this.isRunning,
      traders: this.config.traders.length,
    };
  }
}

export default CopyTradingBot;

