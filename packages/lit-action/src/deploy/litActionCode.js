// Helper function to convert hex string to Uint8Array
const hexToUint8Array = (hex) => {
  return new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
};

// Helper function to pad a hex string to a specific length
const padHex = (hex, length) => hex.slice(2).padStart(length, "0");

const go = async () => {
  //sender, validUntil, callData, and result will be passed in through jsParams
  const messageToSign = hexToUint8Array(
    "0x1900" +
      padHex(sender, 40) +
      padHex(validUntil.toString(16), 64) +
      padHex(callData, 32) +
      padHex(result, 32)
  );

  // Sign the message using Lit Network's ECDSA signing
  const sigShare = await LitActions.signEcdsa({
    toSign: messageToSign,
    publicKey,
    sigName: "ccipSignature",
  });
};

go();
