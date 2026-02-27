const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🗳️  BlockVote — Deploying Contracts");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📍 Deployer: ${deployer.address}`);
    console.log(`💰 Balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH`);
    console.log("");

    // Deploy VoteToken
    console.log("📦 Deploying VoteToken...");
    const VoteToken = await hre.ethers.getContractFactory("VoteToken");
    const voteToken = await VoteToken.deploy();
    await voteToken.waitForDeployment();
    const tokenAddress = await voteToken.getAddress();
    console.log(`✅ VoteToken deployed at: ${tokenAddress}`);

    // Deploy VotingSystem
    console.log("📦 Deploying VotingSystem...");
    const VotingSystem = await hre.ethers.getContractFactory("VotingSystem");
    const votingSystem = await VotingSystem.deploy(tokenAddress);
    await votingSystem.waitForDeployment();
    const votingAddress = await votingSystem.getAddress();
    console.log(`✅ VotingSystem deployed at: ${votingAddress}`);

    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 Deployment Complete!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`VoteToken:    ${tokenAddress}`);
    console.log(`VotingSystem: ${votingAddress}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Setup: Register some test voters and create a demo election
    console.log("");
    console.log("🔧 Setting up demo election...");

    const signers = await hre.ethers.getSigners();

    // Register voters (accounts 1-5)
    for (let i = 1; i <= Math.min(5, signers.length - 1); i++) {
        const tx = await voteToken.registerVoter(
            signers[i].address,
            hre.ethers.parseEther("10")
        );
        await tx.wait();
        console.log(`  ✅ Registered voter ${i}: ${signers[i].address} (10 VOTE tokens)`);
    }

    // Create a demo election (starts immediately)
    const now = Math.floor(Date.now() / 1000);
    const createTx = await votingSystem.createElection(
        "Best Blockchain Platform 2026",
        "Vote for the blockchain platform that has contributed the most to Web3 this year.",
        now + 5,
        now + 86400
    );
    await createTx.wait();
    console.log("  ✅ Demo election created: 'Best Blockchain Platform 2026'");

    // Add candidates
    const candidateNames = [
        { name: "Ethereum", desc: "The pioneer of smart contracts and DeFi" },
        { name: "Solana", desc: "High-performance blockchain with sub-second finality" },
        { name: "Polygon", desc: "Leading Ethereum scaling solution" },
        { name: "Avalanche", desc: "Blazingly fast, low-cost, eco-friendly blockchain" },
    ];

    for (const c of candidateNames) {
        const tx = await votingSystem.addCandidate(1, c.name, c.desc);
        await tx.wait();
        console.log(`  ✅ Candidate added: ${c.name}`);
    }

    // Start the election
    const startTx = await votingSystem.startElection(1);
    await startTx.wait();
    console.log("  ✅ Election started!");

    // Approve VotingSystem to spend voter tokens
    for (let i = 1; i <= Math.min(5, signers.length - 1); i++) {
        const approveTx = await voteToken.connect(signers[i]).approve(
            votingAddress,
            hre.ethers.parseEther("10")
        );
        await approveTx.wait();
    }
    console.log("  ✅ All voters approved token spending");

    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🚀 BlockVote is ready! Open the frontend to interact.");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Save deployment info for frontend
    const deploymentInfo = {
        voteToken: tokenAddress,
        votingSystem: votingAddress,
        network: "localhost",
        chainId: 31337,
        deployer: deployer.address,
    };

    const fs = require("fs");
    const path = require("path");

    const frontendDir = path.join(__dirname, "..", "frontend");
    if (!fs.existsSync(frontendDir)) {
        fs.mkdirSync(frontendDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(frontendDir, "deployment.json"),
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("📄 Deployment info saved to frontend/deployment.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
