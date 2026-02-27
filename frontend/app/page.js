"use client";

import { useEffect, useState } from "react";
import { useWeb3 } from "@/lib/Web3Context";
import { ethers } from "ethers";
import Link from "next/link";
import styles from "./page.module.css";

export default function Dashboard() {
  const { voteToken, votingSystem, isConnected, account } = useWeb3();
  const [stats, setStats] = useState({
    totalElections: 0,
    totalVoters: 0,
    tokenSupply: "0",
    myBalance: "—",
  });

  useEffect(() => {
    async function fetchStats() {
      if (!voteToken || !votingSystem) return;
      try {
        const [elections, voters, supply] = await Promise.all([
          votingSystem.electionCount(),
          voteToken.getVoterCount(),
          voteToken.totalSupply(),
        ]);

        let balance = "—";
        if (account) {
          const bal = await voteToken.balanceOf(account);
          balance = parseFloat(ethers.formatEther(bal)).toFixed(1);
        }

        setStats({
          totalElections: Number(elections),
          totalVoters: Number(voters),
          tokenSupply: parseFloat(ethers.formatEther(supply)).toLocaleString(),
          myBalance: balance,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    }
    fetchStats();
  }, [voteToken, votingSystem, account]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <p className={styles.heroBadge}>Blockchain Governance</p>
        <h1 className={styles.heroTitle}>Decentralized Voting</h1>
        <p className={styles.heroSubtitle}>
          Transparent, tamper-proof elections powered by Ethereum smart contracts
          and ERC-20 governance tokens.
        </p>
        <div className={styles.heroActions}>
          <Link href="/elections" className={styles.btnPrimary}>
            View Elections →
          </Link>
          <Link href="/tokens" className={styles.btnGhost}>
            Token Balance
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.totalElections}</span>
          <span className={styles.statLabel}>Elections</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.totalVoters}</span>
          <span className={styles.statLabel}>Voters</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.tokenSupply}</span>
          <span className={styles.statLabel}>VOTE Supply</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.myBalance}</span>
          <span className={styles.statLabel}>Your Balance</span>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <div className={styles.stepsGrid}>
          {[
            { num: "1", title: "Register", desc: "Admin registers eligible voters and distributes VOTE tokens via the smart contract." },
            { num: "2", title: "Receive Tokens", desc: "Each registered voter receives ERC-20 tokens. 1 token equals 1 vote weight." },
            { num: "3", title: "Cast Vote", desc: "Stake tokens on your chosen candidate. More tokens means greater voting power." },
            { num: "4", title: "On-Chain Results", desc: "Votes are permanently recorded on the blockchain. Transparent and immutable." },
          ].map((step) => (
            <div key={step.num} className={styles.stepCard}>
              <span className={styles.stepNumber}>{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
