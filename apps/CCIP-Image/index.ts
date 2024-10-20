import { createGateway } from "@qiaoprotocol/ccip-gateway";
import {
  decodeAbiParameters,
  hexToString,
  parseAbiParameters,
  stringToHex,
  type Hex,
} from "viem";
import dotenv from "dotenv";
import { serve } from "@hono/node-server";
import { PinataSDK } from "pinata-web3";

dotenv.config();

const gateway = createGateway(process.env.PRIVATE_KEY as string);

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

      const pinata = new PinataSDK({
        pinataJwt: process.env.PINATA_JWT,
        pinataGateway: process.env.GATEWAY_URL,
      });

      const handleInput = async (input: Hex): Promise<Hex> => {
        const inputString = hexToString(input);
        async function generateImage(prompt: string) {
          const payload = {
            prompt,
            output_format: "jpeg",
          };

          const formData = new FormData();
          for (const [key, value] of Object.entries(payload)) {
            formData.append(key, value);
          }

          try {
            const response = await fetch(
              "https://api.stability.ai/v2beta/stable-image/generate/sd3",
              {
                method: "POST",
                body: formData,
                headers: {
                  Authorization: "Bearer " + process.env.STABILITY_API_KEY,
                  Accept: "image/*",
                },
              }
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            async function upload() {
              try {
                const file = new File([blob], `image-[${prompt}].jpeg`, {
                  type: "image/jpeg",
                });
                const upload = await pinata.upload.file(file);
                return upload.IpfsHash;
              } catch (error) {
                console.log(error);
              }
            }
            const imageUrl = await upload();
            return imageUrl;
          } catch (error) {
            console.error("Error:", error);
            throw error;
          }
        }

        const output = await generateImage(inputString);

        return stringToHex(output || "");
      };
      const result = handleInput(input);

      return result;
    },
  },
]);

serve({
  fetch: gateway.app.fetch,
  port: 3003,
});
console.log(`CCIP-Image is running on 3003`);
