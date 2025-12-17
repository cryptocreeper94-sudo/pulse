# DWAV Token - Solana Smart Contract

## Token Specifications

| Property | Value |
|----------|-------|
| **Name** | DWAV Token |
| **Symbol** | DWAV |
| **Total Supply** | 100,000,000 |
| **Decimals** | 9 |
| **Network** | Solana |
| **Framework** | Anchor |

## Tax Structure

| Transaction Type | Tax Rate |
|-----------------|----------|
| **Buy** | 0% |
| **Sell** | 5% |
| **Transfer** | 5% |

### Tax Distribution
- 2% Treasury (development, operations)
- 2% Liquidity Pool
- 1% Marketing

## Deployment Instructions

### Prerequisites
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### Build & Deploy

1. **Generate a new keypair for the program:**
```bash
solana-keygen new -o target/deploy/dwav_token-keypair.json
```

2. **Get the program ID:**
```bash
solana address -k target/deploy/dwav_token-keypair.json
```

3. **Update the program ID in:**
   - `lib.rs` - `declare_id!("YOUR_PROGRAM_ID")`
   - `Anchor.toml` - all program sections

4. **Build the program:**
```bash
anchor build
```

5. **Deploy to devnet (testing):**
```bash
anchor deploy --provider.cluster devnet
```

6. **Deploy to mainnet (production):**
```bash
anchor deploy --provider.cluster mainnet
```

### Create the SPL Token

After deploying the program, create the actual token:

```bash
# Create token with 9 decimals
spl-token create-token --decimals 9

# Create token account
spl-token create-account <TOKEN_ADDRESS>

# Mint 100,000,000 tokens
spl-token mint <TOKEN_ADDRESS> 100000000
```

### Initialize the Config

```typescript
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { DwavToken } from './target/types/dwav_token';

const program = new Program<DwavToken>(idl, programId, provider);

await program.methods
  .initialize()
  .accounts({
    config: configPda,
    authority: wallet.publicKey,
    treasuryWallet: treasuryAddress,
    liquidityWallet: liquidityAddress,
    marketingWallet: marketingAddress,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### Enable Tax Collection

```typescript
// After liquidity is added to DEX
await program.methods
  .setTaxEnabled(true)
  .accounts({
    config: configPda,
    authority: wallet.publicKey,
  })
  .rpc();
```

## Security Features

- **No Freeze Authority** - Tokens cannot be frozen (investor trust)
- **Mint Authority** - Kept initially for vesting distribution, can be revoked
- **Max Tax Cap** - Cannot exceed 10% (hardcoded)
- **Authority Transfer** - Ownership can be transferred for future governance

## Token Allocation (Recommended)

| Allocation | Amount | Vesting |
|------------|--------|---------|
| Public Sale | 40M (40%) | None |
| Team | 15M (15%) | 6mo cliff, 12mo vest |
| Development | 20M (20%) | Unlocked as needed |
| Marketing | 10M (10%) | Unlocked |
| Liquidity | 10M (10%) | Locked in DEX |
| Reserve | 5M (5%) | 12mo lock |

## Launch Checklist

- [ ] Deploy to devnet and test all functions
- [ ] Audit smart contract (optional but recommended)
- [ ] Deploy to mainnet
- [ ] Create token and mint supply
- [ ] Add liquidity to Raydium/Jupiter
- [ ] Enable tax collection
- [ ] Revoke mint authority (after all vesting complete)
- [ ] Set metadata to immutable

## Support

DarkWave Studios, LLC
https://pulse.darkwavestudios.io
