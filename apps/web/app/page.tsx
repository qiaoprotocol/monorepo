import styles from "./page.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import CCIPReadDemo from "./CCIPReadDemo";
import GetContract from "./GetContract";
export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ConnectButton />
        <h1 className="text-3xl font-bold mb-8 text-center">桥 Protocol 🌉</h1>
        <h4 className="text-center text-gray-500 mb-8">
          an innovative layer that offloads computation to off-chain resources,
          enables cross-chain delegations, and offers a universal resolver for
          smart contracts to ensure seamless interoperability.
        </h4>
        <GetContract />
        <CCIPReadDemo
          contractAddress="0xB084De01b2610F2F4ad8ab731Dbaaf78011422ED"
          ensName="qiao.bridgeprotocol.eth"
          description="This is a demo of a CCIP read gateway for the Qiao protocol, hello world!"
        />
        <CCIPReadDemo
          contractAddress="0xdb801a6a66cB3F9B2D943f9c90Dda0B8B8825084"
          ensName="localhost.bridgeprotocol.eth"
          description="This is a CCIP read gateway that points to localhost:3000, happy debugging!"
        />
      </main>
    </div>
  );
}
