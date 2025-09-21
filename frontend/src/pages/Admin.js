import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useVoting } from '../contexts/VotingContext';
import { 
  Settings, 
  Users, 
  Plus, 
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Vote
} from 'lucide-react';
import toast from 'react-hot-toast';

const Admin = () => {
  const { account, isConnected } = useWeb3();
  const { 
    elections, 
    candidates, 
    authorizeVoter, 
    addCandidate, 
    createElection,
    isLoading 
  } = useVoting();

  const [activeTab, setActiveTab] = useState('overview');
  const [newVoterAddress, setNewVoterAddress] = useState('');
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '' });
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: ''
  });

  const isOwner = account && isConnected; // In a real app, you'd check if the account is the contract owner

  const handleAuthorizeVoter = async (e) => {
    e.preventDefault();
    if (!newVoterAddress.trim()) {
      toast.error('Please enter a valid address');
      return;
    }

    const success = await authorizeVoter(newVoterAddress.trim());
    if (success) {
      setNewVoterAddress('');
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!newCandidate.name.trim() || !newCandidate.party.trim()) {
      toast.error('Please fill in all candidate fields');
      return;
    }

    const success = await addCandidate(newCandidate.name.trim(), newCandidate.party.trim());
    if (success) {
      setNewCandidate({ name: '', party: '' });
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    if (!newElection.title.trim() || !newElection.description.trim() || 
        !newElection.startTime || !newElection.endTime) {
      toast.error('Please fill in all election fields');
      return;
    }

    const startTime = Math.floor(new Date(newElection.startTime).getTime() / 1000);
    const endTime = Math.floor(new Date(newElection.endTime).getTime() / 1000);

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    if (startTime <= Math.floor(Date.now() / 1000)) {
      toast.error('Start time must be in the future');
      return;
    }

    const success = await createElection(
      newElection.title.trim(),
      newElection.description.trim(),
      startTime,
      endTime
    );

    if (success) {
      setNewElection({
        title: '',
        description: '',
        startTime: '',
        endTime: ''
      });
    }
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

  const getElectionStatus = (election) => {
    const now = new Date();
    const startTime = new Date(election.startTime * 1000);
    const endTime = new Date(election.endTime * 1000);

    if (!election.active) return { status: 'inactive', color: 'gray' };
    if (now < startTime) return { status: 'upcoming', color: 'blue' };
    if (now > endTime) return { status: 'ended', color: 'red' };
    return { status: 'active', color: 'green' };
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
        <p className="text-gray-600">Please connect your wallet to access the admin panel.</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage elections, candidates, and voters</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: Settings },
            { key: 'voters', label: 'Voters', icon: Users },
            { key: 'candidates', label: 'Candidates', icon: Vote },
            { key: 'elections', label: 'Elections', icon: Calendar }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{elections.length}</div>
              <div className="text-sm text-gray-600">Total Elections</div>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Vote className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{candidates.length}</div>
              <div className="text-sm text-gray-600">Total Candidates</div>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {elections.reduce((sum, election) => sum + parseInt(election.totalVotes || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Votes</div>
            </div>
          </div>

          {/* Recent Elections */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Elections</h3>
            {elections.length === 0 ? (
              <p className="text-gray-600">No elections created yet.</p>
            ) : (
              <div className="space-y-3">
                {elections.slice(0, 5).map((election) => {
                  const status = getElectionStatus(election);
                  return (
                    <div key={election.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{election.title}</h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(election.startTime)} - {formatDate(election.endTime)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        status.color === 'green' ? 'bg-green-100 text-green-800' :
                        status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                        status.color === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Voters Tab */}
      {activeTab === 'voters' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Authorize Voters</h3>
          <form onSubmit={handleAuthorizeVoter} className="space-y-4">
            <div>
              <label className="label">Voter Address</label>
              <input
                type="text"
                value={newVoterAddress}
                onChange={(e) => setNewVoterAddress(e.target.value)}
                placeholder="0x..."
                className="input-field"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Authorize Voter</span>
            </button>
          </form>
        </div>
      )}

      {/* Candidates Tab */}
      {activeTab === 'candidates' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Add New Candidate</h3>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Candidate Name</label>
                  <input
                    type="text"
                    value={newCandidate.name}
                    onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                    placeholder="John Doe"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Political Party</label>
                  <input
                    type="text"
                    value={newCandidate.party}
                    onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
                    placeholder="Independent"
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Candidate</span>
              </button>
            </form>
          </div>

          {/* Existing Candidates */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Candidates</h3>
            {candidates.length === 0 ? (
              <p className="text-gray-600">No candidates added yet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">{candidate.name}</h4>
                    <p className="text-sm text-gray-600">{candidate.party}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {candidate.voteCount} votes
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Elections Tab */}
      {activeTab === 'elections' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Create New Election</h3>
            <form onSubmit={handleCreateElection} className="space-y-4">
              <div>
                <label className="label">Election Title</label>
                <input
                  type="text"
                  value={newElection.title}
                  onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                  placeholder="Presidential Election 2024"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={newElection.description}
                  onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                  placeholder="Description of the election..."
                  className="input-field h-24 resize-none"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Time</label>
                  <input
                    type="datetime-local"
                    value={newElection.startTime}
                    onChange={(e) => setNewElection({ ...newElection, startTime: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">End Time</label>
                  <input
                    type="datetime-local"
                    value={newElection.endTime}
                    onChange={(e) => setNewElection({ ...newElection, endTime: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Election</span>
              </button>
            </form>
          </div>

          {/* Existing Elections */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Elections</h3>
            {elections.length === 0 ? (
              <p className="text-gray-600">No elections created yet.</p>
            ) : (
              <div className="space-y-4">
                {elections.map((election) => {
                  const status = getElectionStatus(election);
                  return (
                    <div key={election.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{election.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          status.color === 'green' ? 'bg-green-100 text-green-800' :
                          status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                          status.color === 'red' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {status.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{election.description}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(election.startTime)} - {formatDate(election.endTime)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

