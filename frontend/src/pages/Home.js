import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useVoting } from '../contexts/VotingContext';
import { 
  Shield, 
  Vote, 
  Users, 
  BarChart3, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Lock
} from 'lucide-react';

const Home = () => {
  const { isConnected, account } = useWeb3();
  const { elections, candidates, voterInfo } = useVoting();

  const activeElections = elections.filter(election => 
    election.active && 
    new Date(election.startTime * 1000) <= new Date() && 
    new Date(election.endTime * 1000) >= new Date()
  );

  const upcomingElections = elections.filter(election => 
    election.active && 
    new Date(election.startTime * 1000) > new Date()
  );

  const features = [
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'Built on blockchain technology ensuring tamper-proof and transparent voting process.'
    },
    {
      icon: Vote,
      title: 'Decentralized',
      description: 'No central authority controls the voting process, ensuring true democracy.'
    },
    {
      icon: Users,
      title: 'Accessible',
      description: 'Easy-to-use interface that works across all devices and browsers.'
    },
    {
      icon: BarChart3,
      title: 'Verifiable Results',
      description: 'All votes and results are publicly verifiable on the blockchain.'
    }
  ];

  const stats = [
    { label: 'Total Elections', value: elections.length },
    { label: 'Active Elections', value: activeElections.length },
    { label: 'Total Candidates', value: candidates.length },
    { label: 'Total Votes Cast', value: elections.reduce((sum, election) => sum + parseInt(election.totalVotes || 0), 0) }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{' '}
            <span className="text-gradient">Blockchain Voting</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience the future of democracy with our secure, transparent, and decentralized voting platform. 
            Your vote matters, and now it's protected by blockchain technology.
          </p>
          
          {!isConnected ? (
            <div className="space-y-4">
              <p className="text-gray-500">Connect your wallet to get started</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                <Lock className="w-4 h-4" />
                <span>Secure • Transparent • Decentralized</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Wallet Connected: {account?.slice(0, 6)}...{account?.slice(-4)}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/elections" className="btn-primary inline-flex items-center space-x-2">
                  <Vote className="w-5 h-5" />
                  <span>View Elections</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {voterInfo?.authorized && (
                  <Link to="/vote/1" className="btn-secondary inline-flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Cast Your Vote</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Platform Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Active Elections */}
      {activeElections.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Active Elections</h2>
            <Link to="/elections" className="text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeElections.slice(0, 3).map((election) => (
              <div key={election.id} className="card hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{election.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                    Active
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{election.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Ends: {new Date(election.endTime * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link 
                  to={`/vote/${election.id}`}
                  className="btn-primary w-full text-center inline-block"
                >
                  Vote Now
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Elections */}
      {upcomingElections.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Elections</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingElections.slice(0, 3).map((election) => (
              <div key={election.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{election.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Upcoming
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{election.description}</p>
                <div className="text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Starts: {new Date(election.startTime * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Choose Blockchain Voting?</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-12 bg-primary-600 rounded-xl text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Vote?</h2>
        <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
          Join thousands of voters who trust our secure, transparent, and decentralized voting platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/elections" className="bg-white text-primary-600 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-colors duration-200">
            View Elections
          </Link>
          <Link to="/about" className="border border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-6 rounded-lg transition-colors duration-200">
            Learn More
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

