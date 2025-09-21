import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWeb3 } from './Web3Context';
import VotingSystemABI from '../utils/VotingSystemABI.json';
import toast from 'react-hot-toast';

const VotingContext = createContext();

export const useVoting = () => {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};

export const VotingProvider = ({ children }) => {
  const { web3, account, isConnected } = useWeb3();
  const [contract, setContract] = useState(null);
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [voterInfo, setVoterInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  // Initialize contract
  useEffect(() => {
    if (web3 && contractAddress) {
      try {
        const contractInstance = new web3.eth.Contract(VotingSystemABI, contractAddress);
        setContract(contractInstance);
      } catch (error) {
        console.error('Error initializing contract:', error);
        toast.error('Failed to initialize voting contract');
      }
    }
  }, [web3, contractAddress]);

  // Load voter information
  const loadVoterInfo = async () => {
    if (!contract || !account) return;

    try {
      const voter = await contract.methods.getVoter(account).call();
      setVoterInfo(voter);
    } catch (error) {
      console.error('Error loading voter info:', error);
      // Voter might not exist yet, which is okay
      setVoterInfo(null);
    }
  };

  // Load all elections
  const loadElections = async () => {
    if (!contract) return;

    try {
      setIsLoading(true);
      const electionsData = await contract.methods.getAllElections().call();
      setElections(electionsData);
    } catch (error) {
      console.error('Error loading elections:', error);
      toast.error('Failed to load elections');
    } finally {
      setIsLoading(false);
    }
  };

  // Load all candidates
  const loadCandidates = async () => {
    if (!contract) return;

    try {
      const candidatesData = await contract.methods.getAllCandidates().call();
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast.error('Failed to load candidates');
    }
  };

  // Get election by ID
  const getElection = async (electionId) => {
    if (!contract) return null;

    try {
      const election = await contract.methods.getElection(electionId).call();
      return election;
    } catch (error) {
      console.error('Error getting election:', error);
      return null;
    }
  };

  // Get candidate by ID
  const getCandidate = async (candidateId) => {
    if (!contract) return null;

    try {
      const candidate = await contract.methods.getCandidate(candidateId).call();
      return candidate;
    } catch (error) {
      console.error('Error getting candidate:', error);
      return null;
    }
  };

  // Cast a vote
  const castVote = async (candidateId, electionId) => {
    if (!contract || !account) {
      toast.error('Please connect your wallet first');
      return false;
    }

    try {
      setIsLoading(true);
      const gasEstimate = await contract.methods.vote(candidateId, electionId).estimateGas({
        from: account
      });

      const tx = await contract.methods.vote(candidateId, electionId).send({
        from: account,
        gas: gasEstimate
      });

      toast.success('Vote cast successfully!');
      
      // Reload voter info and candidates
      await loadVoterInfo();
      await loadCandidates();
      
      return true;
    } catch (error) {
      console.error('Error casting vote:', error);
      
      if (error.message.includes('Voter not authorized')) {
        toast.error('You are not authorized to vote in this election');
      } else if (error.message.includes('Voter has already voted')) {
        toast.error('You have already voted in this election');
      } else if (error.message.includes('Election is not active')) {
        toast.error('This election is not currently active');
      } else if (error.message.includes('Election has ended')) {
        toast.error('This election has already ended');
      } else {
        toast.error('Failed to cast vote. Please try again.');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get voting results
  const getVotingResults = async (electionId) => {
    if (!contract) return [];

    try {
      const results = await contract.methods.getVotingResults(electionId).call();
      return results;
    } catch (error) {
      console.error('Error getting voting results:', error);
      toast.error('Failed to load voting results');
      return [];
    }
  };

  // Admin functions
  const authorizeVoter = async (voterAddress) => {
    if (!contract || !account) return false;

    try {
      setIsLoading(true);
      const gasEstimate = await contract.methods.authorizeVoter(voterAddress).estimateGas({
        from: account
      });

      await contract.methods.authorizeVoter(voterAddress).send({
        from: account,
        gas: gasEstimate
      });

      toast.success('Voter authorized successfully!');
      return true;
    } catch (error) {
      console.error('Error authorizing voter:', error);
      toast.error('Failed to authorize voter');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addCandidate = async (name, party) => {
    if (!contract || !account) return false;

    try {
      setIsLoading(true);
      const gasEstimate = await contract.methods.addCandidate(name, party).estimateGas({
        from: account
      });

      await contract.methods.addCandidate(name, party).send({
        from: account,
        gas: gasEstimate
      });

      toast.success('Candidate added successfully!');
      await loadCandidates();
      return true;
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast.error('Failed to add candidate');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createElection = async (title, description, startTime, endTime) => {
    if (!contract || !account) return false;

    try {
      setIsLoading(true);
      const gasEstimate = await contract.methods.createElection(
        title,
        description,
        startTime,
        endTime
      ).estimateGas({
        from: account
      });

      await contract.methods.createElection(
        title,
        description,
        startTime,
        endTime
      ).send({
        from: account,
        gas: gasEstimate
      });

      toast.success('Election created successfully!');
      await loadElections();
      return true;
    } catch (error) {
      console.error('Error creating election:', error);
      toast.error('Failed to create election');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when contract is available
  useEffect(() => {
    if (contract && isConnected) {
      loadElections();
      loadCandidates();
      loadVoterInfo();
    }
  }, [contract, isConnected]);

  const value = {
    contract,
    elections,
    candidates,
    voterInfo,
    isLoading,
    loadElections,
    loadCandidates,
    loadVoterInfo,
    getElection,
    getCandidate,
    castVote,
    getVotingResults,
    authorizeVoter,
    addCandidate,
    createElection,
  };

  return (
    <VotingContext.Provider value={value}>
      {children}
    </VotingContext.Provider>
  );
};

