const EIP_712_DOMAIN = {
  name: "Notion-EIP-712",
  version: "1",
  chainId: 1,
} as const;

const EIP_712_TYPES = {
  Message: [
    { name: "name", type: "string" },
    { name: "message", type: "string" },
    { name: "url", type: "string" },
    { name: "from", type: "string" },
  ],
} as const;

export { EIP_712_DOMAIN, EIP_712_TYPES };
