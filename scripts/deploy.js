// Deployment script for Blockchain Voting contracts
const VotingContract = artifacts.require("VotingContract");

module.exports = async function(deployer, network, accounts) {
  console.log(`Deploying to network: ${network}`);
  console.log(`Deployer account: ${accounts[0]}`);
  
  try {
    // Deploy VotingContract
    await deployer.deploy(VotingContract);
    const votingInstance = await VotingContract.deployed();
    
    console.log(`VotingContract deployed at: ${votingInstance.address}`);
    
    // Log deployment info
    console.log("\n=== Deployment Summary ===");
    console.log(`Network: ${network}`);
    console.log(`VotingContract: ${votingInstance.address}`);
    console.log(`Gas used: ${votingInstance.constructor.class_defaults.gas}`);
    
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
};