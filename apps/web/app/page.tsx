import styles from "./page.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import CCIPReadDemo from "./CCIPReadDemo";
import GetContract from "./GetContract";
import CreateContract from "./WriteContract";
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
        <div className="flex flex-row gap-4">
          <GetContract />
          <CreateContract />
        </div>
        <div className="flex flex-row gap-4">
          <CCIPReadDemo
            contractAddress="0xB084De01b2610F2F4ad8ab731Dbaaf78011422ED"
            ensName="qiao.bridgeprotocol.eth"
            description="This is a demo of a CCIP read gateway for the Qiao protocol, hello world!"
          />
          <CCIPReadDemo
            contractAddress="0x71a4B02779ABa0C7Ad2eC919b4bD1c6DbC082f50"
            ensName="poem.bridgeprotocol.eth"
            description="This is a claude demo of CCIP read to a poem generator, hey Shakespeare!"
          />
        </div>
        <div className="flex flex-row gap-4">
          <CCIPReadDemo
            contractAddress="0xF5572Fbad455015b45E614b08634be4135fCF107"
            ensName="image.bridgeprotocol.eth"
            description="Image generator powered by Stability AI, hi Picasso!"
          />
          <CCIPReadDemo
            contractAddress="0xdb801a6a66cB3F9B2D943f9c90Dda0B8B8825084"
            ensName="localhost.bridgeprotocol.eth"
            description="This is a CCIP read gateway that points to localhost:3000, happy debugging!"
          />
        </div>
      </main>
    </div>
  );
}
