import React from 'react';
import { 
  Shield, 
  Vote, 
  Users, 
  BarChart3, 
  Lock, 
  Eye,
  CheckCircle,
  Globe,
  Zap
} from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Every vote is recorded on the blockchain, making it impossible to tamper with or alter results.'
    },
    {
      icon: Vote,
      title: 'Decentralized Voting',
      description: 'No central authority controls the voting process. The system is truly democratic and transparent.'
    },
    {
      icon: Users,
      title: 'Voter Authentication',
      description: 'Only authorized voters can participate, ensuring the integrity of the voting process.'
    },
    {
      icon: BarChart3,
      title: 'Real-time Results',
      description: 'View live election results as votes are cast, with complete transparency and verifiability.'
    },
    {
      icon: Lock,
      title: 'Privacy Protection',
      description: 'Your vote is anonymous while still being verifiable on the blockchain.'
    },
    {
      icon: Eye,
      title: 'Public Verification',
      description: 'Anyone can verify the results by examining the blockchain transactions.'
    }
  ];

  const benefits = [
    {
      icon: CheckCircle,
      title: 'Tamper-Proof',
      description: 'Once recorded on the blockchain, votes cannot be modified or deleted.'
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Vote from anywhere in the world with just an internet connection.'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Results are available immediately after voting closes.'
    }
  ];

  const steps = [
    {
      step: 1,
      title: 'Connect Wallet',
      description: 'Connect your MetaMask wallet to the platform'
    },
    {
      step: 2,
      title: 'Get Authorized',
      description: 'Wait for election administrators to authorize your address'
    },
    {
      step: 3,
      title: 'Cast Your Vote',
      description: 'Select your preferred candidate and submit your vote'
    },
    {
      step: 4,
      title: 'Verify Results',
      description: 'View and verify the election results on the blockchain'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          About <span className="text-gradient">Blockchain Voting</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're revolutionizing democracy through blockchain technology, creating a secure, 
          transparent, and accessible voting platform that ensures every vote counts and 
          every result is verifiable.
        </p>
      </section>

      {/* Mission Section */}
      <section className="card">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            To create a voting system that is completely transparent, secure, and accessible to everyone. 
            We believe that democracy should be protected by the most advanced technology available, 
            ensuring that elections are fair, verifiable, and free from manipulation.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Key Features</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose Blockchain Voting?</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                {step.step}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Section */}
      <section className="card">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Technology Stack</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Contracts</h3>
            <p className="text-gray-600 mb-4">
              Built on Ethereum using Solidity, our smart contracts handle all voting logic, 
              ensuring that votes are recorded immutably and results are calculated transparently.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                OpenZeppelin security standards
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                Reentrancy protection
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                Pausable functionality
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Frontend</h3>
            <p className="text-gray-600 mb-4">
              Modern React application with Tailwind CSS, providing an intuitive and responsive 
              user experience across all devices.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                React 18 with hooks
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                Web3.js integration
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                MetaMask wallet support
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-red-50 border border-red-200 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Security & Transparency</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Blockchain Security</h3>
            <p className="text-gray-600 mb-4">
              Every vote is recorded as a transaction on the blockchain, making it impossible 
              to alter or delete votes after they've been cast.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <Shield className="w-4 h-4 text-red-600 mr-2" />
                Immutable vote records
              </li>
              <li className="flex items-center">
                <Shield className="w-4 h-4 text-red-600 mr-2" />
                Cryptographic verification
              </li>
              <li className="flex items-center">
                <Shield className="w-4 h-4 text-red-600 mr-2" />
                Decentralized consensus
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Public Verification</h3>
            <p className="text-gray-600 mb-4">
              Anyone can verify the election results by examining the blockchain transactions, 
              ensuring complete transparency and trust.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <Eye className="w-4 h-4 text-red-600 mr-2" />
                Public transaction history
              </li>
              <li className="flex items-center">
                <Eye className="w-4 h-4 text-red-600 mr-2" />
                Open source code
              </li>
              <li className="flex items-center">
                <Eye className="w-4 h-4 text-red-600 mr-2" />
                Auditable results
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-12 bg-primary-600 rounded-xl text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Experience the Future of Voting?</h2>
        <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
          Join us in revolutionizing democracy with secure, transparent, and accessible blockchain voting.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/elections" className="bg-white text-primary-600 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-colors duration-200">
            View Elections
          </a>
          <a href="/admin" className="border border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-6 rounded-lg transition-colors duration-200">
            Admin Panel
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;

