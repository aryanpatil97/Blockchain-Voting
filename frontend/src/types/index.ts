// Type definitions for Blockchain Voting application

export interface Election {
  id: string;
  title: string;
  description: string;
  candidates: Candidate[];
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  totalVotes: number;
}

export interface Candidate {
  id: string;
  name: string;
  description: string;
  voteCount: number;
  percentage: number;
}

export interface VoterProfile {
  address: string;
  isRegistered: boolean;
  votingHistory: string[];
}

export interface Web3State {
  account: string | null;
  connected: boolean;
  networkId: number | null;
  balance: string;
}

export interface ContractState {
  votingContract: any;
  contractAddress: string;
  isLoaded: boolean;
}