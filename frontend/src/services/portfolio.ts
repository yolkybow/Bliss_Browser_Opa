import api from './api';

export interface PortfolioSummary {
  net_worth: number;
  total_assets: number;
  total_liabilities: number;
  breakdown: {
    cash: number;
    stocks: number;
    crypto: number;
    property: number;
    vehicles: number;
    property_debt: number;
    vehicle_debt: number;
  };
  last_updated: string;
}

export interface PortfolioPerformance {
  cost_basis: number;
  current_value: number;
  gain_loss: number;
  gain_loss_percent: number;
  stock_performance: {
    cost_basis: number;
    current_value: number;
    gain_loss: number;
    gain_loss_percent: number;
  };
  crypto_performance: {
    cost_basis: number;
    current_value: number;
    gain_loss: number;
    gain_loss_percent: number;
  };
}

// Property interfaces
export interface Property {
  id: string;
  property_type: string;
  address: string;
  purchase_price: number;
  current_value: number;
  purchase_date: string;
  mortgage_balance: number;
  monthly_payment: number;
  rental_income: number;
  property_taxes: number;
  insurance_cost: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Vehicle interfaces
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  purchase_price: number;
  current_value: number;
  purchase_date: string;
  mileage: number;
  loan_balance: number;
  monthly_payment: number;
  insurance_cost: number;
  registration_cost: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Stock interfaces
export interface StockHolding {
  id: string;
  symbol: string;
  company_name: string;
  shares: number;
  average_cost: number;
  current_price: number;
  total_value: number;
  broker: string;
  sector: string;
  dividend_yield: number;
  last_price_update: string;
  created_at: string;
}

// Crypto interfaces
export interface CryptoHolding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  average_cost: number;
  current_price: number;
  total_value: number;
  exchange: string;
  wallet_address: string;
  last_price_update: string;
  created_at: string;
}

// Bank account interfaces
export interface BankAccount {
  id: string;
  bank_name: string;
  account_type: string;
  account_number_masked: string;
  balance: number;
  available_balance: number;
  currency: string;
  last_updated: string;
  is_active: boolean;
}

export const portfolioService = {
  // Portfolio overview
  async getPortfolioSummary(): Promise<PortfolioSummary> {
    const response = await api.get('/portfolio/summary');
    return response.data;
  },

  async getPortfolioPerformance(): Promise<PortfolioPerformance> {
    const response = await api.get('/portfolio/performance');
    return response.data;
  },

  async refreshPortfolioData(): Promise<any> {
    const response = await api.post('/portfolio/refresh');
    return response.data;
  },

  // Properties
  async getProperties(): Promise<Property[]> {
    const response = await api.get('/properties');
    return response.data;
  },

  async createProperty(data: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
    const response = await api.post('/properties', data);
    return response.data;
  },

  async updateProperty(id: string, data: Partial<Property>): Promise<Property> {
    const response = await api.put(`/properties/${id}`, data);
    return response.data;
  },

  async deleteProperty(id: string): Promise<void> {
    await api.delete(`/properties/${id}`);
  },

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    const response = await api.get('/vehicles');
    return response.data;
  },

  async createVehicle(data: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>): Promise<Vehicle> {
    const response = await api.post('/vehicles', data);
    return response.data;
  },

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },

  async deleteVehicle(id: string): Promise<void> {
    await api.delete(`/vehicles/${id}`);
  },

  // Stocks
  async getStockHoldings(): Promise<StockHolding[]> {
    const response = await api.get('/stocks/holdings');
    return response.data;
  },

  async createStockHolding(data: { symbol: string; shares: number; average_cost: number; broker?: string }): Promise<StockHolding> {
    const response = await api.post('/stocks/holdings', data);
    return response.data;
  },

  async updateStockHolding(id: string, data: Partial<StockHolding>): Promise<StockHolding> {
    const response = await api.put(`/stocks/holdings/${id}`, data);
    return response.data;
  },

  async deleteStockHolding(id: string): Promise<void> {
    await api.delete(`/stocks/holdings/${id}`);
  },

  async refreshStockPrices(): Promise<void> {
    await api.post('/stocks/refresh-prices');
  },

  // Crypto
  async getCryptoHoldings(): Promise<CryptoHolding[]> {
    const response = await api.get('/crypto/holdings');
    return response.data;
  },

  async createCryptoHolding(data: { symbol: string; amount: number; average_cost: number; exchange?: string; wallet_address?: string }): Promise<CryptoHolding> {
    const response = await api.post('/crypto/holdings', data);
    return response.data;
  },

  async updateCryptoHolding(id: string, data: Partial<CryptoHolding>): Promise<CryptoHolding> {
    const response = await api.put(`/crypto/holdings/${id}`, data);
    return response.data;
  },

  async deleteCryptoHolding(id: string): Promise<void> {
    await api.delete(`/crypto/holdings/${id}`);
  },

  async refreshCryptoPrices(): Promise<void> {
    await api.post('/crypto/refresh-prices');
  },

  // Banking
  async getBankAccounts(): Promise<BankAccount[]> {
    const response = await api.get('/banking/accounts');
    return response.data;
  },

  async createLinkToken(): Promise<{ link_token: string }> {
    const response = await api.post('/banking/link-token');
    return response.data;
  },

  async exchangePublicToken(public_token: string): Promise<void> {
    await api.post('/banking/exchange-token', { public_token });
  }
};