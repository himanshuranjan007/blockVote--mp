import "./globals.css";
import { Web3Provider } from "@/lib/Web3Context";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "BlockVote — Decentralized Voting with Token Governance",
  description:
    "A decentralized voting platform powered by blockchain technology and ERC-20 governance tokens. Transparent, tamper-proof elections on-chain.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          <ToastProvider>
            <Navbar />
            <main className="mainContent">{children}</main>
          </ToastProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
