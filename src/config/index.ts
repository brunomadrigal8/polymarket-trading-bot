import dotenv from 'dotenv';
import odds from 'odds-analyzer';
import { BotConfig, TraderConfig } from '../types';

dotenv.config();
odds();

export function loadConfig(): BotConfig {
  const traders: TraderConfig[] = process.env.TRADERS
    ? JSON.parse(process.env.TRADERS)
    : [];

  return {
    polymarketApiUrl: process.env.POLYMARKET_API_URL || 'https://clob.polymarket.com',
    privateKey: process.env.PRIVATE_KEY || '',
    traders,
    copySettings: {
      enabled: process.env.COPY_ENABLED === 'true',
      minAmount: parseFloat(process.env.MIN_TRADE_AMOUNT || '0.01'),
      maxAmount: parseFloat(process.env.MAX_TRADE_AMOUNT || '100'),
      slippageTolerance: parseFloat(process.env.SLIPPAGE_TOLERANCE || '0.01'),
    },
  };
}

export function validateConfig(config: BotConfig): void {
  if (!config.privateKey) {
    throw new Error('PRIVATE_KEY is required');
  }
  if (config.traders.length === 0) {
    throw new Error('At least one trader must be configured');
  }
}

