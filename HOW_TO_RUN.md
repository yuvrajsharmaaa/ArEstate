# 🚀 How to Run KrayState ArEstate Project

Your KrayState project is a **blockchain-based platform**, so "running" it works differently than traditional web apps. Here are all the ways to interact with your deployed contracts:

## 🎯 Project Status: READY TO USE!

✅ **Smart Contracts:** All deployed on Sepolia testnet  
✅ **Compilation:** Clean, no errors  
✅ **ABIs:** Generated and ready for frontend integration

---

## 🔧 Ways to "Run" Your Project:

### 1. **🌐 Live Contracts (Already Running!)**

Your contracts are **live and functional** on Sepolia testnet:

**View on Etherscan:**

- [IdentityRegistry](https://sepolia.etherscan.io/address/0xD4b19AB3f4e22557b32aD8d88E0C0737c5f8B933)
- [PropertyToken](https://sepolia.etherscan.io/address/0xc601F6352300Af039FA9E4F63545cC52c33D44D8)
- [LeaseAgreement](https://sepolia.etherscan.io/address/0x987C8053eb163bb63bb4EEB85cAaDF3041d2D922)
- [EscrowPayment](https://sepolia.etherscan.io/address/0x4722813a0d172B8e13fB092f032dd84341aE8515)

### 2. **💻 Hardhat Console (Interactive Mode)**

```bash
# Start interactive console connected to your deployed contracts
pnpm hardhat console --network sepolia
```

Then you can interact with contracts:

```javascript
const registry = await ethers.getContractAt(
  "IdentityRegistry",
  "0xD4b19AB3f4e22557b32aD8d88E0C0737c5f8B933"
);
await registry.isVerified("0x14987b6b98A4a2564d0b16c64c1Ed9fc9E974179");
```

### 3. **🔬 Run Tests**

```bash
# Run all contract tests
pnpm run test

# Run with coverage report
pnpm run coverage
```

### 4. **🌐 Local Development Network**

```bash
# Start local Hardhat network (in terminal 1)
pnpm hardhat node

# Deploy to local network (in terminal 2)
pnpm hardhat run scripts/deploy-clean.js --network localhost
```

### 5. **📱 Frontend Integration**

Your `frontend-integration.js` file is ready for connecting to a React/Next.js/Vue frontend:

```javascript
import KrayStateWeb3 from "./frontend-integration.js";

const krayState = new KrayStateWeb3();
await krayState.connectWallet();
// Now interact with your live contracts!
```

---

## 🎮 Quick Demo Commands:

### **Check Contract Sizes:**

```bash
pnpm run size
```

### **Lint Smart Contracts:**

```bash
pnpm run lint
```

### **Generate Gas Reports:**

```bash
pnpm run gas
```

### **Interact with Live Contracts:**

```bash
# Start Hardhat console connected to Sepolia
pnpm hardhat console --network sepolia

# In the console, you can run:
# const accounts = await ethers.getSigners();
# const identity = await ethers.getContractAt("IdentityRegistry", "0xD4b19AB3f4e22557b32aD8d88E0C0737c5f8B933");
# await identity.isVerified(accounts[0].address);
```

---

## 🚀 Next Steps - Build the Frontend:

Since your smart contracts are live and working, you can now:

1. **Create a React/Next.js frontend**
2. **Use your `frontend-integration.js` helper**
3. **Connect to MetaMask wallet**
4. **Interact with your deployed contracts**

Your backend is **100% ready and running** on the blockchain! 🎉

---

## 📋 Available Scripts:

- `pnpm run compile` - Compile contracts
- `pnpm run test` - Run tests
- `pnpm run deploy:testnet` - Deploy to testnet
- `pnpm run lint` - Check code quality
- `pnpm run size` - Check contract sizes
- `pnpm run coverage` - Generate test coverage
