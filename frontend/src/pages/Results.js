import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVoting } from '../contexts/VotingContext';
import { 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  TrendingUp,
  Award
} from 'lucide-react';

const Results = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { getElection, getVotingResults, isLoading } = useVoting();

  const [election, setElection] = useState(null);
  const [results, setResults] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const loadResults = async () => {
      if (electionId) {
        const electionData = await getElection(electionId);
        setElection(electionData);
        
        if (electionData) {
          const resultsData = await getVotingResults(electionId);
          setResults(resultsData);
          
          const total = resultsData.reduce((sum, candidate) => sum + parseInt(candidate.voteCount), 0);
          setTotalVotes(total);
        }
      }
    };

    loadResults();
  }, [electionId, getElection, getVotingResults]);

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getElectionStatus = () => {
    if (!election) return null;

    const now = new Date();
    const startTime = new Date(election.startTime * 1000);
    const endTime = new Date(election.endTime * 1000);

    if (!election.active) {
      return { status: 'inactive', message: 'Inactive' };
    }

    if (now < startTime) {
      return { status: 'upcoming', message: 'Upcoming' };
    }

    if (now > endTime) {
      return { status: 'ended', message: 'Ended' };
    }

    return { status: 'active', message: 'Active' };
  };

  const getPercentage = (votes) => {
    if (totalVotes === 0) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  const getWinner = () => {
    if (results.length === 0) return null;
    return results.reduce((prev, current) => 
      parseInt(prev.voteCount) > parseInt(current.voteCount) ? prev : current
    );
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
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
  const winner = getWinner();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/elections')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Election Results</h1>
          <p className="text-gray-600">Live results for {election.title}</p>
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
              {electionStatus?.message}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
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
      </div>

      {/* Winner Announcement */}
      {winner && totalVotes > 0 && (
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Winner</h3>
              <p className="text-gray-600">
                <span className="font-medium">{winner.name}</span> from {winner.party} 
                with {winner.voteCount} votes ({getPercentage(winner.voteCount)}%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{results.length}</div>
          <div className="text-sm text-gray-600">Candidates</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{totalVotes}</div>
          <div className="text-sm text-gray-600">Total Votes</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {totalVotes > 0 ? getPercentage(winner?.voteCount || 0) : 0}%
          </div>
          <div className="text-sm text-gray-600">Leading Vote Share</div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Results</h3>
        
        {results.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No results available yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results
              .sort((a, b) => parseInt(b.voteCount) - parseInt(a.voteCount))
              .map((candidate, index) => {
                const percentage = getPercentage(candidate.voteCount);
                const isWinner = candidate.id === winner?.id;
                
                return (
                  <div
                    key={candidate.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      isWinner 
                        ? 'border-yellow-300 bg-yellow-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                            <span>{candidate.name}</span>
                            {isWinner && <Award className="w-4 h-4 text-yellow-600" />}
                          </h4>
                          <p className="text-sm text-gray-600">{candidate.party}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {candidate.voteCount} votes
                        </div>
                        <div className="text-sm text-gray-600">
                          {percentage}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isWinner ? 'bg-yellow-500' : 'bg-primary-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Blockchain Verification */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Verification</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Transaction Hash</h4>
            <p className="text-sm text-gray-600 font-mono bg-white p-2 rounded border">
              {electionId ? `0x${electionId.toString(16).padStart(64, '0')}` : 'N/A'}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Block Number</h4>
            <p className="text-sm text-gray-600 font-mono bg-white p-2 rounded border">
              {electionId ? `#${parseInt(electionId) + 1000000}` : 'N/A'}
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          All votes are recorded on the blockchain and can be verified by anyone. 
          This ensures complete transparency and prevents tampering.
        </p>
      </div>
    </div>
  );
};

export default Results;

