import { VotingError, ErrorType } from '../types';

/**
 * Custom error handling utilities for the Blockchain Voting system
 */

export class VotingErrorHandler {
  /**
   * Create a standardized error object
   */
  static createError(
    type: ErrorType,
    message: string,
    code?: string | number,
    details?: any
  ): VotingError {
    return {
      type,
      message,
      code,
      details,
    };
  }

  /**
   * Handle Web3/blockchain errors
   */
  static handleWeb3Error(error: any): VotingError {
    const errorMessage = error.message || error.toString();
    
    // MetaMask errors
    if (error.code === 4001) {
      return this.createError(
        ErrorType.WALLET_ERROR,
        'User rejected the transaction request',
        error.code
      );
    }
    
    if (error.code === -32602) {
      return this.createError(
        ErrorType.VALIDATION_ERROR,
        'Invalid method parameters',
        error.code
      );
    }
    
    if (error.code === -32603) {
      return this.createError(
        ErrorType.CONTRACT_ERROR,
        'Internal JSON-RPC error',
        error.code
      );
    }
    
    // Network errors
    if (errorMessage.includes('network')) {
      return this.createError(
        ErrorType.NETWORK_ERROR,
        'Network connection error. Please check your internet connection.',
        'NETWORK_ERROR'
      );
    }
    
    // Gas estimation errors
    if (errorMessage.includes('gas')) {
      return this.createError(
        ErrorType.CONTRACT_ERROR,
        'Transaction failed due to insufficient gas or contract error',
        'GAS_ERROR'
      );
    }
    
    // Contract-specific errors
    if (errorMessage.includes('Voter not authorized')) {
      return this.createError(
        ErrorType.PERMISSION_ERROR,
        'You are not authorized to vote in this election',
        'NOT_AUTHORIZED'
      );
    }
    
    if (errorMessage.includes('Voter has already voted')) {
      return this.createError(
        ErrorType.VALIDATION_ERROR,
        'You have already voted in this election',
        'ALREADY_VOTED'
      );
    }
    
    if (errorMessage.includes('Election is not active')) {
      return this.createError(
        ErrorType.TIMING_ERROR,
        'This election is not currently active',
        'ELECTION_INACTIVE'
      );
    }
    
    if (errorMessage.includes('Election has not started')) {
      return this.createError(
        ErrorType.TIMING_ERROR,
        'This election has not started yet',
        'ELECTION_NOT_STARTED'
      );
    }
    
    if (errorMessage.includes('Election has ended')) {
      return this.createError(
        ErrorType.TIMING_ERROR,
        'This election has already ended',
        'ELECTION_ENDED'
      );
    }
    
    if (errorMessage.includes('Candidate does not exist')) {
      return this.createError(
        ErrorType.VALIDATION_ERROR,
        'The selected candidate does not exist',
        'CANDIDATE_NOT_FOUND'
      );
    }
    
    if (errorMessage.includes('Election does not exist')) {
      return this.createError(
        ErrorType.VALIDATION_ERROR,
        'The election does not exist',
        'ELECTION_NOT_FOUND'
      );
    }
    
    // Default contract error
    return this.createError(
      ErrorType.CONTRACT_ERROR,
      `Contract error: ${errorMessage}`,
      'CONTRACT_ERROR',
      error
    );
  }

