"use client";
import React, { useState } from "react";
import { fromHex, toBytes, toHex } from "viem";
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
import { useAccount, usePublicClient } from "wagmi";

import { abi as QiaoFactoryABI } from "../lib/abis/QiaoFactory.json";

export default function GetContract() {
  const { chainId } = useAccount();
  const [contractInput, setcontractInput] = useState("");
  const [contractResult, setcontractResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  if (!publicClient) return null;

  const handlecontractCall = async () => {
    setIsLoading(true);
    setError(null);
    setcontractResult("");
    publicClient
      .readContract({
        address:
          chainId == 11155111
            ? "0xf478FF3BcF37be3016C1CeCE3DE6B4114d69edDa"
            : "0xd53a6e3eabecadff73559aa1b7678738a84313ed",
        abi: QiaoFactoryABI,
        functionName: "getContract",
        args: [contractInput],
      })
      .then((result) => {
        console.log(result);
        setIsLoading(false);
        setcontractResult(String(result));
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
        setError("Error calling contract");
      });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CardHeader>
        <CardTitle>Search For a Contract</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>
          Use contract factory to search for a contract
        </CardDescription>
        <Input
          type="text"
          placeholder="contract Input"
          value={contractInput}
          onChange={(e) => setcontractInput(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handlecontractCall} disabled={isLoading}>
          {isLoading ? "Processing..." : "Make contract Read Call"}
        </Button>
        {contractResult && (
          <p className="mt-4">contract Result: {contractResult}</p>
        )}
        {error && (
          <Alert className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </div>
  );
}
