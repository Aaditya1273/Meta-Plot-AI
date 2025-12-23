'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet, CheckCircle, Shield } from 'lucide-react'

interface ConnectWalletProps {
  onConnect?: () => void
}

export default function ConnectWallet({ onConnect }: ConnectWalletProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [address, setAddress] = useState('')
  const [chainId, setChainId] = useState<number | null>(null)

  useEffect(() => {
    checkConnection()

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
    if (typeof window === 'undefined' || !window.ethereum) return

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
      const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string

      if (accounts && accounts.length > 0) {
        setAddress(accounts[0])
        setChainId(parseInt(chainId, 16))
        onConnect?.()
      }
    } catch (error) {
      console.error('Failed to check connection:', error)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAddress('')
    } else {
      setAddress(accounts[0])
      onConnect?.()
    }
  }

  const handleChainChanged = (chainId: string) => {
    setChainId(parseInt(chainId, 16))
  }

  const handleConnect = async () => {
    setIsConnecting(true)

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        alert('Please install MetaMask to continue')
        return
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[]

      if (accounts && accounts.length > 0) {
        setAddress(accounts[0])
        onConnect?.()
        await switchToSepolia()
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const switchToSepolia = async () => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      })
      setChainId(11155111)
    } catch (switchError: any) {
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

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 11155111: return 'Sepolia'
      case 1: return 'Mainnet'
      case 137: return 'Polygon'
      default: return chainId ? `Chain ${chainId}` : 'Unknown'
    }
  }

  if (address) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-2 md:space-x-3 glass-card px-3 md:px-4 py-2"
      >
        <div className="flex items-center space-x-1 md:space-x-2">
          <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
          <Shield className="h-3 w-3 md:h-4 md:w-4 text-primary" />
        </div>
        <div className="text-xs md:text-sm">
          <div className="text-white font-medium">
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </div>
          <div className="text-gray-400 text-xs">
            {getNetworkName(chainId)}
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
      className="flex items-center space-x-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-4 md:px-6 py-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base glow"
    >
      {isConnecting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Connect Wallet</span>
          <span className="sm:hidden">Connect</span>
        </>
      )}
    </motion.button>
  )
}

declare global {
  interface Window {
    ethereum?: any
  }
}