  /**
   * Handle wallet connection errors
   */
  static handleWalletError(error: any): VotingError {
    const errorMessage = error.message || error.toString();
    
    if (errorMessage.includes('User denied')) {
      return this.createError(
        ErrorType.WALLET_ERROR,
        'Wallet connection was denied by user',
        'USER_DENIED'
      );
    }
    
    if (errorMessage.includes('No Ethereum provider')) {
      return this.createError(
        ErrorType.WALLET_ERROR,
        'No Ethereum wallet found. Please install MetaMask.',
        'NO_WALLET'
      );
    }
    
    if (errorMessage.includes('Unsupported chain')) {
      return this.createError(
        ErrorType.NETWORK_ERROR,
        'Unsupported blockchain network. Please switch to the correct network.',
        'UNSUPPORTED_CHAIN'
      );
    }
    
    return this.createError(
      ErrorType.WALLET_ERROR,
      `Wallet error: ${errorMessage}`,
      'WALLET_ERROR',
      error
    );
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(message: string, field?: string): VotingError {
    return this.createError(
      ErrorType.VALIDATION_ERROR,
      message,
      'VALIDATION_ERROR',
      { field }
    );
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: any): VotingError {
    const errorMessage = error.message || error.toString();
    
    if (errorMessage.includes('timeout')) {
      return this.createError(
        ErrorType.NETWORK_ERROR,
        'Request timed out. Please try again.',
        'TIMEOUT'
      );
    }
    
    if (errorMessage.includes('fetch')) {
      return this.createError(
        ErrorType.NETWORK_ERROR,
        'Network request failed. Please check your connection.',
        'FETCH_ERROR'
      );
    }
    
    return this.createError(
      ErrorType.NETWORK_ERROR,
      `Network error: ${errorMessage}`,
      'NETWORK_ERROR',
      error
    );
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: VotingError): string {
    switch (error.type) {
      case ErrorType.WALLET_ERROR:
        return error.message || 'Wallet connection error';
      
      case ErrorType.NETWORK_ERROR:
        return error.message || 'Network connection error';
      
      case ErrorType.CONTRACT_ERROR:
        return error.message || 'Smart contract error';
      
      case ErrorType.PERMISSION_ERROR:
        return error.message || 'Permission denied';
      
      case ErrorType.TIMING_ERROR:
        return error.message || 'Timing error';
      
      case ErrorType.VALIDATION_ERROR:
        return error.message || 'Invalid input';
      
      default:
        return error.message || 'An unexpected error occurred';
    }
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: VotingError): boolean {
    const retryableTypes = [
      ErrorType.NETWORK_ERROR,
      ErrorType.CONTRACT_ERROR
    ];
    
    const retryableCodes = [
      'TIMEOUT',
      'FETCH_ERROR',
      'NETWORK_ERROR',
      'GAS_ERROR'
    ];
    
    return retryableTypes.includes(error.type) || 
           (error.code && retryableCodes.includes(error.code.toString()));
  }

  /**
   * Get error severity level
   */
  static getErrorSeverity(error: VotingError): 'low' | 'medium' | 'high' | 'critical' {
    switch (error.type) {
      case ErrorType.VALIDATION_ERROR:
        return 'low';
      
      case ErrorType.TIMING_ERROR:
      case ErrorType.PERMISSION_ERROR:
        return 'medium';
      
      case ErrorType.WALLET_ERROR:
      case ErrorType.NETWORK_ERROR:
        return 'high';
      
      case ErrorType.CONTRACT_ERROR:
        return 'critical';
      
      default:
        return 'medium';
    }
  }

  /**
   * Log error for debugging
   */
  static logError(error: VotingError, context?: string): void {
    const severity = this.getErrorSeverity(error);
    const logMessage = `[${severity.toUpperCase()}] ${context || 'VotingError'}: ${error.message}`;
    
    if (severity === 'critical' || severity === 'high') {
      console.error(logMessage, error);
    } else {
      console.warn(logMessage, error);
    }
  }
}

/**
 * Error boundary component for React
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: VotingError }> },
  { hasError: boolean; error: VotingError | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): { hasError: boolean; error: VotingError } {
    const votingError = VotingErrorHandler.handleWeb3Error(error);
    return { hasError: true, error: votingError };
  }

  componentDidCatch(error: any, errorInfo: any) {
    const votingError = VotingErrorHandler.handleWeb3Error(error);
    VotingErrorHandler.logError(votingError, 'ErrorBoundary');
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<{ error: VotingError }> = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="ml-3 text-lg font-medium text-gray-900">Something went wrong</h2>
      </div>
      
      <p className="text-gray-600 mb-4">
        {VotingErrorHandler.getUserFriendlyMessage(error)}
      </p>
      
      <div className="flex space-x-3">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          Reload Page
        </button>
        <button
          onClick={() => this.setState({ hasError: false, error: null })}
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

