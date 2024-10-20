import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  createPublicClient,
  http,
  decodeAbiParameters,
  parseAbiParameters,
  keccak256,
  isAddress,
  hexToString,
  stringToHex,
  encodeAbiParameters,
  isHex,
  toFunctionSelector,
  encodePacked,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";
import { serve } from "@hono/node-server";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("PRIVATE_KEY must be set in .env file");
}

const account = privateKeyToAccount(`0x${privateKey}` as `0x${string}`);

interface Handler {
  type: any;
  func: (args: string, call: { to: string; data: string }) => Promise<string>;
}

class CCIPReadGateway {
  private app: Hono;
  private handlers: { [selector: string]: Handler };

  constructor() {
    this.app = new Hono();
    this.handlers = {};
    this.setupRoutes();
  }

  private setupRoutes() {
    this.app.use("*", cors());
    this.app.get("/:sender/:callData", this.handleRequest.bind(this));
    this.app.post("/", this.handleRequest.bind(this));
  }

  public add(abi: any[], handlers: { type: string; func: Handler["func"] }[]) {
    for (const handler of handlers) {
      const fnFragment = abi.find(
        (item) => item.name === handler.type && item.type === "function"
      );
      if (!fnFragment) {
        throw new Error(`Function ${handler.type} not found in ABI`);
      }
      const selector = toFunctionSelector(fnFragment);
      this.handlers[selector] = {
        type: fnFragment,
        func: handler.func,
      };
    }
  }

  private async handleRequest(c: any) {
    let sender: string, callData: string;

    if (c.req.method === "GET") {
      sender = c.req.param("sender");
      callData = c.req.param("callData");

      if (callData.endsWith(".json")) {
        callData = callData.slice(0, -5);
      }

      console.log(`Sender: ${sender}, CallData: ${callData}`);
    } else {
      const body = await c.req.json();
      sender = body.sender;
      callData = body.data;
    }

    if (!isAddress(sender) || !isHex(callData)) {
      return c.json({ message: "Invalid request format" }, 400);
    }

    try {
      const response = await this.call({ to: sender, data: callData });
      console.log(sender, response.body);
      return c.json(response.body, response.status);
    } catch (error) {
      return c.json({ message: `Internal server error: ${error}` }, 500);
    }
  }

  private async call(call: { to: string; data: string }) {
    const selector = call.data.slice(0, 10).toLowerCase();
    const handler = this.handlers[selector];

    if (!handler) {
      return {
        status: 404,
        body: {
          message: `No implementation for function with selector ${selector}`,
        },
      };
    }

    const args = call.data.slice(10);
    const result = (await handler.func(args, call)) as `0x${string}`;

    // Implement ERC-3668 compliant signing
    const validUntil = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now

    const messageHash = keccak256(
      encodePacked(
        ["bytes2", "address", "uint64", "bytes32", "bytes32"],
        [
          "0x1900",
          call.to as `0x${string}`,
          validUntil,
          keccak256(call.data as `0x${string}`),
          keccak256(result as `0x${string}`),
        ]
      )
    );

    const signature = await account.sign({ hash: messageHash });

    const data = encodeAbiParameters(
      parseAbiParameters("bytes,uint64, bytes"),
      [result, validUntil, signature]
    );

    return {
      status: 200, // 200 OK
      body: { data },
    };
  }

  public start(port: number) {
    serve({
      fetch: this.app.fetch,
      port,
    });
    console.log(`CCIP-Read Gateway is running on http://localhost:${port}`);
  }
}

const gateway = new CCIPReadGateway();

const qiaoAbi = [
  {
    name: "callOffchain",
    type: "function",
    inputs: [{ name: "input", type: "bytes" }],
    outputs: [{ name: "", type: "bytes" }],
  },
];

gateway.add(qiaoAbi, [
  {
    type: "callOffchain",
    func: async (args, call) => {
      const [input] = decodeAbiParameters(
        parseAbiParameters("bytes"),
        ("0x" + args) as `0x${string}`
      );

      // Here you would implement your actual off-chain logic
      const handleInput = (input: Hex): Hex => {
        const inputString = hexToString(input);
        const outPut = `Hello from CCIP-Read Gateway: ${inputString}`;
        return stringToHex(outPut);
      };
      const result = handleInput(input);

      return result;
    },
  },
]);

// Example usage ENS off-chain resolver:
const resolverAbi = [
  {
    name: "resolve",
    type: "function",
    inputs: [
      { name: "name", type: "bytes" },
      { name: "data", type: "bytes" },
    ],
    outputs: [{ name: "result", type: "bytes" }],
  },
];
const recordsData = {
  "qiao.qiaoprotocol.eth": {
    addr: "0xB084De01b2610F2F4ad8ab731Dbaaf78011422ED",
    text: {
      url: "https://qiao.up.railway.app/{sender}/{data}",
    },
  },
} as {
  [key: string]: {
    addr: string;
    text?: { [key: string]: string };
    contenthash?: string;
  };
};

function lookupRecord(
  name: string,
  queryType: string,
  key: string | null = null
) {
  const record = recordsData[name];
  if (!record) return null;

  switch (queryType) {
    case "addr":
      return record.addr;
    case "text":
      return key && record.text ? record.text[key] : null;
    case "contenthash":
      return record.contenthash;
    default:
      return null;
  }
}

gateway.add(resolverAbi, [
  {
    type: "resolve",
    func: async (args) => {
      // Decode the input arguments
      const [nameBytes, dataBytes] = decodeAbiParameters(
        parseAbiParameters("bytes,bytes"),
        ("0x" + args) as `0x${string}`
      );

      const name = hexToString(nameBytes);
      const data = hexToString(dataBytes);
      console.log(`Resolving: ${name}, data: ${data}`);

      // Parse the query type and parameters
      const [queryType, ...queryParams] = data.split(",");

      // Perform the lookup
      let result;
      switch (queryType) {
        case "addr(bytes32)":
        case "addr(bytes32,uint256)":
          result = lookupRecord(name, "addr");
          break;
        case "text(bytes32,string)":
          result = lookupRecord(name, "text", queryParams[0]);
          break;
        case "contenthash(bytes32)":
          result = lookupRecord(name, "contenthash");
          break;
        default:
          throw new Error(`Unsupported query type: ${queryType}`);
      }

      if (result === null) {
        throw new Error(`Record not found for ${name}`);
      }

      // Encode the result
      const encodedResult = encodeAbiParameters(parseAbiParameters("bytes"), [
        stringToHex(result || ""),
      ]);

      return encodedResult;
    },
  },
]);

gateway.start(3000);
