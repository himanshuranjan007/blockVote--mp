"use client";

import { useState } from "react";
import { useWeb3 } from "@/lib/Web3Context";
import { useToast } from "@/components/Toast";
import { ethers } from "ethers";
import styles from "./page.module.css";

export default function Admin() {
    const { votingSystem, voteToken, isConnected } = useWeb3();
    const { addToast } = useToast();

    const [voterAddr, setVoterAddr] = useState("");
    const [voterTokens, setVoterTokens] = useState("10");
    const [elTitle, setElTitle] = useState("");
    const [elDesc, setElDesc] = useState("");
    const [elStart, setElStart] = useState("");
    const [elEnd, setElEnd] = useState("");
    const [candElId, setCandElId] = useState("");
    const [candName, setCandName] = useState("");
    const [candDesc, setCandDesc] = useState("");
    const [startElId, setStartElId] = useState("");
    const [endElId, setEndElId] = useState("");

    async function registerVoter() {
        if (!voteToken || !voterAddr) return;
        try {
            const tx = await voteToken.registerVoter(
                voterAddr,
                ethers.parseEther(voterTokens || "10")
            );
            await tx.wait();
            addToast("Voter registered successfully", "success");
            setVoterAddr("");
        } catch (err) {
            addToast(err.reason || "Registration failed", "error");
        }
    }

    async function createElection() {
        if (!votingSystem || !elTitle) return;
        try {
            const start = Math.floor(new Date(elStart).getTime() / 1000);
            const end = Math.floor(new Date(elEnd).getTime() / 1000);
            const tx = await votingSystem.createElection(elTitle, elDesc, start, end);
            await tx.wait();
            addToast("Election created successfully", "success");
            setElTitle("");
            setElDesc("");
        } catch (err) {
            addToast(err.reason || "Creation failed", "error");
        }
    }

    async function addCandidate() {
        if (!votingSystem || !candElId || !candName) return;
        try {
            const tx = await votingSystem.addCandidate(Number(candElId), candName, candDesc);
            await tx.wait();
            addToast("Candidate added", "success");
            setCandName("");
            setCandDesc("");
        } catch (err) {
            addToast(err.reason || "Failed to add candidate", "error");
        }
    }

    async function startElection() {
        if (!votingSystem || !startElId) return;
        try {
            const tx = await votingSystem.startElection(Number(startElId));
            await tx.wait();
            addToast("Election started", "success");
        } catch (err) {
            addToast(err.reason || "Failed to start election", "error");
        }
    }

    async function endElection() {
        if (!votingSystem || !endElId) return;
        try {
            const tx = await votingSystem.endElection(Number(endElId));
            await tx.wait();
            addToast("Election ended", "success");
        } catch (err) {
            addToast(err.reason || "Failed to end election", "error");
        }
    }

    if (!isConnected) {
        return (
            <div className={styles.page}>
                <div className={styles.emptyState}>
                    <p className={styles.emptyTitle}>Admin Panel</p>
                    <p className={styles.emptyText}>Connect your wallet to access admin controls.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Admin</h1>
                <p className={styles.subtitle}>Manage elections, voters, and candidates</p>
            </div>

            <div className={styles.grid}>
                {/* Register Voter */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Register Voter</h2>
                    <p className={styles.cardDesc}>Add a voter and grant VOTE tokens</p>
                    <div className={styles.fields}>
                        <input
                            placeholder="Voter address (0x...)"
                            value={voterAddr}
                            onChange={(e) => setVoterAddr(e.target.value)}
                            className={styles.input}
                        />
                        <input
                            type="number"
                            placeholder="Token amount"
                            value={voterTokens}
                            onChange={(e) => setVoterTokens(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <button className={styles.btnPrimary} onClick={registerVoter}>
                        Register
                    </button>
                </div>

                {/* Create Election */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Create Election</h2>
                    <p className={styles.cardDesc}>Set up a new on-chain election</p>
                    <div className={styles.fields}>
                        <input
                            placeholder="Election title"
                            value={elTitle}
                            onChange={(e) => setElTitle(e.target.value)}
                            className={styles.input}
                        />
                        <input
                            placeholder="Description"
                            value={elDesc}
                            onChange={(e) => setElDesc(e.target.value)}
                            className={styles.input}
                        />
                        <div className={styles.fieldRow}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Start</label>
                                <input
                                    type="datetime-local"
                                    value={elStart}
                                    onChange={(e) => setElStart(e.target.value)}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>End</label>
                                <input
                                    type="datetime-local"
                                    value={elEnd}
                                    onChange={(e) => setElEnd(e.target.value)}
                                    className={styles.input}
                                />
                            </div>
                        </div>
                    </div>
                    <button className={styles.btnPrimary} onClick={createElection}>
                        Create
                    </button>
                </div>

                {/* Add Candidate */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Add Candidate</h2>
                    <p className={styles.cardDesc}>Add a candidate to an existing election</p>
                    <div className={styles.fields}>
                        <input
                            type="number"
                            placeholder="Election ID"
                            value={candElId}
                            onChange={(e) => setCandElId(e.target.value)}
                            className={styles.input}
                        />
                        <input
                            placeholder="Candidate name"
                            value={candName}
                            onChange={(e) => setCandName(e.target.value)}
                            className={styles.input}
                        />
                        <input
                            placeholder="Description"
                            value={candDesc}
                            onChange={(e) => setCandDesc(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <button className={styles.btnPrimary} onClick={addCandidate}>
                        Add Candidate
                    </button>
                </div>

                {/* Election Controls */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Election Controls</h2>
                    <p className={styles.cardDesc}>Start or end an election by ID</p>
                    <div className={styles.fields}>
                        <div className={styles.controlRow}>
                            <input
                                type="number"
                                placeholder="Election ID"
                                value={startElId}
                                onChange={(e) => setStartElId(e.target.value)}
                                className={styles.input}
                            />
                            <button className={styles.btnPrimary} onClick={startElection}>
                                Start
                            </button>
                        </div>
                        <div className={styles.controlRow}>
                            <input
                                type="number"
                                placeholder="Election ID"
                                value={endElId}
                                onChange={(e) => setEndElId(e.target.value)}
                                className={styles.input}
                            />
                            <button className={styles.btnDanger} onClick={endElection}>
                                End
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
