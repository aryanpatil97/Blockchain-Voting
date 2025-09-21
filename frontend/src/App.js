import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './contexts/Web3Context';
import { VotingProvider } from './contexts/VotingContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Elections from './pages/Elections';
import Vote from './pages/Vote';
import Results from './pages/Results';
import Admin from './pages/Admin';
import About from './pages/About';

function App() {
  return (
    <Web3Provider>
      <VotingProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/elections" element={<Elections />} />
                <Route path="/vote/:electionId" element={<Vote />} />
                <Route path="/results/:electionId" element={<Results />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </VotingProvider>
    </Web3Provider>
  );
}

export default App;

