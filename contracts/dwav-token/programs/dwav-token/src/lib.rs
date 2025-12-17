use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("DWAVxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

// ============================================================================
// DWAV TOKEN - DarkWave Studios Utility Token
// ============================================================================
// Total Supply: 100,000,000 DWAV
// Decimals: 9 (standard for Solana SPL tokens)
// Buy Tax: 0%
// Sell Tax: 5%
// Transfer Tax: 5%
// 
// Tax Distribution:
// - 2% Treasury (development, operations)
// - 2% Liquidity Pool
// - 1% Marketing
// ============================================================================

pub const TOTAL_SUPPLY: u64 = 100_000_000 * 1_000_000_000; // 100M with 9 decimals
pub const DECIMALS: u8 = 9;
pub const SELL_TAX_BPS: u16 = 500; // 5% = 500 basis points
pub const TRANSFER_TAX_BPS: u16 = 500; // 5% = 500 basis points
pub const BPS_DENOMINATOR: u16 = 10000;

// Tax distribution (out of 500 bps total)
pub const TREASURY_BPS: u16 = 200; // 2%
pub const LIQUIDITY_BPS: u16 = 200; // 2%
pub const MARKETING_BPS: u16 = 100; // 1%

#[program]
pub mod dwav_token {
    use super::*;

    /// Initialize the DWAV token configuration
    /// Only called once by the deployer
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.treasury_wallet = ctx.accounts.treasury_wallet.key();
        config.liquidity_wallet = ctx.accounts.liquidity_wallet.key();
        config.marketing_wallet = ctx.accounts.marketing_wallet.key();
        config.sell_tax_bps = SELL_TAX_BPS;
        config.transfer_tax_bps = TRANSFER_TAX_BPS;
        config.tax_enabled = false; // Disabled at launch, enable after liquidity added
        config.total_tax_collected = 0;
        config.bump = ctx.bumps.config;
        
        msg!("DWAV Token initialized!");
        msg!("Total Supply: 100,000,000 DWAV");
        msg!("Sell Tax: 5% | Transfer Tax: 5% | Buy Tax: 0%");
        msg!("Tax currently DISABLED - enable after liquidity added");
        
        Ok(())
    }

    /// Enable or disable tax collection
    /// Only authority can call this
    pub fn set_tax_enabled(ctx: Context<UpdateConfig>, enabled: bool) -> Result<()> {
        let config = &mut ctx.accounts.config;
        require!(ctx.accounts.authority.key() == config.authority, DwavError::Unauthorized);
        
        config.tax_enabled = enabled;
        msg!("Tax collection set to: {}", enabled);
        
        Ok(())
    }

    /// Update tax rates (in basis points, max 1000 = 10%)
    /// Only authority can call this
    pub fn update_tax_rates(
        ctx: Context<UpdateConfig>,
        sell_tax_bps: u16,
        transfer_tax_bps: u16,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        require!(ctx.accounts.authority.key() == config.authority, DwavError::Unauthorized);
        require!(sell_tax_bps <= 1000, DwavError::TaxTooHigh); // Max 10%
        require!(transfer_tax_bps <= 1000, DwavError::TaxTooHigh); // Max 10%
        
        config.sell_tax_bps = sell_tax_bps;
        config.transfer_tax_bps = transfer_tax_bps;
        
        msg!("Tax rates updated - Sell: {}bps, Transfer: {}bps", sell_tax_bps, transfer_tax_bps);
        
        Ok(())
    }

    /// Update wallet addresses for tax distribution
    /// Only authority can call this
    pub fn update_wallets(
        ctx: Context<UpdateConfig>,
        treasury: Option<Pubkey>,
        liquidity: Option<Pubkey>,
        marketing: Option<Pubkey>,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        require!(ctx.accounts.authority.key() == config.authority, DwavError::Unauthorized);
        
        if let Some(addr) = treasury {
            config.treasury_wallet = addr;
        }
        if let Some(addr) = liquidity {
            config.liquidity_wallet = addr;
        }
        if let Some(addr) = marketing {
            config.marketing_wallet = addr;
        }
        
        msg!("Wallet addresses updated");
        
        Ok(())
    }

    /// Transfer authority to a new address
    /// Only current authority can call this
    pub fn transfer_authority(ctx: Context<UpdateConfig>, new_authority: Pubkey) -> Result<()> {
        let config = &mut ctx.accounts.config;
        require!(ctx.accounts.authority.key() == config.authority, DwavError::Unauthorized);
        
        config.authority = new_authority;
        msg!("Authority transferred to: {}", new_authority);
        
        Ok(())
    }

    /// Transfer tokens with automatic tax deduction
    /// This is called for sells and transfers (not buys)
    pub fn transfer_with_tax(
        ctx: Context<TransferWithTax>,
        amount: u64,
        is_sell: bool,
    ) -> Result<()> {
        let config = &ctx.accounts.config;
        
        // Calculate tax if enabled
        let tax_bps = if config.tax_enabled {
            if is_sell { config.sell_tax_bps } else { config.transfer_tax_bps }
        } else {
            0
        };
        
        let tax_amount = (amount as u128)
            .checked_mul(tax_bps as u128)
            .unwrap()
            .checked_div(BPS_DENOMINATOR as u128)
            .unwrap() as u64;
        
        let transfer_amount = amount.checked_sub(tax_amount).unwrap();
        
        // Transfer main amount to recipient
        let cpi_accounts = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, transfer_amount)?;
        
        // Distribute tax if applicable
        if tax_amount > 0 {
            // Treasury: 2/5 of tax (2% of 5%)
            let treasury_amount = tax_amount * TREASURY_BPS as u64 / SELL_TAX_BPS as u64;
            // Liquidity: 2/5 of tax (2% of 5%)
            let liquidity_amount = tax_amount * LIQUIDITY_BPS as u64 / SELL_TAX_BPS as u64;
            // Marketing: 1/5 of tax (1% of 5%)
            let marketing_amount = tax_amount - treasury_amount - liquidity_amount;
            
            // Transfer to treasury
            let treasury_cpi = Transfer {
                from: ctx.accounts.from.to_account_info(),
                to: ctx.accounts.treasury_account.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            };
            token::transfer(
                CpiContext::new(ctx.accounts.token_program.to_account_info(), treasury_cpi),
                treasury_amount,
            )?;
            
            // Transfer to liquidity
            let liquidity_cpi = Transfer {
                from: ctx.accounts.from.to_account_info(),
                to: ctx.accounts.liquidity_account.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            };
            token::transfer(
                CpiContext::new(ctx.accounts.token_program.to_account_info(), liquidity_cpi),
                liquidity_amount,
            )?;
            
            // Transfer to marketing
            let marketing_cpi = Transfer {
                from: ctx.accounts.from.to_account_info(),
                to: ctx.accounts.marketing_account.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            };
            token::transfer(
                CpiContext::new(ctx.accounts.token_program.to_account_info(), marketing_cpi),
                marketing_amount,
            )?;
            
            msg!("Tax collected: {} DWAV", tax_amount);
            msg!("  Treasury: {}, Liquidity: {}, Marketing: {}", 
                treasury_amount, liquidity_amount, marketing_amount);
        }
        
        msg!("Transferred {} DWAV (after {} tax)", transfer_amount, tax_amount);
        
        Ok(())
    }
}

