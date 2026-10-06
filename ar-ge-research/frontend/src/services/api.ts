import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  total?: number;
}

export interface Store {
  id: string;
  name: string;
  user: {
    id: string;
    name?: string;
    email: string;
  };
  sandboxMode: boolean;
  isActive: boolean;
  description?: string;
  _count?: {
    products: number;
    orders: number;
  };
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  ebayCategoryId: string;
  level: number;
}

export interface Order {
  id: string;
  customerEmail?: string;
  customerName?: string;
  status: string;
  totalAmount: number;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        const message =
          error.response?.data?.error ||
          error.message ||
          'An unexpected error occurred';
        throw new Error(message);
      },
    );
  }

  // Store Management
  async getStores(): Promise<ApiResponse<Store[]>> {
    const response = await this.api.get('/stores');
    return response.data;
  }

  async createStore(data: {
    name: string;
    userId: string;
    description?: string;
    sandboxMode?: boolean;
  }): Promise<ApiResponse<Store>> {
    const response = await this.api.post('/stores', data);
    return response.data;
  }

  async getStore(id: string): Promise<ApiResponse<Store>> {
    const response = await this.api.get(`/stores/${id}`);
    return response.data;
  }

  // Product Management
  async getProducts(storeId: string): Promise<ApiResponse<Product[]>> {
    const response = await this.api.get('/products', {
      params: { storeId },
    });
    return response.data;
  }

  async syncProduct(
    productId: string,
    storeId: string,
  ): Promise<ApiResponse<any>> {
    const response = await this.api.post(
      `/products/${productId}/sync/${storeId}`,
    );
    return response.data;
  }

  // Category Management
  async syncCategories(storeId: string): Promise<ApiResponse<Category[]>> {
    const response = await this.api.post(`/categories/sync/${storeId}`);
    return response.data;
  }

  // Order Management
  async getOrders(storeId: string): Promise<ApiResponse<Order[]>> {
    const response = await this.api.get('/orders', {
      params: { storeId },
    });
    return response.data;
  }

  async syncOrders(storeId: string): Promise<ApiResponse<Order[]>> {
    const response = await this.api.post(`/orders/sync/${storeId}`);
    return response.data;
  }

  // Authentication
  async getConsentUrl(
    storeId: string,
  ): Promise<ApiResponse<{ consentUrl: string; storeId: string }>> {
    const response = await this.api.get(`/auth/consent/${storeId}`);
    return response.data;
  }

  // Price Rules
  async getPriceRules(storeId: string): Promise<ApiResponse<any[]>> {
    const response = await this.api.get('/price-rules', {
      params: { storeId },
    });
    return response.data;
  }

  // Templates
  async getTemplates(storeId: string): Promise<ApiResponse<any[]>> {
    const response = await this.api.get('/templates', {
      params: { storeId },
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
