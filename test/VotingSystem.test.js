const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BlockVote — Token-Based Voting System", function () {
    let voteToken, votingSystem;
    let owner, voter1, voter2, voter3, nonVoter;

    beforeEach(async function () {
        [owner, voter1, voter2, voter3, nonVoter] = await ethers.getSigners();

        // Deploy VoteToken
        const VoteToken = await ethers.getContractFactory("VoteToken");
        voteToken = await VoteToken.deploy();
        await voteToken.waitForDeployment();

        // Deploy VotingSystem
        const VotingSystem = await ethers.getContractFactory("VotingSystem");
        votingSystem = await VotingSystem.deploy(await voteToken.getAddress());
        await votingSystem.waitForDeployment();

        // Register voters
        await voteToken.registerVoter(voter1.address, ethers.parseEther("10"));
        await voteToken.registerVoter(voter2.address, ethers.parseEther("10"));
        await voteToken.registerVoter(voter3.address, ethers.parseEther("5"));
    });

    describe("VoteToken", function () {
        it("Should deploy with correct name and symbol", async function () {
            expect(await voteToken.name()).to.equal("VoteToken");
            expect(await voteToken.symbol()).to.equal("VOTE");
        });

        it("Should mint initial supply to owner", async function () {
            const ownerBalance = await voteToken.balanceOf(owner.address);
            expect(ownerBalance).to.equal(ethers.parseEther("100000"));
        });

        it("Should register voters with correct token amounts", async function () {
            expect(await voteToken.isRegisteredVoter(voter1.address)).to.be.true;
            expect(await voteToken.balanceOf(voter1.address)).to.equal(ethers.parseEther("10"));
            expect(await voteToken.getVoterCount()).to.equal(3);
        });

        it("Should prevent double registration", async function () {
            await expect(
                voteToken.registerVoter(voter1.address, ethers.parseEther("10"))
            ).to.be.revertedWith("Voter already registered");
        });

        it("Should allow token burning", async function () {
            await voteToken.connect(voter1).burn(ethers.parseEther("5"));
            expect(await voteToken.balanceOf(voter1.address)).to.equal(ethers.parseEther("5"));
        });

        it("Should batch register voters", async function () {
            const newVoters = [nonVoter.address];
            await voteToken.batchRegisterVoters(newVoters, ethers.parseEther("3"));
            expect(await voteToken.isRegisteredVoter(nonVoter.address)).to.be.true;
            expect(await voteToken.balanceOf(nonVoter.address)).to.equal(ethers.parseEther("3"));
        });
    });

    describe("VotingSystem — Election Management", function () {
        let electionId;

        beforeEach(async function () {
            const now = Math.floor(Date.now() / 1000);
            const tx = await votingSystem.createElection(
                "Test Election",
                "A test election",
                now + 10,
                now + 86400
            );
            await tx.wait();
            electionId = 1;

            await votingSystem.addCandidate(electionId, "Alice", "Candidate Alice");
            await votingSystem.addCandidate(electionId, "Bob", "Candidate Bob");
        });

        it("Should create an election", async function () {
            const election = await votingSystem.getElection(electionId);
            expect(election.title).to.equal("Test Election");
            expect(election.candidateCount).to.equal(2);
        });

        it("Should add candidates", async function () {
            const candidate = await votingSystem.getCandidate(electionId, 1);
            expect(candidate.name).to.equal("Alice");
        });

        it("Should start an election", async function () {
            await votingSystem.startElection(electionId);
            const election = await votingSystem.getElection(electionId);
            expect(election.status).to.equal(1); // Active
        });

        it("Should require at least 2 candidates to start", async function () {
            const now = Math.floor(Date.now() / 1000);
            await votingSystem.createElection("Solo Election", "Only 1 candidate", now + 10, now + 86400);
            await votingSystem.addCandidate(2, "Solo", "Only candidate");
            await expect(votingSystem.startElection(2)).to.be.revertedWith("Need at least 2 candidates");
        });
    });

    describe("VotingSystem — Token-Based Voting", function () {
        let electionId;

        beforeEach(async function () {
            const now = Math.floor(Date.now() / 1000);
            await votingSystem.createElection("Token Vote Test", "Testing token voting", now + 10, now + 86400);
            electionId = 1;
            await votingSystem.addCandidate(electionId, "Alice", "Candidate Alice");
            await votingSystem.addCandidate(electionId, "Bob", "Candidate Bob");
            await votingSystem.startElection(electionId);

            // Approve spending
            const votingAddr = await votingSystem.getAddress();
            await voteToken.connect(voter1).approve(votingAddr, ethers.parseEther("10"));
            await voteToken.connect(voter2).approve(votingAddr, ethers.parseEther("10"));
            await voteToken.connect(voter3).approve(votingAddr, ethers.parseEther("5"));
        });

        it("Should allow registered voters to cast votes", async function () {
            await votingSystem.connect(voter1).castVote(electionId, 1, ethers.parseEther("5"));
            expect(await votingSystem.hasVoterVoted(electionId, voter1.address)).to.be.true;
        });

        it("Should correctly weight votes by token amount", async function () {
            await votingSystem.connect(voter1).castVote(electionId, 1, ethers.parseEther("5")); // 5 votes for Alice
            await votingSystem.connect(voter2).castVote(electionId, 2, ethers.parseEther("3")); // 3 votes for Bob

            const alice = await votingSystem.getCandidate(electionId, 1);
            const bob = await votingSystem.getCandidate(electionId, 2);
            expect(alice.voteCount).to.equal(5);
            expect(bob.voteCount).to.equal(3);
        });

        it("Should prevent double voting", async function () {
            await votingSystem.connect(voter1).castVote(electionId, 1, ethers.parseEther("5"));
            await expect(
                votingSystem.connect(voter1).castVote(electionId, 2, ethers.parseEther("5"))
            ).to.be.revertedWith("Already voted in this election");
        });

        it("Should prevent non-registered voters from voting", async function () {
            const votingAddr = await votingSystem.getAddress();
            await voteToken.connect(owner).approve(votingAddr, ethers.parseEther("10"));
            await expect(
                votingSystem.connect(nonVoter).castVote(electionId, 1, ethers.parseEther("1"))
            ).to.be.reverted;
        });

        it("Should determine the winner correctly", async function () {
            await votingSystem.connect(voter1).castVote(electionId, 1, ethers.parseEther("10")); // 10 votes Alice
            await votingSystem.connect(voter2).castVote(electionId, 2, ethers.parseEther("3"));  // 3 votes Bob

            await votingSystem.endElection(electionId);

            const [winnerId, winnerName, winnerVotes] = await votingSystem.getWinner(electionId);
            expect(winnerName).to.equal("Alice");
            expect(winnerVotes).to.equal(10);
        });

        it("Should lock tokens when voting", async function () {
            const balanceBefore = await voteToken.balanceOf(voter1.address);
            await votingSystem.connect(voter1).castVote(electionId, 1, ethers.parseEther("5"));
            const balanceAfter = await voteToken.balanceOf(voter1.address);
            expect(balanceBefore - balanceAfter).to.equal(ethers.parseEther("5"));
        });
    });
});
