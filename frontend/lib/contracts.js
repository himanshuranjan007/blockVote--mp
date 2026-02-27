import VoteTokenABI from "./VoteTokenABI.json";
import VotingSystemABI from "./VotingSystemABI.json";

// Default contract addresses — updated after deployment
// Run `npx hardhat run scripts/deploy.js --network localhost` to get addresses
export const CONTRACT_ADDRESSES = {
    voteToken: process.env.NEXT_PUBLIC_VOTE_TOKEN_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    votingSystem: process.env.NEXT_PUBLIC_VOTING_SYSTEM_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
};

export const CHAIN_ID = 31337; // Hardhat local
export const NETWORK_NAME = "Hardhat Local";

export { VoteTokenABI, VotingSystemABI };
