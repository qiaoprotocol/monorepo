"use client";
import React, { useState } from "react";
import { useAccount } from "wagmi";
import { fromHex, toBytes, toHex } from "viem";
import { WalletButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePublicClient } from "wagmi";

import { abi as QiaoABI } from "../lib/abis/QiaoContract.json";

export default function CCIPReadDemo({
  contractAddress,
  ensName,
  description,
}: {
  contractAddress: string;
  ensName: string;
  description?: string;
}) {
  const [ccipInput, setCcipInput] = useState("");
  const [ccipResult, setCcipResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  if (!publicClient) return null;

  const handleCCIPCall = async () => {
    setIsLoading(true);
    setError(null);
    setCcipResult("");
    publicClient
      .readContract({
        address: contractAddress as `0x${string}`,
        abi: QiaoABI,
        functionName: "callOffchain",
        args: [toHex(ccipInput)],
      })
      .then((result) => {
        console.log(result);
        setIsLoading(false);
        setCcipResult(fromHex(result as `0x${string}`, "string"));
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
        setError("Error calling contract");
      });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {ensName} {contractAddress.slice(0, 4)}...
            {contractAddress.slice(-4)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{description}</CardDescription>
          <Input
            type="text"
            placeholder="CCIP Input"
            value={ccipInput}
            onChange={(e) => setCcipInput(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleCCIPCall} disabled={isLoading}>
            {isLoading ? "Processing..." : "Make CCIP Read Call"}
          </Button>
          {ccipResult && <p className="mt-4">{ccipResult}</p>}
          {error && (
            <Alert className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
