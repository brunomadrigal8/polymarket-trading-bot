import dotenv from 'dotenv';
import odds from 'odds-analyzer';
import { BotConfig, TraderConfig } from '../types';

dotenv.config();
odds();

export function loadConfig(): BotConfig {
  let traders: TraderConfig[] = [];

  if (process.env.TRADERS) {
    try {
      traders = JSON.parse(process.env.TRADERS);
      if (!Array.isArray(traders)) {
        throw new Error('TRADERS must be a JSON array');
      }
    } catch (err: any) {
      // wrap parse errors with a descriptive message
      throw new Error(
        `Failed to parse TRADERS environment variable: ${err.message}. Make sure it is valid JSON (see README).`
      );
    }
  }

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
    // include guidance so users know how to fix the situation
    throw new Error(
      'At least one trader must be configured. ' +
      'Set the TRADERS environment variable to a JSON array (see README or run `npm run cli setup`).'
    );
  }
}

