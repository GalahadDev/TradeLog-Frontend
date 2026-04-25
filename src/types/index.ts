export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  is_verified: boolean;
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
  bio?: string;
  trading_experience?: 'Beginner' | 'Intermediate' | 'Pro' | string;
  created_at: string;
}

export interface AccountListItem {
  id: string;
  name: string;
  broker: string;
  account_type: 'prop_firm' | 'personal';
  status: 'active' | 'completed' | 'lost';
  currency: string;
  initial_balance: string;
  current_balance: string;
  total_pnl: string;
}

export interface TradingAccount extends AccountListItem {
  profit_target?: string;
  max_drawdown_limit?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountSummary {
  current_balance: string;
  total_pnl: string;
  total_trades: number;
  win_rate: string;
  profit_progress?: string;
  drawdown_used?: string;
  drawdown_remaining?: string;
}

export interface Trade {
  id: string;
  user_id: string;
  account_id: string;
  symbol: string;
  direction: 'long' | 'short';
  status: 'open' | 'closed' | 'pending';
  entry_price: number;
  exit_price: number;
  size: number;
  pnl: number;
  commission: number;
  entry_date: string;
  exit_date?: string;
  notes?: string;
  screenshot_urls?: string[];
  tags?: string[];
  created_at: string;
}

export interface CalendarMetric {
  date: string;       // YYYY-MM-DD
  total_pnl: number;
  trade_count: number;
}

export interface TradingStats {

  total_net_profit: string;
  total_commissions: string;
  gross_profit: string;
  gross_loss: string;
  profit_factor: string;
  recovery_factor: string;
  sharpe_ratio: string;
  expected_payoff: string;
  total_trades: number;
  avg_trade_size: string;
  max_drawdown: string;
  win_rate: string;
  loss_rate: string;
  long_win_rate: string;
  short_win_rate: string;
  avg_win: string;
  avg_loss: string;
  largest_win: string;
  largest_loss: string;
  max_consecutive_wins: number;
  max_consecutive_profit_usd: string;
  max_consecutive_losses: number;
  max_consecutive_loss_usd: string;
}