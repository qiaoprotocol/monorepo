"use client";
import React, { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { WalletButton } from "@rainbow-me/rainbowkit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { abi as QiaoFactoryABI } from "../lib/abis/QiaoFactory.json";

export default function CreateContract() {
  const { address, isConnected, chainId } = useAccount();
  const CONTRACT_ADDRESS =
    chainId == 11155111
      ? "0xf478FF3BcF37be3016C1CeCE3DE6B4114d69edDa"
      : "0xd53a6e3eabecadff73559aa1b7678738a84313ed";
  const [contractName, setContractName] = useState("");
  const [initialGatewayUrl, setInitialGatewayUrl] = useState("");
  const [txHash, setTxHash] = useState("");

  const { writeContract, isPending: isWritePending } = useWriteContract();

  const { isLoading: isWaitingForTx, isSuccess: txSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}` | undefined,
    });

  const handleCreateContract = () => {
    if (contractName && initialGatewayUrl) {
      writeContract(
        {
          address: CONTRACT_ADDRESS,
          abi: QiaoFactoryABI,
          functionName: "createContract",
          args: [contractName, initialGatewayUrl],
        },
        {
          onSuccess: (hash) => setTxHash(hash),
        }
      );
    }
  };

  useEffect(() => {
    if (txSuccess) {
      setContractName("");
      setInitialGatewayUrl("");
    }
  }, [txSuccess]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-8">Create a New Contract</h1>
        <WalletButton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CardHeader>
        <CardTitle>Create a New Contract</CardTitle>
        <CardDescription>
          Enter the details for your new contract
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="Contract Name"
          value={contractName}
          onChange={(e) => setContractName(e.target.value)}
          className="mb-4"
        />
        <Input
          type="text"
          placeholder="Initial Gateway URL"
          value={initialGatewayUrl}
          onChange={(e) => setInitialGatewayUrl(e.target.value)}
          className="mb-4"
        />
        <Button
          onClick={handleCreateContract}
          disabled={
            isWritePending ||
            isWaitingForTx ||
            !contractName ||
            !initialGatewayUrl
          }
        >
          {isWritePending || isWaitingForTx
            ? "Processing..."
            : "Create Contract"}
        </Button>
        {txHash && (
          <p className="mt-4">
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              View Transaction
            </a>
          </p>
        )}
      </CardContent>

      {txSuccess && (
        <Alert className="mt-4">
          <AlertDescription>
            Contract created successfully! Transaction hash: {txHash}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
