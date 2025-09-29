// Auto-generated contract addresses for KrayState Platform
const CONTRACT_ADDRESSES = {
  mockUSDC: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  identityRegistry: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  compliance: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  propertyToken: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  leaseAgreement: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  escrowPayment: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  deployer: "0xa048BF909b13555293bfFA73219ae339be42d8B2",
  timestamp: "2025-09-28T07:55:00.000Z",
  network: "localhost",
  chainId: 1337,
};

// Export for browser use
if (typeof window !== "undefined") {
  window.CONTRACT_ADDRESSES = CONTRACT_ADDRESSES;
}

// Export for Node.js use
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONTRACT_ADDRESSES;
}

console.log("✅ Contract addresses loaded for KrayState Platform");
console.log(
  "📝 Available contracts:",
  Object.keys(CONTRACT_ADDRESSES).filter(
    (k) =>
      k !== "deployer" &&
      k !== "timestamp" &&
      k !== "network" &&
      k !== "chainId"
  )
);
