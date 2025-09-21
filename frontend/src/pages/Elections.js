import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useVoting } from '../contexts/VotingContext';
import { 
  Calendar, 
  Clock, 
  Users, 
  Vote, 
  Eye,
  CheckCircle,
  AlertCircle,
  Play
} from 'lucide-react';

const Elections = () => {
  const { isConnected } = useWeb3();
  const { elections, loadElections, isLoading } = useVoting();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadElections();
  }, [loadElections]);

  const getElectionStatus = (election) => {
    const now = new Date();
    const startTime = new Date(election.startTime * 1000);
    const endTime = new Date(election.endTime * 1000);

    if (!election.active) {
      return { status: 'inactive', label: 'Inactive', color: 'gray' };
    }

    if (now < startTime) {
      return { status: 'upcoming', label: 'Upcoming', color: 'blue' };
    }

    if (now >= startTime && now <= endTime) {
      return { status: 'active', label: 'Active', color: 'green' };
    }

    return { status: 'ended', label: 'Ended', color: 'red' };
  };

  const filteredElections = elections.filter(election => {
    const status = getElectionStatus(election);
    if (filter === 'all') return true;
    return status.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />;
      case 'upcoming':
        return <Clock className="w-4 h-4" />;
      case 'ended':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    return colors[color] || colors.gray;
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

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Elections</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Participate in secure, transparent elections powered by blockchain technology. 
          Your vote is recorded immutably and can be verified by anyone.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {[
          { key: 'all', label: 'All Elections' },
          { key: 'active', label: 'Active' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'ended', label: 'Ended' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              filter === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Elections Grid */}
      {filteredElections.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No elections found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'There are no elections available at the moment.'
              : `There are no ${filter} elections at the moment.`
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredElections.map((election) => {
            const status = getElectionStatus(election);
            const isActive = status.status === 'active';
            const isUpcoming = status.status === 'upcoming';
            const canVote = isConnected && isActive;

            return (
              <div key={election.id} className="card hover:shadow-md transition-shadow duration-200">
                {/* Election Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {election.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {election.description}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status.color)}`}>
                    {getStatusIcon(status.status)}
                    <span className="ml-1">{status.label}</span>
                  </span>
                  {isActive && (
                    <span className="text-xs text-gray-500">
                      {getTimeRemaining(election.endTime)}
                    </span>
                  )}
                </div>

                {/* Election Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Starts: {formatDate(election.startTime)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Ends: {formatDate(election.endTime)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {canVote ? (
                    <Link
                      to={`/vote/${election.id}`}
                      className="flex-1 btn-primary text-center inline-flex items-center justify-center space-x-2"
                    >
                      <Vote className="w-4 h-4" />
                      <span>Vote Now</span>
                    </Link>
                  ) : isUpcoming ? (
                    <div className="flex-1 btn-secondary text-center inline-flex items-center justify-center space-x-2 cursor-not-allowed opacity-50">
                      <Clock className="w-4 h-4" />
                      <span>Upcoming</span>
                    </div>
                  ) : (
                    <Link
                      to={`/results/${election.id}`}
                      className="flex-1 btn-secondary text-center inline-flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Results</span>
                    </Link>
                  )}
                  
                  <Link
                    to={`/results/${election.id}`}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connection Notice */}
      {!isConnected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Connect Your Wallet</h4>
              <p className="text-sm text-blue-700 mt-1">
                Connect your MetaMask wallet to participate in elections and cast your vote.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Elections;

