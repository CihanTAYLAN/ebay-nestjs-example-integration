import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import eBayApi = require('ebay-api');

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  created_at: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private eBay: eBayApi;
  private storedTokens: TokenData | null = null;
  private readonly tokenFilePath = path.join(process.cwd(), 'tokens.json');

  constructor(private configService: ConfigService) {
    this.eBay = new eBayApi({
      appId: this.configService.get<string>('EBAY_APP_ID'),
      certId: this.configService.get<string>('EBAY_CERT_ID'),
      ruName: this.configService.get<string>('EBAY_RU_NAME'),
      sandbox: this.configService.get<string>('EBAY_SANDBOX') === 'true',
    });

    this.eBay.OAuth2.setScope(process.env.EBAY_OAUTH_SCOPE.split(' '));

    // Uygulama başlatıldığında token'ları yükle
    this.loadTokensFromFile();
  }

  /**
   * Token'ları dosyadan yükler
   */
  private loadTokensFromFile(): void {
    try {
      if (fs.existsSync(this.tokenFilePath)) {
        const tokenData = fs.readFileSync(this.tokenFilePath, 'utf8');
        this.storedTokens = JSON.parse(tokenData);

        if (this.storedTokens) {
          this.eBay.OAuth2.setCredentials(this.storedTokens.access_token);
          this.logger.log('Tokens loaded from file successfully');
        }
      }
    } catch (error) {
      this.logger.error('Failed to load tokens from file', error.stack);
      this.storedTokens = null;
    }
  }

  /**
   * Token'ları dosyaya kaydeder
   */
  private saveTokensToFile(tokens: TokenData): void {
    try {
      fs.writeFileSync(this.tokenFilePath, JSON.stringify(tokens, null, 2));
      this.logger.log('Tokens saved to file successfully');
    } catch (error) {
      this.logger.error('Failed to save tokens to file', error.stack);
    }
  }

  /**
   * eBay OAuth2 authorization URL'ini oluşturur
   */
  getAuthorizationUrl(): string {
    const authUrl = this.eBay.OAuth2.generateAuthUrl();
    this.logger.log(`Generated authorization URL: ${authUrl}`);
    return authUrl;
  }

  /**
   * Authorization code ile access token alır
   */
  async exchangeCodeForToken(code: string): Promise<TokenData> {
    try {
      this.logger.log(`Exchanging authorization code for tokens...`);
      console.log('Code:', code);

      const tokenResponse = await this.eBay.OAuth2.getToken(
        code,
        this.configService.getOrThrow('EBAY_RU_NAME'),
      );

      console.log('Token Response:', tokenResponse);

      const tokenData: TokenData = {
        access_token: tokenResponse.access_token,
        refresh_token: (tokenResponse as any).refresh_token,
        expires_in: tokenResponse.expires_in,
        token_type: tokenResponse.token_type || 'Bearer',
        created_at: Date.now(),
      };

      // Token'ları sakla
      this.storedTokens = tokenData;

      // Token'ları dosyaya kaydet
      this.saveTokensToFile(tokenData);

      // eBay API'sine token'ları set et
      this.eBay.OAuth2.setCredentials(tokenResponse.access_token);

      this.logger.log('Successfully exchanged code for tokens');
      return tokenData;
    } catch (error) {
      console.log(error.response);

      this.logger.error('Failed to exchange code for token', error.stack);
      throw error;
    }
  }

  /**
   * Refresh token ile access token'ı yeniler
   */
  async refreshAccessToken(): Promise<TokenData> {
    if (!this.storedTokens?.refresh_token) {
      throw new Error('No refresh token available');
    }

    try {
      this.logger.log('Refreshing access token...');

      // eBay API refresh token metodunu çağır
      const tokenResponse = await this.eBay.OAuth2.refreshToken();

      const tokenData: TokenData = {
        access_token: tokenResponse.access_token,
        refresh_token: this.storedTokens.refresh_token, // Keep existing refresh token
        expires_in: tokenResponse.expires_in,
        token_type: tokenResponse.token_type || 'Bearer',
        created_at: Date.now(),
      };

      this.storedTokens = tokenData;

      // Yenilenen token'ları dosyaya kaydet
      this.saveTokensToFile(tokenData);

      this.eBay.OAuth2.setCredentials(tokenResponse.access_token);

      this.logger.log('Successfully refreshed access token');
      return tokenData;
    } catch (error) {
      this.logger.error('Failed to refresh access token', error.stack);
      throw error;
    }
  }

  /**
   * Token'ın geçerli olup olmadığını kontrol eder
   */
  isTokenValid(): boolean {
    if (!this.storedTokens) {
      return false;
    }

    const expirationTime =
      this.storedTokens.created_at + this.storedTokens.expires_in * 1000;
    const currentTime = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 dakika buffer

    return currentTime < expirationTime - bufferTime;
  }

  /**
   * Geçerli token'ı döner, gerekirse yeniler
   */
  async getValidToken(): Promise<TokenData> {
    if (!this.storedTokens) {
      throw new Error('No tokens available. Please authorize first.');
    }

    if (this.isTokenValid()) {
      return this.storedTokens;
    }

    // Token süresi dolmuşsa yenile
    return await this.refreshAccessToken();
  }

  /**
   * Mevcut token bilgilerini döner
   */
  getStoredTokens(): TokenData | null {
    return this.storedTokens;
  }

  /**
   * eBay API instance'ını döner
   */
  getEBayApi(): eBayApi {
    return this.eBay;
  }

  /**
   * Authentication durumunu kontrol eder
   */
  async ensureAuthenticated(): Promise<void> {
    if (!this.storedTokens) {
      throw new Error('Not authenticated. Please authorize first.');
    }

    if (!this.isTokenValid()) {
      await this.refreshAccessToken();
    }
  }

  /**
   * Token'ları manuel olarak set eder (test amaçlı)
   */
  setTokens(tokens: TokenData): void {
    this.storedTokens = tokens;
    this.saveTokensToFile(tokens);
    this.eBay.OAuth2.setCredentials(tokens.access_token);
    this.logger.log('Tokens set manually');
  }

  /**
   * Token'ları temizler
   */
  clearTokens(): void {
    this.storedTokens = null;
    try {
      if (fs.existsSync(this.tokenFilePath)) {
        fs.unlinkSync(this.tokenFilePath);
        this.logger.log('Tokens cleared successfully');
      }
    } catch (error) {
      this.logger.error('Failed to clear tokens', error.stack);
    }
  }

  /**
   * Authentication durumunu kontrol eder
   */
  isAuthenticated(): boolean {
    return this.storedTokens !== null;
  }
}
