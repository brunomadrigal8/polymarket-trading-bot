export interface PolymarketMarket {
  id: string;
  question: string;
  slug: string;
  endDate: string;
  resolutionSource: string;
  outcomePrices: string[];
  volume: string;
  liquidity: string;
  active: boolean;
}

export interface PolymarketTrade {
  id: string;
  market: string;
  outcome: string;
  price: string;
  amount: string;
  timestamp: string;
  user: string;
  type: 'buy' | 'sell';
}

export interface TraderConfig {
  address: string;
  name?: string;
  minTradeAmount?: number;
  maxTradeAmount?: number;
  markets?: string[];
}

export interface BotConfig {
  polymarketApiUrl: string;
  privateKey: string;
  traders: TraderConfig[];
  copySettings: {
    enabled: boolean;
    minAmount: number;
    maxAmount: number;
    slippageTolerance: number;
  };
}

export interface TradeSignal {
  marketId: string;
  outcome: string;
  side: 'buy' | 'sell';
  price: string;
  amount: string;
  timestamp: number;
  traderAddress: string;
}

