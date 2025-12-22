import { ethers } from 'ethers'
import { MetaMaskSDK } from '@metamask/sdk'

// MetaMask SDK and ERC-7715 types
export interface PermissionParams {
  target: string
  value: bigint
  expiry: number
  data?: string
}

export interface IntentParams {
  amount: number
  asset: string
  protocol: string
  frequency: string
  gasLimit: number
  minYield: number
  action: 'invest' | 'swap' | 'dca' | 'yield'
}

// Contract addresses on Sepolia
export const CONTRACTS = {
  AAVE_V3_POOL: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951',
  USDC: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
  WETH: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
}

// ERC-7715 Permission Creation
export class PermissionManager {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null

  constructor() {
    // Don't initialize during SSR
    if (typeof window === 'undefined') return
    
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum)
    }
  }

  async connect(): Promise<string> {
    try {
      if (!this.provider) {
        if (typeof window !== 'undefined' && window.ethereum) {
          this.provider = new ethers.BrowserProvider(window.ethereum)
        } else {
          throw new Error('MetaMask not detected')
        }
      }
      
      await this.provider.send('eth_requestAccounts', [])
      this.signer = await this.provider.getSigner()
      return await this.signer.getAddress()
    } catch (error) {
      throw new Error('Failed to connect to MetaMask')
    }
  }

  async createPermission(params: IntentParams): Promise<PermissionParams> {
    if (!this.signer) {
      throw new Error('Wallet not connected')
    }

    const { amount, asset, protocol, frequency } = params
    
    // Convert amount to wei
    const value = ethers.parseUnits(amount.toString(), 6) // USDC has 6 decimals
    
    // Calculate expiry based on frequency
    const now = Math.floor(Date.now() / 1000)
    const frequencyMap = {
      'daily': 24 * 60 * 60,
      'weekly': 7 * 24 * 60 * 60,
      'monthly': 30 * 24 * 60 * 60
    }
    const expiry = now + (frequencyMap[frequency as keyof typeof frequencyMap] || frequencyMap.weekly) * 4 // 4 periods

    // Determine target contract based on protocol
    let target = CONTRACTS.AAVE_V3_POOL
    if (protocol === 'compound') {
      // Add Compound address when available
      target = CONTRACTS.AAVE_V3_POOL
    }

    return {
      target,
      value,
      expiry,
      data: '0x' // Additional calldata if needed
    }
  }

  async grantPermission(permission: PermissionParams): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected')
    }

    try {
      // This would integrate with Smart Accounts Kit
      // For now, we'll simulate the permission granting
      console.log('Granting permission:', permission)
      
      // In real implementation, this would call:
      // const smartAccount = await createSmartAccount(...)
      // const permissionHash = await smartAccount.grantPermission(permission)
      
      // Simulate transaction hash
      const mockTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
      
      return mockTxHash
    } catch (error) {
      throw new Error('Failed to grant permission')
    }
  }

  async revokePermission(permissionHash: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected')
    }

    try {
      // This would integrate with Smart Accounts Kit to revoke
      console.log('Revoking permission:', permissionHash)
      
      // Simulate revocation
      const mockTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
      
      return mockTxHash
    } catch (error) {
      throw new Error('Failed to revoke permission')
    }
  }

  async checkPermissionStatus(permissionHash: string): Promise<{
    isActive: boolean
    remainingValue: bigint
    expiry: number
  }> {
    // This would query the smart contract for permission status
    return {
      isActive: true,
      remainingValue: ethers.parseUnits('400', 6),
      expiry: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
    }
  }
}

// Intent Parser - converts natural language to structured parameters
export class IntentParser {
  private static patterns = {
    amount: /\$?(\d+(?:\.\d+)?)\s*(usdc|eth|dai|matic)/i,
    protocol: /(aave|compound|uniswap|curve)/i,
    frequency: /(daily|weekly|monthly|hourly)/i,
    gas: /gas.*?(?:under|below|<)\s*(\d+)\s*gwei/i,
    yield: /yield.*?(?:above|over|>)\s*(\d+(?:\.\d+)?)%/i,
    action: /(invest|swap|trade|stake|lend|borrow|dca)/i,
    reserve: /(?:keep|reserve|save)\s*\$?(\d+(?:\.\d+)?)/i
  }

