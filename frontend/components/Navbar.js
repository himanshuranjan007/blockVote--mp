"use client";

import { useWeb3 } from "@/lib/Web3Context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
    const { account, isConnecting, connectWallet, disconnect, isConnected, chainId } = useWeb3();
    const pathname = usePathname();

    const navLinks = [
        { href: "/", label: "Dashboard" },
        { href: "/elections", label: "Elections" },
        { href: "/tokens", label: "Tokens" },
        { href: "/admin", label: "Admin" },
    ];

    const shortAddress = account
        ? `${account.slice(0, 6)}...${account.slice(-4)}`
        : "";

    return (
        <nav className={styles.navbar}>
            <Link href="/" className={styles.brand}>
                <span className={styles.brandText}>BlockVote</span>
            </Link>

            <div className={styles.navLinks}>
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`${styles.navLink} ${pathname === link.href ? styles.active : ""}`}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>

            <div className={styles.navWallet}>
                <div className={styles.networkBadge}>
                    <span className={`${styles.networkDot} ${isConnected ? styles.connected : ""}`} />
                    <span>{isConnected ? (chainId === 31337 ? "Hardhat" : `Chain ${chainId}`) : "Offline"}</span>
                </div>
                {isConnected ? (
                    <button className={styles.btnWallet} onClick={disconnect}>
                        <span className={styles.walletAddress}>{shortAddress}</span>
                        <span className={styles.disconnectLabel}>Disconnect</span>
                    </button>
                ) : (
                    <button className={styles.btnConnect} onClick={connectWallet} disabled={isConnecting}>
                        {isConnecting ? "Connecting..." : "Connect"}
                    </button>
                )}
            </div>
        </nav>
    );
}
