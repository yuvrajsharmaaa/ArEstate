# 🏢 Dynamic Real Estate Tokenization Platform

A cutting-edge blockchain platform for tokenizing real estate with **dynamic, configurable features** built on Integra Chain ecosystem.

## 🚀 Dynamic Features Overview

Our platform goes beyond static tokenization with **fully dynamic and configurable contracts**:

### 🏭 **PropertyFactory - Multi-Property Creation**

- **Create unlimited properties dynamically** with unique parameters
- **Flexible token economics** per property (management fees, dividends, staking)
- **Property categorization** (Residential, Commercial, Industrial, Mixed-Use, Luxury)
- **Clone-based architecture** for efficient deployment
- **Dynamic metadata updates** via IPFS integration

### 🎛️ **DynamicCompliance - Configurable Rules**

- **Per-token compliance rules** with customizable parameters
- **Risk-based investor assessments** (Low, Medium, High, Prohibited)
- **Dynamic country restrictions** and allowlists
- **Time-based compliance windows** and automated monitoring
- **Accredited investor verification** with flexible requirements
- **Whitelist/Blacklist management** with role-based access

### 📋 **DynamicLeaseManager - Advanced Lease Terms**

- **Variable payment frequencies** (Monthly, Quarterly, Semi-Annual, Annual, Custom)
- **Automatic rent escalations** with configurable adjustment types
- **Rent-to-own conversions** with dynamic ownership tracking
- **Multi-tenant lease agreements** with co-tenant support
- **Performance-based rent adjustments** linked to market data
- **Automated lease renewals** with flexible terms

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  PropertyFactory │    │ DynamicCompliance │    │DynamicLeaseManager│
│                 │    │                  │    │                 │
│ • Multi-Property│    │ • Configurable   │    │ • Flexible Terms│
│ • Token Economics│    │ • Risk-Based     │    │ • Rent-to-Own   │
│ • Categories    │    │ • Country Rules  │    │ • Co-Tenants    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ IdentityRegistry │
                    │                 │
                    │ • KYC/AML       │
                    │ • Verification  │
                    │ • Country Track │
                    └─────────────────┘
```

## 🎯 Key Innovations

### 1. **Dynamic Property Creation**

```javascript
// Create unlimited properties with unique configurations
const propertyConfig = {
  name: "Luxury Downtown Apartments",
  symbol: "LDA001",
  category: PropertyCategory.LUXURY,
  totalValue: ethers.utils.parseEther("5000000"), // $5M
  tokenEconomics: {
    managementFee: 250, // 2.5%
    performanceFee: 1500, // 15%
    enableDividends: true,
    enableStaking: true,
  },
};

await propertyFactory.createProperty(propertyConfig, tokenEconomics);
```

### 2. **Flexible Compliance Rules**

```javascript
// Configure compliance per property type
await dynamicCompliance.updateComplianceRule(
  tokenAddress,
  RuleType.RISK_BASED,
  {
    isActive: true,
    value1: ethers.utils.parseEther("50000"), // High-risk limit
    validUntil: block.timestamp + 365 * 24 * 3600, // 1 year
  }
);
```

### 3. **Advanced Lease Scenarios**

```javascript
// Create lease with rent escalations and rent-to-own
const leaseTerms = {
  paymentFrequency: PaymentFrequency.MONTHLY,
  adjustmentType: RentAdjustmentType.PERCENTAGE,
  adjustmentRate: 300, // 3% annual increase
  rentToOwnOption: true,
  ownershipConversionRate: 200, // 2% per payment
  autoRenewal: true,
};

await dynamicLeaseManager.createDynamicLease(
  tenant,
  mockUSDC,
  baseRent,
  deposit,
  startDate,
  endDate,
  leaseTerms,
  metadata
);
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+
- Hardhat
- Integra Chain testnet access

### Installation

```bash
git clone https://github.com/yuvrajsharmaaa/ArEstate.git
cd ArEstate
npm install
```

### Deployment

```bash
# Deploy dynamic platform
npx hardhat run scripts/deployDynamic.js --network integra-testnet

# Deploy basic version
npx hardhat run scripts/deploy.js --network integra-testnet
```

### Testing

```bash
# Run comprehensive tests
npx hardhat test

# Test specific features
npx hardhat test --grep "Dynamic"
```

## 📊 Contract Addresses

### Core Infrastructure

- **IdentityRegistry**: `0x...` - KYC/AML verification
- **DynamicCompliance**: `0x...` - Configurable compliance rules
- **PropertyFactory**: `0x...` - Multi-property creation

### Token Infrastructure

- **RealEstateToken Implementation**: `0x...` - Cloneable token contract
- **MockUSDC**: `0x...` - Payment token for testing

### Lease Infrastructure

- **DynamicLeaseManager**: `0x...` - Advanced lease management
- **Basic LeaseManager**: `0x...` - Simple lease functionality

## 🎮 Usage Examples

### Creating Multiple Properties

```javascript
// Residential Property
const residential = await propertyFactory.createProperty(
  {
    name: "Suburban Family Homes",
    category: PropertyCategory.RESIDENTIAL,
    totalValue: ethers.utils.parseEther("2000000"),
    // ... other config
  },
  residentialEconomics
);

// Commercial Property
const commercial = await propertyFactory.createProperty(
  {
    name: "Downtown Office Complex",
    category: PropertyCategory.COMMERCIAL,
    totalValue: ethers.utils.parseEther("10000000"),
    // ... other config
  },
  commercialEconomics
);
```

