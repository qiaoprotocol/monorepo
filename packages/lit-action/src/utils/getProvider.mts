import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

type Chain = "maticmum" | "homestead" | "goerli" | "matic";

export const getProvider = (chain: Chain) =>
  new ethers.providers.AlchemyProvider(chain, process.env.ALCHEMY_ID);

export const getChronicalProvider = () =>
  new ethers.providers.JsonRpcProvider(
    "https://chain-rpc.litprotocol.com/http"
  );

export const getYellowStoneProvider = () =>
  new ethers.providers.JsonRpcProvider(
    "https://yellowstone-rpc.litprotocol.com/"
  );
