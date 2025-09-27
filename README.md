<<<<<<< HEAD

# ArEstate

=======

# KrayState - Blockchain-Based Tenant-Landlord Platform

[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.19.0-yellow)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.0.1-green)](https://openzeppelin.com/)
[![Integra Chain](https://img.shields.io/badge/Integra-Chain-purple)](https://integra.com/)

A comprehensive blockchain-based platform for real estate tokenization, lease management, and compliance built for **Integra Chain** with **ERC-3643** compliance.

## 🏗️ Architecture Overview

KrayState is a full-stack blockchain platform that enables:

- **Property Tokenization** with ERC-3643 compliance
- **Lease Agreement Management** with smart contract automation
- **Security Deposit Escrow** with automated release conditions
- **Rent Payment Automation** with fiat-crypto bridge integration
- **Jurisdictional Compliance** with audit reporting
- **Identity & KYC/AML Integration** with Soulbound Tokens

### Core Smart Contracts

| Contract                 | Description                       | Features                                                        |
| ------------------------ | --------------------------------- | --------------------------------------------------------------- |
| **PropertyToken.sol**    | ERC-3643 compliant security token | Property tokenization, compliance checks, transfer restrictions |
| **IdentityRegistry.sol** | KYC/AML identity management       | Soulbound tokens, identity verification, risk assessment        |
| **LeaseAgreement.sol**   | Lease lifecycle management        | Lease terms, rent tracking, dispute resolution                  |
| **EscrowPayment.sol**    | Payment & deposit automation      | Security deposits, automated payments, fiat bridge              |
| **Compliance.sol**       | Regulatory compliance engine      | Jurisdictional rules, audit trails, transfer restrictions       |

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js 16+ required
node --version

# Install dependencies
npm install
```

### Environment Setup

1. **Copy environment template:**

```bash
cp .env.example .env
```

2. **Configure environment variables:**

```bash
# .env
PRIVATE_KEY=your_private_key_here
INTEGRA_TESTNET_RPC=https://testnet-rpc.integra.com
INTEGRA_MAINNET_RPC=https://mainnet-rpc.integra.com
INTEGRA_EXPLORER_API_KEY=your_explorer_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Compilation & Testing

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Check contract sizes
npm run size

# Generate gas reports
REPORT_GAS=true npm run test
```

### Deployment

#### Deploy to Integra Testnet

```bash
npm run deploy:testnet
```

#### Deploy to Integra Mainnet

```bash
npm run deploy:mainnet
```

#### Deploy to Local Network

```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy to localhost
npx hardhat run scripts/deploy.js --network localhost
```

## 📋 Contract Specifications

### PropertyToken (ERC-3643)

**Features:**

- ✅ ERC-20 compatible with compliance extensions
- ✅ Identity registry integration
- ✅ Transfer restrictions and freezing
- ✅ Compliance rule enforcement
- ✅ Integra RWA Asset Passport integration
- ✅ Batch operations support

**Key Functions:**

```solidity
function canTransfer(address from, address to, uint256 amount) external view returns (bool);
function forcedTransfer(address from, address to, uint256 amount) external returns (bool);
function setAddressFrozen(address user, bool frozen) external;
function mint(address to, uint256 amount) external;
function burn(address user, uint256 amount) external;
```

### LeaseAgreement

**Lease Lifecycle:**

- `DRAFT` → `ACTIVE` → `TERMINATED`/`EXPIRED`
- Dispute resolution workflow
- Automated rent tracking
- Payment history management

**Key Functions:**

```solidity
function createLease(...) external returns (uint256 leaseId);
function activateLease(uint256 leaseId) external;
function recordRentPayment(uint256 leaseId, uint256 amount) external returns (uint256);
function raiseDispute(uint256 leaseId, string calldata details) external;
```

### EscrowPayment

**Payment Methods:**

- `CRYPTO` - Direct cryptocurrency payments
- `FIAT_BRIDGE` - Fiat payments via Integra bridge
- `HYBRID` - Mixed payment methods

**Key Functions:**

```solidity
function createSecurityDepositEscrow(...) external returns (uint256);
function fundSecurityDeposit(uint256 escrowId) external;
function releaseSecurityDeposit(uint256 escrowId, address recipient, uint256 amount) external;
function executeAutomatedPayment(uint256 subscriptionId) external returns (uint256);
```

## 🔗 Integra Chain Integration

### RWA Asset Passport

```solidity
struct PropertyMetadata {
    string assetPassportId;     // Integra RWA Asset Passport ID
    string propertyAddress;     // Physical property address
    uint256 totalValue;         // Total property valuation
    uint256 tokenizedPercentage;// Percentage tokenized (1-10000)
    string jurisdiction;        // Legal jurisdiction
    bytes32 documentHash;       // Property documents hash
    bool isActive;              // Property status
}
```

### Global Orderbook Integration

- Secondary market trading compatibility
- Jurisdiction-aware compliance
- Automated commission handling

### Fiat Payment Rails

- On-chain proof-of-payment
- Automated settlement
- Multi-currency support

## 🧪 Testing

### Run Complete Test Suite

```bash
npm test
```

### Test Coverage

```bash
npm run coverage
```

### Integration Tests

The platform includes comprehensive integration tests covering:

- Identity registration and KYC verification
- Property token minting and transfers
- Lease agreement creation and lifecycle
- Escrow deposit and payment automation
- Compliance rule enforcement

### Sample Test Workflow

```javascript
// 1. Register identities
await identityRegistry.registerIdentity(landlord.address, identityContract, 840);

// 2. Complete KYC verification
await identityRegistry.completeKYCVerification(landlord.address, "jumio", docHash, 2);

// 3. Mint property tokens
await propertyToken.mint(landlord.address, ethers.utils.parseEther("1000"));

// 4. Create lease agreement
const leaseId = await leaseAgreement.createLease(...);

// 5. Set up automated payments
const subscriptionId = await escrowPayment.createPaymentSubscription(...);
```

## 🛡️ Security & Compliance

### Access Control

- **Role-based permissions** using OpenZeppelin AccessControl
- **Multi-signature capabilities** for critical operations
- **Emergency pause mechanisms** for all contracts

### Compliance Features

- **ERC-3643** T-REX standard compliance
- **Identity verification** with KYC/AML integration
- **Transfer restrictions** by jurisdiction and investor type
- **Audit trails** for regulatory reporting
- **Holding period enforcement** for securities regulations

### Security Best Practices

- **ReentrancyGuard** on all state-changing functions
- **SafeERC20** for token transfers
- **Input validation** and overflow protection
- **Comprehensive event logging** for transparency

## 📊 Gas Optimization

Contracts are optimized for gas efficiency:

- **Batch operations** for multiple transfers/actions
- **Efficient storage patterns** to minimize gas costs
- **View functions** for off-chain calculations
- **Event-based data** for cost-effective historical tracking

## 🔧 Development & Deployment

### Project Structure

```
contracts/
├── PropertyToken.sol          # ERC-3643 property tokenization
├── IdentityRegistry.sol       # KYC/AML identity management
├── LeaseAgreement.sol         # Lease lifecycle management
├── EscrowPayment.sol          # Payment and escrow automation
├── Compliance.sol             # Regulatory compliance engine
├── interfaces/
│   ├── IERC3643.sol          # ERC-3643 interface
│   ├── IIdentityRegistry.sol  # Identity registry interface
│   └── ICompliance.sol        # Compliance interface
└── mocks/
    └── MockERC20.sol          # Testing token
```

### Configuration Files

- `hardhat.config.js` - Hardhat configuration with Integra networks
- `package.json` - Dependencies and scripts
- `.env.example` - Environment template

### Deployment Artifacts

Deployment creates:

- Contract addresses and ABIs
- Network configuration
- Role assignments
- Initial token approvals

## 🌐 Frontend Integration

### Contract ABIs

After compilation, ABIs are available in `artifacts/contracts/`

### Web3 Integration

```javascript
// Example: Connect to PropertyToken
import { ethers } from "ethers";
import PropertyTokenABI from "./artifacts/contracts/PropertyToken.sol/PropertyToken.json";

const propertyToken = new ethers.Contract(
  PROPERTY_TOKEN_ADDRESS,
  PropertyTokenABI.abi,
  signer
);

// Check if user can transfer tokens
const canTransfer = await propertyToken.canTransfer(from, to, amount);
```

### MetaMask Integration

```javascript
// Add Integra Chain to MetaMask
await window.ethereum.request({
  method: "wallet_addEthereumChain",
  params: [
    {
      chainId: "0x462", // 1122 in hex (Integra testnet)
      chainName: "Integra Testnet",
      nativeCurrency: {
        name: "IRL",
        symbol: "IRL",
        decimals: 18,
      },
      rpcUrls: ["https://testnet-rpc.integra.com"],
      blockExplorerUrls: ["https://testnet-explorer.integra.com"],
    },
  ],
});
```

## 📝 Roadmap

### Phase 1: Core Infrastructure ✅

- [x] ERC-3643 compliant PropertyToken
- [x] Identity Registry with KYC/AML
- [x] Basic lease agreement management
- [x] Escrow and payment automation
- [x] Compliance engine

### Phase 2: Advanced Features 🚧

- [ ] Integration with Integra Global Orderbook
- [ ] Fiat payment bridge implementation
- [ ] Advanced dispute resolution mechanisms
- [ ] Multi-property portfolio management
- [ ] Yield distribution automation

### Phase 3: Ecosystem Integration 📅

- [ ] Third-party KYC provider integrations
- [ ] Property valuation oracle integration
- [ ] Insurance protocol integration
- [ ] Cross-chain property transfers
- [ ] DeFi yield farming for deposits

### Phase 4: Governance & DAO 🔮

- [ ] Governance token for platform decisions
- [ ] DAO structure for protocol upgrades
- [ ] Community-driven compliance rules
- [ ] Decentralized dispute resolution

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open pull request**

### Development Guidelines

- Follow Solidity style guide
- Add comprehensive tests for new features
- Update documentation
- Ensure gas optimization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation:** [docs.kraystate.com](https://docs.kraystate.com)
- **Discord:** [discord.gg/kraystate](https://discord.gg/kraystate)
- **Email:** support@kraystate.com
- **GitHub Issues:** For bug reports and feature requests

---

## ⚡ Quick Command Reference

```bash
# Development
npm run compile          # Compile contracts
npm run test            # Run tests
npm run coverage        # Test coverage
npm run lint            # Lint Solidity code
npm run format          # Format code
npm run size            # Check contract sizes

# Deployment
npm run deploy:testnet  # Deploy to Integra testnet
npm run deploy:mainnet  # Deploy to Integra mainnet

# Verification
npm run verify          # Verify contracts on explorer

# Gas Analysis
REPORT_GAS=true npm test # Generate gas report
```

---

**Built with ❤️ for Integra Chain ecosystem**

Transform real estate with blockchain technology - transparent, efficient, and compliant property tokenization for the future of real estate investment.

> > > > > > > master
