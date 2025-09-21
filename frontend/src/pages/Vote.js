import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useVoting } from '../contexts/VotingContext';
import { 
  Vote, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const Vote = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { isConnected, account } = useWeb3();
  const { 
    getElection, 
    getVotingResults, 
    castVote, 
    voterInfo, 
    candidates,
    isLoading 
  } = useVoting();

  const [election, setElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const loadElectionData = async () => {
      if (electionId) {
        const electionData = await getElection(electionId);
        setElection(electionData);
        
        if (electionData) {
          const resultsData = await getVotingResults(electionId);
          setResults(resultsData);
        }
      }
    };

    loadElectionData();
  }, [electionId, getElection, getVotingResults]);

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate to vote for');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!voterInfo?.authorized) {
      toast.error('You are not authorized to vote in this election');
      return;
    }

    if (voterInfo?.voted) {
      toast.error('You have already voted in this election');
      return;
    }

    setIsVoting(true);
    const success = await castVote(selectedCandidate.id, electionId);
    setIsVoting(false);

    if (success) {
      navigate(`/results/${electionId}`);
    }
  };

  const getElectionStatus = () => {
    if (!election) return null;

    const now = new Date();
    const startTime = new Date(election.startTime * 1000);
    const endTime = new Date(election.endTime * 1000);

    if (!election.active) {
      return { status: 'inactive', message: 'This election is not active' };
    }

    if (now < startTime) {
      return { status: 'upcoming', message: 'This election has not started yet' };
    }

    if (now > endTime) {
      return { status: 'ended', message: 'This election has ended' };
    }

    return { status: 'active', message: 'Voting is now open' };
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime * 1000);
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} days, ${hours} hours remaining`;
    if (hours > 0) return `${hours} hours, ${minutes} minutes remaining`;
    return `${minutes} minutes remaining`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Election Not Found</h2>
        <p className="text-gray-600 mb-6">The election you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/elections')}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Elections</span>
        </button>
      </div>
    );
  }

  const electionStatus = getElectionStatus();
  const canVote = electionStatus?.status === 'active' && 
                  isConnected && 
                  voterInfo?.authorized && 
                  !voterInfo?.voted;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/elections')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cast Your Vote</h1>
          <p className="text-gray-600">Make your voice heard in this important election</p>
        </div>
      </div>

      {/* Election Info */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{election.title}</h2>
            <p className="text-gray-600 mb-4">{election.description}</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              electionStatus?.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : electionStatus?.status === 'upcoming'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {electionStatus?.status === 'active' && <CheckCircle className="w-4 h-4 mr-1" />}
              {electionStatus?.status === 'upcoming' && <Clock className="w-4 h-4 mr-1" />}
              {electionStatus?.status === 'ended' && <AlertCircle className="w-4 h-4 mr-1" />}
              {electionStatus?.message}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-3" />
            <div>
              <div className="font-medium">Start Time</div>
              <div className="text-sm">{formatDate(election.startTime)}</div>
            </div>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-3" />
            <div>
              <div className="font-medium">End Time</div>
              <div className="text-sm">{formatDate(election.endTime)}</div>
            </div>
          </div>
        </div>

        {electionStatus?.status === 'active' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <div className="font-medium text-green-800">Voting is Active</div>
                <div className="text-sm text-green-700">
                  {getTimeRemaining(election.endTime)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Voter Status */}
      {isConnected && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Voting Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Wallet Connected:</span>
              <span className="font-medium text-green-600">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Authorization Status:</span>
              <span className={`font-medium ${
                voterInfo?.authorized ? 'text-green-600' : 'text-red-600'
              }`}>
                {voterInfo?.authorized ? 'Authorized' : 'Not Authorized'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Vote Status:</span>
              <span className={`font-medium ${
                voterInfo?.voted ? 'text-red-600' : 'text-green-600'
              }`}>
                {voterInfo?.voted ? 'Already Voted' : 'Not Voted'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Candidates */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Select Your Candidate</h3>
        
        {candidates.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No candidates available for this election.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedCandidate?.id === candidate.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCandidate(candidate)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedCandidate?.id === candidate.id
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedCandidate?.id === candidate.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{candidate.name}</h4>
                    <p className="text-sm text-gray-600">{candidate.party}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {results.find(r => r.id === candidate.id)?.voteCount || 0} votes
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vote Button */}
        {canVote && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-4 h-4 mr-2" />
                <span>Your vote is secure and anonymous</span>
              </div>
              <button
                onClick={handleVote}
                disabled={!selectedCandidate || isVoting}
                className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVoting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Casting Vote...</span>
                  </>
                ) : (
                  <>
                    <Vote className="w-4 h-4" />
                    <span>Cast Vote</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Not Authorized Message */}
        {isConnected && !voterInfo?.authorized && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <h4 className="font-medium text-yellow-800">Not Authorized to Vote</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You need to be authorized by the election administrator to participate in this election.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Already Voted Message */}
        {isConnected && voterInfo?.voted && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-blue-800">Vote Already Cast</h4>
                <p className="text-sm text-blue-700 mt-1">
                  You have already voted in this election. You can view the results below.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vote;

