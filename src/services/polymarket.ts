import axios, { AxiosInstance } from 'axios';
import { PolymarketMarket, PolymarketTrade, TradeSignal } from '../types';

export class PolymarketService {
  private api: AxiosInstance;
  private tradeCallbacks: ((signal: TradeSignal) => void)[] = [];

  constructor(apiUrl: string) {
    this.api = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getMarkets(active: boolean = true): Promise<PolymarketMarket[]> {
    try {
      const response = await this.api.get('/markets', {
        params: { active },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching markets:', error);
      throw error;
    }
  }

  async getMarketById(marketId: string): Promise<PolymarketMarket | null> {
    try {
      const response = await this.api.get(`/markets/${marketId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching market ${marketId}:`, error);
      return null;
    }
  }

  async getTradesByUser(userAddress: string, limit: number = 50): Promise<PolymarketTrade[]> {
    try {
      const response = await this.api.get('/trades', {
        params: {
          user: userAddress,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching trades for user ${userAddress}:`, error);
      return [];
    }
  }

  async getRecentTrades(marketId?: string, limit: number = 100): Promise<PolymarketTrade[]> {
    try {
      const params: any = { limit };
      if (marketId) {
        params.market = marketId;
      }
      const response = await this.api.get('/trades', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent trades:', error);
      return [];
    }
  }

  subscribeToTrades(traderAddresses: string[], callback: (signal: TradeSignal) => void): void {
    this.tradeCallbacks.push(callback);

    // Poll for new trades every 5 seconds
    const pollInterval = setInterval(async () => {
      for (const address of traderAddresses) {
        const trades = await this.getTradesByUser(address, 10);
        for (const trade of trades) {
          const signal: TradeSignal = {
            marketId: trade.market,
            outcome: trade.outcome,
            side: trade.type,
            price: trade.price,
            amount: trade.amount,
            timestamp: new Date(trade.timestamp).getTime(),
            traderAddress: address,
          };
          callback(signal);
        }
      }
    }, 5000);

    // Store interval for cleanup
    (this as any).pollInterval = pollInterval;
  }

  unsubscribeFromTrades(): void {
    if ((this as any).pollInterval) {
      clearInterval((this as any).pollInterval);
    }
    this.tradeCallbacks = [];
  }

  async executeTrade(
    marketId: string,
    outcome: string,
    side: 'buy' | 'sell',
    amount: string,
    price: string
  ): Promise<boolean> {
    try {
      // This is a placeholder - actual implementation would require
      // signing transactions with the private key and submitting to Polymarket
      console.log(`Executing trade: ${side} ${amount} of ${outcome} in market ${marketId} at price ${price}`);

      // TODO: Implement actual trade execution using Polymarket SDK
      // This would involve:
      // 1. Creating order with proper signature
      // 2. Submitting to Polymarket API
      // 3. Handling response and errors

      return true;
    } catch (error) {
      console.error('Error executing trade:', error);
      return false;
    }
  }
}

