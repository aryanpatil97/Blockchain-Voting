// TypeScript interfaces for the Blockchain Voting system

export interface Election {
  id: string;
  title: string;
  description: string;
  candidates: Candidate[];
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  totalVotes: number;
  creator: string;
  createdAt: Date;
}

export interface Candidate {
  id: string;
  name: string;
  description: string;
  voteCount: number;
  percentage?: number;
  addedBy: string;
  addedAt: Date;
}

export interface VoterProfile {
  address: string;
  isRegistered: boolean;
  isEligible: boolean;
  registrationTime: Date;
  totalVotesCast: number;
  electionsVotedIn: string[];
}

export interface ElectionResults {
  electionId: string;
  candidateIds: string[];
  voteCounts: number[];
  totalVotes: number;
  isActive: boolean;
}

export interface Web3State {
  web3: any | null;
  account: string | null;
  networkId: number | null;
  isConnected: boolean;
  isLoading: boolean;
}

export interface VotingState {
  contract: any | null;
  elections: Election[];
  candidates: Candidate[];
  voterInfo: VoterProfile | null;
  isLoading: boolean;
}

export interface ElectionDetails {
  title: string;
  description: string;
  candidates: Candidate[];
  startTime: number;
  endTime: number;
}

export interface VotingService {
  connectWallet(): Promise<string>;
  createElection(details: ElectionDetails): Promise<string>;
  registerVoter(address: string): Promise<boolean>;
  castVote(electionId: string, candidateId: string): Promise<string>;
  getElectionResults(electionId: string): Promise<ElectionResults>;
}

// Error types
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  WALLET_ERROR = 'WALLET_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  TIMING_ERROR = 'TIMING_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface VotingError {
  type: ErrorType;
  message: string;
  code?: string | number;
  details?: any;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: VotingError;
  timestamp: string;
}

// Form types
export interface CreateElectionForm {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  candidateIds: string[];
}

export interface AddCandidateForm {
  name: string;
  description: string;
}

export interface VoterRegistrationForm {
  address: string;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface NotificationState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  id?: string;
}

// Filter and search types
export interface ElectionFilter {
  status: 'all' | 'active' | 'upcoming' | 'ended' | 'inactive';
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

export interface SortOptions {
  field: 'title' | 'startTime' | 'endTime' | 'totalVotes';
  direction: 'asc' | 'desc';
}

// Component Props types
export interface ElectionCardProps {
  election: Election;
  onVote?: (electionId: string) => void;
  onViewResults?: (electionId: string) => void;
  showActions?: boolean;
}

export interface CandidateCardProps {
  candidate: Candidate;
  isSelected?: boolean;
  onSelect?: (candidateId: string) => void;
  showVoteCount?: boolean;
}

export interface VotingFormProps {
  election: Election;
  candidates: Candidate[];
  onVote: (candidateId: string) => Promise<void>;
  isLoading?: boolean;
  voterInfo?: VoterProfile | null;
}

// Context types
export interface Web3ContextType {
  web3: any | null;
  account: string | null;
  networkId: number | null;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  switchNetwork: (networkId: number) => Promise<boolean>;
  getBalance: () => Promise<string>;
}

export interface VotingContextType {
  contract: any | null;
  elections: Election[];
  candidates: Candidate[];
  voterInfo: VoterProfile | null;
  isLoading: boolean;
  loadElections: () => Promise<void>;
  loadCandidates: () => Promise<void>;
  loadVoterInfo: () => Promise<void>;
  getElection: (electionId: string) => Promise<Election | null>;
  getCandidate: (candidateId: string) => Promise<Candidate | null>;
  castVote: (candidateId: string, electionId: string) => Promise<boolean>;
  getVotingResults: (electionId: string) => Promise<ElectionResults>;
  authorizeVoter: (voterAddress: string) => Promise<boolean>;
  addCandidate: (name: string, description: string) => Promise<boolean>;
  createElection: (title: string, description: string, startTime: number, endTime: number) => Promise<boolean>;
}

// Utility types
export type ElectionStatus = 'active' | 'upcoming' | 'ended' | 'inactive';

export type VoteStatus = 'not_voted' | 'voted' | 'not_authorized' | 'election_ended';

export type NetworkType = 'mainnet' | 'sepolia' | 'goerli' | 'ganache' | 'localhost';

// Configuration types
export interface AppConfig {
  contractAddress: string;
  networkId: number;
  rpcUrl: string;
  networkType: NetworkType;
  gasLimit: number;
  gasPrice: number;
}

export interface EnvironmentConfig {
  REACT_APP_CONTRACT_ADDRESS: string;
  REACT_APP_NETWORK_ID: string;
  REACT_APP_RPC_URL: string;
  REACT_APP_NETWORK_TYPE: NetworkType;
}

