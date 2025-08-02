import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService, TokenData } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @ApiOperation({
    description: 'Get eBay OAuth2 authorization URL',
    summary: 'Get eBay OAuth2 authorization URL',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns authorization URL',
    schema: {
      type: 'object',
      properties: {
        authUrl: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  getAuthUrl() {
    const authUrl = this.authService.getAuthorizationUrl();
    return {
      authUrl,
      message: 'Visit this URL to authorize the application with eBay',
    };
  }

  @Get('callback')
  @ApiOperation({ summary: 'eBay OAuth2 callback endpoint' })
  @ApiQuery({ name: 'code', description: 'Authorization code from eBay' })
  @ApiQuery({ name: 'state', required: false, description: 'State parameter' })
  @ApiResponse({
    status: 200,
    description: 'Successfully exchanged code for tokens',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        tokens: {
          type: 'object',
          properties: {
            access_token: { type: 'string' },
            refresh_token: { type: 'string' },
            expires_in: { type: 'number' },
            token_type: { type: 'string' },
            created_at: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Missing authorization code' })
  @ApiResponse({
    status: 500,
    description: 'Failed to exchange code for tokens',
  })
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      if (!code) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Authorization code is required',
        });
      }

      const tokens = await this.authService.exchangeCodeForToken(code);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Successfully authenticated with eBay',
        tokens: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
          token_type: tokens.token_type,
          created_at: tokens.created_at,
        },
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to exchange code for tokens',
        error: error.message,
      });
    }
  }

  @Get('status')
  @ApiOperation({ summary: 'Check authentication status' })
  @ApiResponse({
    status: 200,
    description: 'Authentication status',
    schema: {
      type: 'object',
      properties: {
        authenticated: { type: 'boolean' },
        tokenValid: { type: 'boolean' },
        tokens: {
          type: 'object',
          properties: {
            access_token: { type: 'string' },
            expires_in: { type: 'number' },
            token_type: { type: 'string' },
            created_at: { type: 'number' },
          },
        },
      },
    },
  })
  getAuthStatus() {
    const isAuthenticated = this.authService.isAuthenticated();
    const isTokenValid = this.authService.isTokenValid();
    const tokens = this.authService.getStoredTokens();

    return {
      authenticated: isAuthenticated,
      tokenValid: isTokenValid,
      tokens: tokens
        ? {
            access_token: tokens.access_token.substring(0, 20) + '...',
            expires_in: tokens.expires_in,
            token_type: tokens.token_type,
            created_at: tokens.created_at,
          }
        : null,
    };
  }

  @Get('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Successfully refreshed token',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        tokens: {
          type: 'object',
          properties: {
            access_token: { type: 'string' },
            expires_in: { type: 'number' },
            token_type: { type: 'string' },
            created_at: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No refresh token available' })
  @ApiResponse({ status: 500, description: 'Failed to refresh token' })
  async refreshToken(@Res() res: Response) {
    try {
      const tokens = await this.authService.refreshAccessToken();

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Successfully refreshed access token',
        tokens: {
          access_token: tokens.access_token,
          expires_in: tokens.expires_in,
          token_type: tokens.token_type,
          created_at: tokens.created_at,
        },
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to refresh token',
        error: error.message,
      });
    }
  }

  @Get('logout')
  @ApiOperation({ summary: 'Clear stored tokens (logout)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully cleared tokens',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  logout() {
    this.authService.clearTokens();
    return {
      success: true,
      message: 'Successfully logged out and cleared tokens',
    };
  }
}
