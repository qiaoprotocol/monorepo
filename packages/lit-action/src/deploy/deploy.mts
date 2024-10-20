import * as IPFS from "ipfs-core";
import * as fs from "fs";

const env = fs.readFileSync("./.env", "utf8");

if (env.includes("LIT_ACTION_CODE")) {
  console.log(
    "there is already a deployed LIT ACTION, please remove it first to deploy the new one"
  );
  process.exit(1);
} else {
  const ipfs = await IPFS.create({ repo: "ok" + Math.random() });
  const code = fs.readFileSync("./deploy/litActionCode.js", "utf8");
  const { path } = await ipfs.add(code);

  const data = {
    path: path,
    url: `https://ipfs.litgateway.com/ipfs/${path}`,
  };

  fs.writeFileSync("./deploy/litActionCode.json", JSON.stringify(data));
  fs.appendFileSync("./.env", `\nLIT_ACTION_CODE=${path}`);
  console.log(`successfully deployed LIT ACTION CODE to ${path}`);
  process.exit(1);
}
