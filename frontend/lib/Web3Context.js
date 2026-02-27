"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import {
    CONTRACT_ADDRESSES,
    CHAIN_ID,
    VoteTokenABI,
    VotingSystemABI,
} from "./contracts";

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [voteToken, setVoteToken] = useState(null);
    const [votingSystem, setVotingSystem] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);

    const initContracts = useCallback(async (providerOrSigner) => {
        const token = new ethers.Contract(
            CONTRACT_ADDRESSES.voteToken,
            VoteTokenABI,
            providerOrSigner
        );
        const voting = new ethers.Contract(
            CONTRACT_ADDRESSES.votingSystem,
            VotingSystemABI,
            providerOrSigner
        );
        setVoteToken(token);
        setVotingSystem(voting);
        return { token, voting };
    }, []);

    // Initialize read-only provider on mount (no wallet needed)
    useEffect(() => {
        async function initReadOnly() {
            try {
                const readProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
                await readProvider.getNetwork(); // verify connection
                setProvider(readProvider);
                await initContracts(readProvider);
            } catch (err) {
                console.log("Read-only provider not available:", err.message);
            }
        }
        initReadOnly();
    }, [initContracts]);

    const connectWallet = useCallback(async () => {
        if (typeof window === "undefined" || !window.ethereum) {
            setError("MetaMask is not installed. Please install MetaMask to continue.");
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await browserProvider.send("eth_requestAccounts", []);
            const network = await browserProvider.getNetwork();
            const signerInstance = await browserProvider.getSigner();

            setProvider(browserProvider);
            setSigner(signerInstance);
            setAccount(accounts[0]);
            setChainId(Number(network.chainId));

            await initContracts(signerInstance);
        } catch (err) {
            console.error("Connection error:", err);
            setError(err.message || "Failed to connect wallet");
        } finally {
            setIsConnecting(false);
        }
    }, [initContracts]);

    const disconnect = useCallback(() => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setVoteToken(null);
        setVotingSystem(null);
        setChainId(null);
    }, []);

    // Listen for account/chain changes
    useEffect(() => {
        if (typeof window === "undefined" || !window.ethereum) return;

        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                disconnect();
            } else {
                setAccount(accounts[0]);
                connectWallet();
            }
        };

        const handleChainChanged = () => {
            window.location.reload();
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);

        return () => {
            window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
            window.ethereum.removeListener("chainChanged", handleChainChanged);
        };
    }, [connectWallet, disconnect]);

    const value = {
        account,
        provider,
        signer,
        voteToken,
        votingSystem,
        chainId,
        isConnecting,
        error,
        connectWallet,
        disconnect,
        isConnected: !!account,
        isCorrectNetwork: chainId === CHAIN_ID,
    };

    return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error("useWeb3 must be used within a Web3Provider");
    }
    return context;
}
