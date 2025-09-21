import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import toast from 'react-hot-toast';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      return false;
    }

    setIsLoading(true);
    try {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);

        // Get network ID
        const networkId = await web3Instance.eth.net.getId();
        setNetworkId(networkId);

        // Check if we're on the correct network
        const expectedNetworkId = parseInt(process.env.REACT_APP_NETWORK_ID || '5777');
        if (networkId !== expectedNetworkId) {
          toast.error(`Please switch to the correct network (Network ID: ${expectedNetworkId})`);
          return false;
        }

        toast.success('Wallet connected successfully!');
        return true;
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.error('Please connect your wallet to continue.');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const disconnectWallet = () => {
    setWeb3(null);
    setAccount(null);
    setNetworkId(null);
    setIsConnected(false);
    toast.success('Wallet disconnected');
  };

  const switchNetwork = async (networkId) => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${networkId.toString(16)}` }],
      });
      return true;
    } catch (error) {
      console.error('Error switching network:', error);
      toast.error('Failed to switch network');
      return false;
    }
  };

  const getBalance = async () => {
    if (!web3 || !account) return '0';
    try {
      const balance = await web3.eth.getBalance(account);
      return web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          toast.info('Account changed');
        }
      };

      const handleChainChanged = (chainId) => {
        const newNetworkId = parseInt(chainId, 16);
        setNetworkId(newNetworkId);
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  // Auto-connect if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          
          if (accounts.length > 0) {
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);
            setAccount(accounts[0]);
            setIsConnected(true);
            
            const networkId = await web3Instance.eth.net.getId();
            setNetworkId(networkId);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const value = {
    web3,
    account,
    networkId,
    isConnected,
    isLoading,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getBalance,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