### Configuring Dynamic Compliance

```javascript
// Set country restrictions
await dynamicCompliance.setCountryRestrictions(
  tokenAddress,
  [840, 124, 826], // US, Canada, UK
  true, // allowed
  false // not restricted
);

// Update risk assessment
await dynamicCompliance.updateRiskAssessment(
  tokenAddress,
  investorAddress,
  RiskLevel.MEDIUM
);
```

### Advanced Lease Management

```javascript
// Create escalating rent lease
const escalatingTerms = {
  adjustmentType: RentAdjustmentType.PERCENTAGE,
  adjustmentRate: 500, // 5% annually
  adjustmentInterval: 365 * 24 * 3600, // 1 year
  maxRentIncrease: 1000, // Max 10% increase
};

// Activate rent-to-own
await dynamicLeaseManager.activateRentToOwn(leaseId);

// Add co-tenant
await dynamicLeaseManager.addCoTenant(leaseId, coTenantAddress);
```

## 🔧 Configuration Options

### Property Categories

- **RESIDENTIAL**: Family homes, apartments
- **COMMERCIAL**: Offices, retail spaces
- **INDUSTRIAL**: Warehouses, factories
- **MIXED_USE**: Multi-purpose buildings
- **LUXURY**: High-end properties
- **AFFORDABLE_HOUSING**: Social housing

### Compliance Rule Types

- **COUNTRY_RESTRICTION**: Geographic limitations
- **INVESTOR_LIMIT**: Maximum investor count
- **BALANCE_LIMIT**: Per-investor balance caps
- **ACCREDITATION**: Accredited investor requirements
- **TIME_WINDOW**: Time-based restrictions
- **RISK_BASED**: Risk score limitations
- **WHITELIST_ONLY**: Exclusive access lists
- **TRANSACTION_LIMIT**: Transfer size limits

### Rent Adjustment Types

- **FIXED**: No adjustments
- **PERCENTAGE**: Fixed percentage increases
- **MARKET_RATE**: Market-based adjustments
- **PERFORMANCE**: Property performance linked
- **CPI_INDEXED**: Inflation-indexed adjustments

## 🧪 Testing Scenarios

### Multi-Property Testing

```bash
# Test property factory
npx hardhat test --grep "PropertyFactory"

# Test different property categories
npx hardhat test --grep "category"
```

### Dynamic Compliance Testing

```bash
# Test configurable rules
npx hardhat test --grep "DynamicCompliance"

# Test risk assessments
npx hardhat test --grep "risk"
```

### Advanced Lease Testing

```bash
# Test rent escalations
npx hardhat test --grep "adjustRent"

# Test rent-to-own conversion
npx hardhat test --grep "rentToOwn"
```

## 🔗 Integra Chain Integration

### RWA Asset Passport

- **Dynamic metadata storage** via IPFS
- **Property verification** through compliance rules
- **Asset lifecycle tracking** with factory events

### Global Orderbook

- **Multi-property liquidity** pools
- **Category-based trading** pairs
- **Dynamic pricing** based on property performance

### Fiat Rails

- **MockUSDC integration** for testing
- **Multi-currency support** via approved tokens
- **Automated payments** through lease manager

## 📈 Tokenomics

### Dynamic Fee Structure

```javascript
const tokenEconomics = {
  managementFee: 200, // 2% annually
  performanceFee: 1000, // 10% on profits
  liquidityBuffer: 500, // 5% for buybacks
  enableDividends: true, // Profit distribution
  enableBuyback: true, // Token buybacks
  enableStaking: true, // Staking rewards
  stakingReward: 800, // 8% APY
};
```

### Revenue Distribution

- **Management Fees**: Property maintenance and management
- **Performance Fees**: Based on property appreciation
- **Dividend Payments**: Rental income distribution
- **Staking Rewards**: Token holder incentives
- **Buyback Programs**: Token value support

## 🛡️ Security Features

### Access Control

- **Role-based permissions** for all functions
- **Multi-signature support** for critical operations
- **Emergency pause mechanisms** for crisis management

### Compliance Enforcement

- **Automated KYC/AML checks** before all transfers
- **Real-time compliance monitoring** with configurable rules
- **Risk-based transaction limits** with dynamic adjustment

### Audit Trail

- **Complete transaction history** with compliance records
- **Property lifecycle tracking** from creation to disposal
- **Lease payment monitoring** with automated reporting

## 🎯 Hackathon Demo Features

### Quick Demo Setup

1. **Deploy contracts** with single command
2. **Pre-configured demo properties** with different categories
3. **Sample identities** with KYC verification
4. **Mock payment tokens** for immediate testing

### Interactive Features

- **Property creation wizard** with dynamic parameters
- **Compliance rule configuration** interface
- **Lease term builder** with rent escalations
- **Real-time monitoring** dashboard

## 🚀 Future Enhancements

### Planned Features

- **Cross-chain property bridges** for multi-chain liquidity
- **AI-powered risk assessments** for dynamic compliance
- **Automated market making** for property tokens
- **Integration with IoT devices** for smart property management

### Scaling Solutions

- **Layer 2 integration** for reduced transaction costs
- **Batch operations** for efficient multi-property management
- **Off-chain computation** for complex compliance calculations

## 📞 Support & Community

- **Documentation**: Comprehensive guides and API references
- **Discord**: Real-time community support
- **GitHub**: Open-source development and issues
- **Hackathon Support**: Dedicated channels for participants

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

_Built for Integra Chain ecosystem with ❤️ by the ArEstate team_