  static parse(input: string): IntentParams {
    const text = input.toLowerCase()
    
    // Extract parameters using regex patterns
    const amountMatch = text.match(this.patterns.amount)
    const protocolMatch = text.match(this.patterns.protocol)
    const frequencyMatch = text.match(this.patterns.frequency)
    const gasMatch = text.match(this.patterns.gas)
    const yieldMatch = text.match(this.patterns.yield)
    const actionMatch = text.match(this.patterns.action)
    const reserveMatch = text.match(this.patterns.reserve)

    // Determine action type
    let action: IntentParams['action'] = 'invest'
    if (actionMatch) {
      const actionText = actionMatch[1]
      if (['swap', 'trade'].includes(actionText)) action = 'swap'
      else if (actionText === 'dca') action = 'dca'
      else if (['stake', 'lend', 'invest'].includes(actionText)) action = 'yield'
    }

    return {
      amount: amountMatch ? parseFloat(amountMatch[1]) : 100,
      asset: amountMatch ? amountMatch[2].toUpperCase() : 'USDC',
      protocol: protocolMatch ? protocolMatch[1].toLowerCase() : 'aave',
      frequency: frequencyMatch ? frequencyMatch[1] : 'weekly',
      gasLimit: gasMatch ? parseInt(gasMatch[1]) : 30,
      minYield: yieldMatch ? parseFloat(yieldMatch[1]) : 3,
      action
    }
  }

  static generateSummary(params: IntentParams): string {
    const { amount, asset, protocol, frequency, gasLimit, minYield, action } = params
    
    let summary = `**Strategy**: ${action === 'yield' ? 'Auto-invest' : action} in ${protocol.toUpperCase()}\n`
    summary += `**Amount**: ${amount} ${asset}\n`
    summary += `**Frequency**: ${frequency}\n`
    summary += `**Gas Limit**: Under ${gasLimit} gwei\n`
    summary += `**Min Yield**: ${minYield}% APY`
    
    return summary
  }
}

// Gas Price Monitor
export class GasMonitor {
  private provider: ethers.BrowserProvider | null = null

  constructor() {
    // Don't initialize during SSR
    if (typeof window === 'undefined') return
    
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum)
    }
  }

  async getCurrentGasPrice(): Promise<number> {
    try {
      if (!this.provider) {
        if (typeof window !== 'undefined' && window.ethereum) {
          this.provider = new ethers.BrowserProvider(window.ethereum)
        } else {
          return 25 // Default fallback
        }
      }
      
      const gasPrice = await this.provider.getFeeData()
      const gasPriceGwei = Number(ethers.formatUnits(gasPrice.gasPrice || 0n, 'gwei'))
      return Math.round(gasPriceGwei)
    } catch (error) {
      console.error('Failed to get gas price:', error)
      return 25 // Default fallback
    }
  }

  async waitForOptimalGas(maxGwei: number, timeoutMs: number = 300000): Promise<boolean> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeoutMs) {
      const currentGas = await this.getCurrentGasPrice()
      
      if (currentGas <= maxGwei) {
        return true
      }
      
      // Wait 30 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 30000))
    }
    
    return false // Timeout reached
  }
}

// Yield Monitor for DeFi protocols
export class YieldMonitor {
  async getAaveYields(): Promise<Array<{
    asset: string
    apy: number
    address: string
  }>> {
    // This would integrate with Aave's API or subgraph
    // For demo, return mock data
    return [
      { asset: 'USDC', apy: 4.2, address: CONTRACTS.USDC },
      { asset: 'USDT', apy: 4.1, address: '0x...' },
      { asset: 'DAI', apy: 3.9, address: '0x...' }
    ]
  }

  async getBestYieldPool(minApy: number): Promise<{
    asset: string
    apy: number
    address: string
  } | null> {
    const yields = await this.getAaveYields()
    const bestYield = yields
      .filter(pool => pool.apy >= minApy)
      .sort((a, b) => b.apy - a.apy)[0]
    
    return bestYield || null
  }
}