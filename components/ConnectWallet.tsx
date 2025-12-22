'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet, CheckCircle, Shield, AlertCircle } from 'lucide-react'

interface ConnectWalletProps {
  isConnected: boolean
  onConnect: (address: string) => void
}

interface PermissionRequest {
  target: string
  maxAmount: string
  duration: number
  intentHash: string
}

export default function ConnectWallet({ isConnected, onConnect }: ConnectWalletProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [address, setAddress] = useState('')
  const [chainId, setChainId] = useState<number | null>(null)
  const [hasPermissions, setHasPermissions] = useState(false)

  useEffect(() => {
    // Check if already connected
    checkConnection()
    
    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const checkConnection = async () => {
    if (typeof window.ethereum === 'undefined') return

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
      const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string
      
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0])
        setChainId(parseInt(chainId, 16))
        onConnect(accounts[0])
      }
    } catch (error) {
      console.error('Failed to check connection:', error)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAddress('')
      setHasPermissions(false)
    } else {
      setAddress(accounts[0])
      onConnect(accounts[0])
    }
  }

  const handleChainChanged = (chainId: string) => {
    setChainId(parseInt(chainId, 16))
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to continue with ERC-7715 Advanced Permissions')
        return
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[]

      if (accounts && accounts.length > 0) {
        const account = accounts[0]
        setAddress(account)
        onConnect(account)
        
        // Switch to Sepolia testnet (required for ERC-7715)
        await switchToSepolia()
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia
      })
      setChainId(11155111)
    } catch (switchError: any) {
      // If Sepolia is not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io/']
          }]
        })
        setChainId(11155111)
      }
    }
  }

  // ERC-7715 Permission Request Function
  const requestAdvancedPermission = async (permissionRequest: PermissionRequest) => {
    if (!window.ethereum || !address) {
      throw new Error('Wallet not connected')
    }

    try {
      // ERC-7715 Advanced Permissions request
      const permissionParams = {
        permissions: [{
          invoker: process.env.NEXT_PUBLIC_AUTOMATION_EXECUTOR_ADDRESS || '0x0000000000000000000000000000000000000000',
          caveats: [
            {
              type: 'spendingLimit',
              value: {
                token: permissionRequest.target,
                amount: permissionRequest.maxAmount
              }
            },
            {
              type: 'timeLimit',
              value: {
                validUntil: Math.floor(Date.now() / 1000) + permissionRequest.duration
              }
            },
            {
              type: 'allowedMethods',
              value: ['supply', 'withdraw', 'borrow', 'repay'] // Aave methods
            }
          ]
        }]
      }

      const result = await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [permissionParams]
      })

      setHasPermissions(true)
      console.log('ERC-7715 Permission granted:', result)
      return result
    } catch (error) {
      console.error('Permission request failed:', error)
      throw error
    }
  }

  // Expose permission function globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).requestMetaMaskPermission = requestAdvancedPermission
    }
  }, [address])

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 11155111: return 'Sepolia'
      case 1: return 'Mainnet'
      case 137: return 'Polygon'
      default: return chainId ? `Chain ${chainId}` : 'Unknown'
    }
  }

  if (isConnected && address) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-2 md:space-x-3 glass-card px-3 md:px-4 py-2"
      >
        <div className="flex items-center space-x-1 md:space-x-2">
          <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
          {hasPermissions && <Shield className="h-3 w-3 md:h-4 md:w-4 text-blue-400" />}
        </div>
        <div className="text-xs md:text-sm">
          <div className="text-white font-medium">
            {`${address.slice(0, 4)}...${address.slice(-3)}`}
            <span className="hidden sm:inline">{`${address.slice(4, 6)}...${address.slice(-4, -3)}`}</span>
          </div>
          <div className="text-gray-400 text-xs">
            {getNetworkName(chainId)}
            {hasPermissions && <span className="hidden md:inline"> • ERC-7715 Active</span>}
          </div>
        </div>
        {chainId !== 11155111 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={switchToSepolia}
            className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded hidden md:block"
          >
            Switch to Sepolia
          </motion.button>
        )}
      </motion.div>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 md:px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
    >
      {isConnecting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Connect MetaMask</span>
          <span className="sm:hidden">Connect</span>
          <Shield className="h-3 w-3 opacity-70" />
        </>
      )}
    </motion.button>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
    requestMetaMaskPermission?: (request: PermissionRequest) => Promise<any>
  }
}