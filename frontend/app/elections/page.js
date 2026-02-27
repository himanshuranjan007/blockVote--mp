"use client";

import { useEffect, useState } from "react";
import { useWeb3 } from "@/lib/Web3Context";
import { useToast } from "@/components/Toast";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import styles from "./page.module.css";

export default function Elections() {
    const { votingSystem, voteToken, account, isConnected } = useWeb3();
    const { addToast } = useToast();
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [voteModal, setVoteModal] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [voteAmount, setVoteAmount] = useState("1");
    const [casting, setCasting] = useState(false);

    async function fetchElections() {
        if (!votingSystem) return;
        setLoading(true);
        try {
            const count = await votingSystem.electionCount();
            const list = [];
            for (let i = 1; i <= Number(count); i++) {
                const el = await votingSystem.elections(i);
                const candidateCount = Number(el.candidateCount);
                const candidates = [];
                for (let j = 1; j <= candidateCount; j++) {
                    const c = await votingSystem.candidates(i, j);
                    candidates.push({
                        id: Number(c.id),
                        name: c.name,
                        description: c.description,
                        voteCount: Number(c.voteCount),
                    });
                }
                const totalVotes = candidates.reduce((a, c) => a + c.voteCount, 0);
                list.push({
                    id: Number(el.id),
                    title: el.title,
                    description: el.description,
                    status: Number(el.status),
                    totalVotesCast: Number(el.totalVotesCast),
                    totalTokensUsed: el.totalTokensUsed,
                    candidates,
                    totalVotes,
                });
            }
            setElections(list);
        } catch (err) {
            console.error("Error fetching elections:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchElections();
    }, [votingSystem]);

    async function handleVote() {
        if (!selectedCandidate || !voteModal) return;
        setCasting(true);
        try {
            const amount = ethers.parseEther(voteAmount);
            const allowance = await voteToken.allowance(account, CONTRACT_ADDRESSES.votingSystem);
            if (allowance < amount) {
                addToast("Approving tokens...", "info");
                const approveTx = await voteToken.approve(CONTRACT_ADDRESSES.votingSystem, amount);
                await approveTx.wait();
            }
            addToast("Casting vote...", "info");
            const voteTx = await votingSystem.vote(voteModal.id, selectedCandidate, amount);
            await voteTx.wait();
            addToast("Vote cast successfully!", "success");
            setVoteModal(null);
            setSelectedCandidate(null);
            setVoteAmount("1");
            fetchElections();
        } catch (err) {
            console.error(err);
            addToast(err.reason || "Vote failed", "error");
        } finally {
            setCasting(false);
        }
    }

    const statusLabels = ["Pending", "Active", "Ended"];

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Elections</h1>
                    <p className={styles.subtitle}>Browse and participate in on-chain elections</p>
                </div>
                <button className={styles.btnGhost} onClick={fetchElections}>
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className={styles.empty}>Loading elections from blockchain...</div>
            ) : elections.length === 0 ? (
                <div className={styles.empty}>No elections found on-chain.</div>
            ) : (
                <div className={styles.electionList}>
                    {elections.map((el) => (
                        <div key={el.id} className={styles.electionCard}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <h2 className={styles.electionTitle}>{el.title}</h2>
                                    <p className={styles.electionMeta}>
                                        {el.description}
                                    </p>
                                </div>
                                <span className={`${styles.statusBadge} ${styles[`status${el.status}`]}`}>
                                    {statusLabels[el.status]}
                                </span>
                            </div>

                            <div className={styles.candidatesList}>
                                {el.candidates.map((c) => {
                                    const pct = el.totalVotes > 0 ? Math.round((c.voteCount / el.totalVotes) * 100) : 0;
                                    return (
                                        <div key={c.id} className={styles.candidateRow}>
                                            <span className={styles.candidateName}>{c.name}</span>
                                            <div className={styles.progressTrack}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className={styles.candidateVotes}>{c.voteCount}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={styles.cardFooter}>
                                <div className={styles.footerStats}>
                                    <span>{el.totalVotesCast} vote{el.totalVotesCast !== 1 ? "s" : ""}</span>
                                    <span className={styles.dot}>·</span>
                                    <span>{el.candidates.length} candidates</span>
                                </div>
                                {el.status === 1 && isConnected && (
                                    <button
                                        className={styles.btnPrimary}
                                        onClick={() => setVoteModal(el)}
                                    >
                                        Cast Vote
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Vote Modal */}
            {voteModal && (
                <div className={styles.overlay} onClick={() => setVoteModal(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Cast Vote</h2>
                            <button className={styles.modalClose} onClick={() => setVoteModal(null)}>✕</button>
                        </div>
                        <p className={styles.modalSubtitle}>{voteModal.title}</p>

                        <div className={styles.modalCandidates}>
                            {voteModal.candidates.map((c) => (
                                <button
                                    key={c.id}
                                    className={`${styles.candidateOption} ${selectedCandidate === c.id ? styles.selected : ""}`}
                                    onClick={() => setSelectedCandidate(c.id)}
                                >
                                    <span className={styles.optionName}>{c.name}</span>
                                    <span className={styles.optionVotes}>{c.voteCount} votes</span>
                                </button>
                            ))}
                        </div>

                        <div className={styles.amountField}>
                            <label>Tokens to stake</label>
                            <input
                                type="number"
                                min="1"
                                value={voteAmount}
                                onChange={(e) => setVoteAmount(e.target.value)}
                                className={styles.inputField}
                            />
                            <span className={styles.inputHint}>1 VOTE = 1 vote weight</span>
                        </div>

                        <button
                            className={styles.btnSubmit}
                            disabled={!selectedCandidate || casting}
                            onClick={handleVote}
                        >
                            {casting ? "Processing..." : "Confirm Vote"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
