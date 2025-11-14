# TapThat X - Setup & Run Guide

## Quick Start

### Prerequisites

1. **Node.js** >= 22.14.0 (you have v24.10.0 ✅)
2. **Yarn** package manager
3. **Git** (already installed)

### Step 1: Install Yarn

Choose one of these methods:

#### Option A: Using npm (recommended if you have sudo access)
```bash
sudo npm install -g yarn
```

#### Option B: Using corepack (if you have sudo access)
```bash
sudo corepack enable
corepack prepare yarn@3.2.3 --activate
```

#### Option C: Install Yarn locally (no sudo needed)
```bash
npm install -g yarn --prefix ~/.local
export PATH="$HOME/.local/bin:$PATH"
```

#### Option D: Use npx (temporary, no installation)
You can use `npx yarn` instead of `yarn` for all commands below.

### Step 2: Install Dependencies

```bash
cd /home/atos-mv/Desktop/TAP-TO_PAY/tap-that-x
yarn install
# OR if yarn is not available:
npx yarn install
```

### Step 3: Set Up Environment Variables (Optional)

Create `.env.local` file in `packages/nextjs/`:

```bash
cd packages/nextjs
touch .env.local
```

Add these variables (optional for basic testing):
```env
# Only needed if you want to use the gasless relay feature
RELAYER_PRIVATE_KEY=0x...

# Optional: For better RPC reliability
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key_here
```

**Note**: You can run the frontend without these for basic testing, but the relay features won't work.

### Step 4: Run the Development Server

From the project root:
```bash
yarn start
# OR
npx yarn start
```

This will:
- Start the Next.js development server
- Open at `http://localhost:3000`

### Alternative: Run from Next.js package directly

```bash
cd packages/nextjs
yarn dev
# OR
npx yarn dev
```

## Troubleshooting

### Issue: "yarn: command not found"

**Solution 1**: Install yarn globally (requires sudo):
```bash
sudo npm install -g yarn
```

**Solution 2**: Use npx instead:
```bash
npx yarn install
npx yarn start
```

**Solution 3**: Install yarn locally:
```bash
npm install -g yarn --prefix ~/.local
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Issue: "exports is not defined" error

This should be fixed with the webpack configuration changes. If you still see it:

1. **Clear Next.js cache**:
```bash
cd packages/nextjs
rm -rf .next
```

2. **Restart the dev server**:
```bash
yarn dev
```

### Issue: Port 3000 already in use

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# OR use a different port
PORT=3001 yarn start
```

### Issue: Module resolution errors

```bash
# Clean install
rm -rf node_modules packages/*/node_modules
yarn install
```

### Issue: TypeScript errors

The project has build error ignoring enabled in dev mode. If you want to check types:

```bash
yarn next:check-types
```

## Available Commands

From project root:

- `yarn start` - Start Next.js dev server
- `yarn build` - Build for production
- `yarn test` - Run Foundry tests
- `yarn deploy` - Deploy contracts
- `yarn compile` - Compile Solidity contracts

From `packages/nextjs/`:

- `yarn dev` - Start dev server (same as `yarn start` from root)
- `yarn build` - Build for production
- `yarn serve` - Serve production build

## Project Structure

```
tap-that-x/
├── packages/
│   ├── nextjs/          # Frontend (Next.js app)
│   │   ├── app/         # Pages and routes
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   └── .env.local   # Environment variables (create this)
│   └── foundry/         # Smart contracts
│       ├── contracts/    # Solidity contracts
│       └── test/         # Contract tests
└── package.json          # Root package.json (workspace config)
```

## Next Steps After Running

1. **Open browser**: Navigate to `http://localhost:3000`
2. **Connect wallet**: Use MetaMask or compatible wallet
3. **Switch network**: Connect to Base Sepolia or Sepolia testnet
4. **Register chip**: Go to `/register` page (requires NFC chip)
5. **Test features**: Explore other pages like `/approve`, `/configure`, `/execute`

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review error messages in the terminal
- Check browser console for frontend errors
- Verify Node.js version: `node --version` (should be >= 22.14.0)












