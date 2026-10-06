import axios, { AxiosInstance } from 'axios';
import { prisma } from '../../server.js';

export interface EbayToken {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: 'Application Access Token' | 'User Access Token';
}

export interface EbayAuthConfig {
  clientId: string;
  clientSecret: string;
  ruName: string;
  baseUrl: string;
  sandboxMode: boolean;
}

export class EbayAuthService {
  private axiosInstance: AxiosInstance;
  private config: EbayAuthConfig;

  constructor(config: EbayAuthConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Client Credentials Grant - Application Token for API metadata
   */
  async getApplicationToken(scopes: string[]): Promise<EbayToken> {
    try {
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        scope: scopes.join(' '),
      });

      const authString = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`,
      ).toString('base64');

      const response = await this.axiosInstance.post(
        '/identity/v1/oauth2/token',
        params,
        {
          headers: {
            Authorization: `Basic ${authString}`,
          },
        },
      );

      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
        token_type: response.data.token_type,
      };
    } catch (error: any) {
      console.error(
        'Error getting application token:',
        error.response?.data || error.message,
      );
      throw new Error(`Failed to get application token: ${error.message}`);
    }
  }

  /**
   * Authorization Code Grant - Step 1: Generate consent URL
   */
  generateConsentUrl(scopes: string[], state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.ruName,
      response_type: 'code',
      scope: scopes.join(' '),
      ...(state && { state }),
    });

    const baseUrl = this.config.sandboxMode
      ? 'https://auth.sandbox.ebay.com/oauth2/authorize'
      : 'https://auth.ebay.com/oauth2/authorize';

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Authorization Code Grant - Step 2: Exchange authorization code for tokens
   */
  async exchangeCodeForToken(code: string): Promise<EbayToken> {
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.config.ruName,
      });

      const authString = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`,
      ).toString('base64');

      const response = await this.axiosInstance.post(
        '/identity/v1/oauth2/token',
        params,
        {
          headers: {
            Authorization: `Basic ${authString}`,
          },
        },
      );

      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
        refresh_token: response.data.refresh_token,
        token_type: response.data.token_type,
      };
    } catch (error: any) {
      console.error(
        'Error exchanging code for token:',
        error.response?.data || error.message,
      );
      throw new Error(`Failed to exchange code for token: ${error.message}`);
    }
  }

  /**
   * Refresh User Access Token
   */
  async refreshAccessToken(refreshToken: string): Promise<EbayToken> {
    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      const authString = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`,
      ).toString('base64');

      const response = await this.axiosInstance.post(
        '/identity/v1/oauth2/token',
        params,
        {
          headers: {
            Authorization: `Basic ${authString}`,
          },
        },
      );

      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
        refresh_token: response.data.refresh_token || refreshToken,
        token_type: response.data.token_type,
      };
    } catch (error: any) {
      console.error(
        'Error refreshing access token:',
        error.response?.data || error.message,
      );
      throw new Error(`Failed to refresh access token: ${error.message}`);
    }
  }

  /**
   * Store tokens in database
   */
  async saveTokens(storeId: string, tokens: EbayToken): Promise<void> {
    try {
      const expiryDate = new Date(Date.now() + tokens.expires_in * 1000);

      await prisma.store.update({
        where: { id: storeId },
        data: {
          ebayToken: tokens.access_token,
          ebayTokenExpiry: expiryDate,
          ...(tokens.refresh_token && {
            ebayRefreshToken: tokens.refresh_token,
          }),
        },
      });
    } catch (error: any) {
      console.error('Error saving tokens:', error);
      throw new Error(`Failed to save tokens: ${error.message}`);
    }
  }

  /**
   * Get valid access token for store (auto-refresh if needed)
   */
  async getValidAccessToken(storeId: string): Promise<string> {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: {
          ebayToken: true,
          ebayTokenExpiry: true,
          ebayRefreshToken: true,
          sandboxMode: true,
        },
      });

      if (!store?.ebayToken) {
        throw new Error('No access token found for store');
      }

      // Check if token is expired
      const now = new Date();
      const expiryBuffer = 5 * 60 * 1000; // 5 minutes buffer

      if (
        store.ebayTokenExpiry &&
        now.getTime() > store.ebayTokenExpiry.getTime() - expiryBuffer
      ) {
        // Token expired, try to refresh
        if (!store.ebayRefreshToken) {
          throw new Error('Token expired and no refresh token available');
        }

        console.log(
          '🔄 Refreshing expired eBay access token for store:',
          storeId,
        );

        const newTokens = await this.refreshAccessToken(store.ebayRefreshToken);
        await this.saveTokens(storeId, newTokens);

        return newTokens.access_token;
      }

      return store.ebayToken;
    } catch (error: any) {
      console.error('Error getting valid access token:', error);
      throw new Error(`Failed to get valid access token: ${error.message}`);
    }
  }
}
