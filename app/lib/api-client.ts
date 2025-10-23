// lib/api-client.ts

/**
 * API Client with automatic token refresh
 * Handles 401 errors transparently by refreshing tokens
 * Only activates proactive refresh when user is authenticated
 */

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

class APIClient {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;
  private tokenExpiryTimer: NodeJS.Timeout | null = null;
  private isActive = false; // Track if proactive refresh is active
  
  // Token lifetime in milliseconds (2 minutes for testing)
  private readonly TOKEN_LIFETIME = 15 * 60 * 1000; // 15 minutes
  // Refresh when 75% time has passed (x seconds into 15 min token)
  private readonly REFRESH_THRESHOLD = 0.75;

  /**
   * Start proactive token refresh
   * Call this after successful login
   */
  public startProactiveRefresh() {
    // Don't start if already active
    if (this.isActive) {
      console.log('⚠️ Proactive refresh already active');
      return;
    }

    const refreshInterval = this.TOKEN_LIFETIME * this.REFRESH_THRESHOLD;
    
    console.log(`🔄 Proactive refresh activated (every ${refreshInterval / 1000}s)`);
    
    this.tokenExpiryTimer = setInterval(async () => {
      console.log('⏰ Proactive refresh triggered');
      await this.refreshTokens();
    }, refreshInterval);

    this.isActive = true;
  }

  /**
   * Stop the proactive refresh timer
   * Call this on logout
   */
  public stopProactiveRefresh() {
    if (this.tokenExpiryTimer) {
      clearInterval(this.tokenExpiryTimer);
      this.tokenExpiryTimer = null;
      this.isActive = false;
      console.log('⏹️ Proactive refresh stopped');
    }
  }

  /**
   * Check if proactive refresh is currently active
   */
  public isProactiveRefreshActive(): boolean {
    return this.isActive;
  }

  /**
   * Refresh tokens via API
   */
  private async refreshTokens(): Promise<boolean> {
    // Prevent multiple simultaneous refresh requests
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        console.log('🔄 Attempting token refresh...');
        
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          console.error('❌ Token refresh failed:', response.status);
          this.handleRefreshFailure();
          return false;
        }

        const data = await response.json();
        console.log('✅ Token refresh successful');
        console.log(data);
        
        return true;
      } catch (error) {
        console.error('💥 Token refresh error:', error);
        this.handleRefreshFailure();
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Handle refresh failure - logout user and stop proactive refresh
   */
  private handleRefreshFailure() {
    this.stopProactiveRefresh();
    
    if (typeof window !== 'undefined') {
      console.log('🚪 Auto-logout due to refresh failure');
      
      // Import dynamically to avoid circular dependencies
      import('@/app/stores/auth.store').then(({ useAuthStore }) => {
        useAuthStore.getState().logout();
      });
    }
  }

  /**
   * Main fetch method with automatic retry on 401
   * Works on both public and private pages
   */
  async fetch<T = unknown>(
    url: string,
    config: RequestConfig = {}
  ): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { skipAuth, skipRefresh, ...fetchConfig } = config;

    // Make the initial request
    let response = await fetch(url, {
      ...fetchConfig,
      credentials: 'include',
    });

    // If 401 and we haven't tried refreshing yet
    if (response.status === 401 && !skipRefresh) {
      console.log('🔒 Got 401, attempting refresh...');
      
      const refreshed = await this.refreshTokens();
      
      if (refreshed) {
        console.log('🔁 Retrying original request with new token...');
        // Retry the original request
        response = await fetch(url, {
          ...fetchConfig,
          credentials: 'include',
        });
      } else {
        throw new Error('Authentication failed');
      }
    }

    // Parse response
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Request failed',
        detail: response.statusText
      }));
      throw new Error(error.detail || error.error || 'Request failed');
    }

    return response.json();
  }

  /**
   * Cleanup - stop timers
   */
  cleanup() {
    this.stopProactiveRefresh();
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    apiClient.cleanup();
  });
}