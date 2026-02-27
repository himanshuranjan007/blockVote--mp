"use client";

import { useEffect, useState } from "react";
import { useWeb3 } from "@/lib/Web3Context";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import styles from "./page.module.css";

export default function Tokens() {
    const { voteToken, votingSystem, account, isConnected } = useWeb3();
    const [tokenData, setTokenData] = useState({
        balance: "—",
        supply: "0",
        maxSupply: "1,000,000",
        isRegistered: null,
        tokensPerVote: "1",
        voterCount: 0,
    });

    useEffect(() => {
        async function fetchTokenData() {
            if (!voteToken || !votingSystem) return;
            try {
                const [supply, tpv, voterCount] = await Promise.all([
                    voteToken.totalSupply(),
                    votingSystem.tokensPerVote(),
                    voteToken.getVoterCount(),
                ]);

                let balance = "—";
                let isRegistered = null;
                if (account) {
                    const [bal, reg] = await Promise.all([
                        voteToken.balanceOf(account),
                        voteToken.registeredVoters(account),
                    ]);
                    balance = parseFloat(ethers.formatEther(bal)).toFixed(1);
                    isRegistered = reg;
                }

                setTokenData({
                    balance,
                    supply: parseFloat(ethers.formatEther(supply)).toLocaleString(),
                    maxSupply: "1,000,000",
                    isRegistered,
                    tokensPerVote: ethers.formatEther(tpv),
                    voterCount: Number(voterCount),
                });
            } catch (err) {
                console.error("Error fetching token data:", err);
            }
        }
        fetchTokenData();
    }, [voteToken, votingSystem, account]);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Tokens</h1>
                <p className={styles.subtitle}>VOTE token balance and governance details</p>
            </div>

            <div className={styles.balanceCard}>
                <div className={styles.balanceTop}>
                    <div>
                        <p className={styles.balanceLabel}>VoteToken (VOTE)</p>
                        <p className={styles.balanceHint}>ERC-20 Governance Token</p>
                    </div>
                    <span className={styles.contractAddr}>
                        {CONTRACT_ADDRESSES.voteToken.slice(0, 10)}...{CONTRACT_ADDRESSES.voteToken.slice(-6)}
                    </span>
                </div>
                <div className={styles.balanceValue}>
                    {isConnected ? tokenData.balance : "—"}
                    <span className={styles.balanceSuffix}>VOTE</span>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.cell}>
                    <span className={styles.cellLabel}>Max Supply</span>
                    <span className={styles.cellValue}>{tokenData.maxSupply}</span>
                </div>
                <div className={styles.cell}>
                    <span className={styles.cellLabel}>Current Supply</span>
                    <span className={styles.cellValue}>{tokenData.supply}</span>
                </div>
                <div className={styles.cell}>
                    <span className={styles.cellLabel}>Registered</span>
                    <span className={styles.cellValue}>
                        {tokenData.isRegistered === null ? "—" : tokenData.isRegistered ? "Yes" : "No"}
                    </span>
                </div>
                <div className={styles.cell}>
                    <span className={styles.cellLabel}>Tokens Per Vote</span>
                    <span className={styles.cellValue}>{tokenData.tokensPerVote}</span>
                </div>
            </div>

            <div className={styles.detailsSection}>
                <h2 className={styles.sectionTitle}>Token Details</h2>
                <div className={styles.detailsTable}>
                    {[
                        ["Standard", "ERC-20"],
                        ["Network", "Ethereum (Hardhat Local)"],
                        ["Decimals", "18"],
                        ["Use Case", "Governance / Voting Power"],
                        ["Total Voters", tokenData.voterCount.toString()],
                        ["Voting System", `${CONTRACT_ADDRESSES.votingSystem.slice(0, 10)}...${CONTRACT_ADDRESSES.votingSystem.slice(-6)}`],
                    ].map(([label, value]) => (
                        <div key={label} className={styles.detailRow}>
                            <span className={styles.detailLabel}>{label}</span>
                            <span className={styles.detailValue}>{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