// ============================================================================
// ACCOUNTS
// ============================================================================

#[account]
#[derive(Default)]
pub struct DwavConfig {
    pub authority: Pubkey,        // Owner/admin of the token config
    pub treasury_wallet: Pubkey,  // 2% of tax goes here
    pub liquidity_wallet: Pubkey, // 2% of tax goes here
    pub marketing_wallet: Pubkey, // 1% of tax goes here
    pub sell_tax_bps: u16,        // Sell tax in basis points (500 = 5%)
    pub transfer_tax_bps: u16,    // Transfer tax in basis points (500 = 5%)
    pub tax_enabled: bool,        // Whether tax collection is active
    pub total_tax_collected: u64, // Running total of all taxes collected
    pub bump: u8,                 // PDA bump seed
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 2 + 2 + 1 + 8 + 1,
        seeds = [b"dwav-config"],
        bump
    )]
    pub config: Account<'info, DwavConfig>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: Treasury wallet address
    pub treasury_wallet: UncheckedAccount<'info>,
    
    /// CHECK: Liquidity wallet address
    pub liquidity_wallet: UncheckedAccount<'info>,
    
    /// CHECK: Marketing wallet address
    pub marketing_wallet: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(
        mut,
        seeds = [b"dwav-config"],
        bump = config.bump
    )]
    pub config: Account<'info, DwavConfig>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferWithTax<'info> {
    #[account(
        seeds = [b"dwav-config"],
        bump = config.bump
    )]
    pub config: Account<'info, DwavConfig>,
    
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub treasury_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub liquidity_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub marketing_account: Account<'info, TokenAccount>,
    
    pub owner: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum DwavError {
    #[msg("Unauthorized - only authority can perform this action")]
    Unauthorized,
    
    #[msg("Tax rate too high - maximum is 10% (1000 basis points)")]
    TaxTooHigh,
    
    #[msg("Insufficient balance for transfer")]
    InsufficientBalance,
}
