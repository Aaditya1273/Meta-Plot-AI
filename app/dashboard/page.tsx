'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Zap, 
  Bot, 
  ArrowLeft,
  RefreshCw,
  Pause,
  Play,
  X
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { EnvioAPI, UserData, AgentActivity } from '@/lib/envio'
import Link from 'next/link'

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userAddress, setUserAddress] = useState<string>('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    // Get user address from MetaMask
    const loadUserData = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            const address = accounts[0]
            setUserAddress(address)
            await fetchData(address)
          }
        } catch (error) {
          console.error('Failed to load user data:', error)
        }
      }
      setIsLoading(false)
    }

    loadUserData()
  }, [])

  useEffect(() => {
    if (!autoRefresh || !userAddress) return

    const interval = setInterval(() => {
      fetchData(userAddress)
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, userAddress])

  const fetchData = async (address: string) => {
    try {
      const [user, agents] = await Promise.all([
        EnvioAPI.getUserActivity(address),
        EnvioAPI.getAgentActivities(address)
      ])
      
      if (user) setUserData(user)
      setAgentActivities(agents)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleRefresh = () => {
    if (userAddress) {
      fetchData(userAddress)
    }
  }

  // Mock data for charts (replace with real Envio data)
  const yieldChartData = [
    { date: 'Mon', yield: 0.5 },
    { date: 'Tue', yield: 1.2 },
    { date: 'Wed', yield: 1.8 },
    { date: 'Thu', yield: 2.3 },
    { date: 'Fri', yield: 3.1 },
    { date: 'Sat', yield: 3.7 },
    { date: 'Sun', yield: 4.2 },
  ]

  const activityData = [
    { time: '00:00', transactions: 2 },
    { time: '04:00', transactions: 1 },
    { time: '08:00', transactions: 4 },
    { time: '12:00', transactions: 3 },
    { time: '16:00', transactions: 5 },
    { time: '20:00', transactions: 2 },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Meta-Pilot Dashboard</h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">
                {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Not connected'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-primary/20 text-primary' : 'bg-gray-700 text-gray-400'
              }`}
            >
              {autoRefresh ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <RefreshCw className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs text-green-400">+12.5%</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              ${userData?.totalInvested ? (parseFloat(userData.totalInvested) / 1e6).toFixed(2) : '0.00'}
            </div>
            <div className="text-sm text-gray-400">Total Invested</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-secondary/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <span className="text-xs text-green-400">+4.2%</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              ${userData?.totalYieldEarned ? (parseFloat(userData.totalYieldEarned) / 1e6).toFixed(2) : '0.00'}
            </div>
            <div className="text-sm text-gray-400">Yield Earned</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-accent/20 rounded-lg">
                <Activity className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {userData?.transactions?.length || 0}
            </div>
            <div className="text-sm text-gray-400">Total Transactions</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Bot className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {agentActivities.filter(a => a.status === 'ACTIVE').length}
            </div>
            <div className="text-sm text-gray-400">Active Agents</div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          {/* Yield Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Yield Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={yieldChartData}>
                <defs>
                  <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#10b981" 
                  fill="url(#yieldGradient)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Transaction Activity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Agent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Active Agents</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">Live</span>
            </div>
          </div>

          <div className="space-y-4">
            {agentActivities.length > 0 ? (
              agentActivities.map((agent) => (
                <div key={agent.id} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{agent.agentType.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-400">{agent.protocol.toUpperCase()} • {agent.asset}</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      agent.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                      agent.status === 'PAUSED' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {agent.status}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Executions</div>
                      <div className="text-white font-medium">{agent.executionCount}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Amount</div>
                      <div className="text-white font-medium">${(parseFloat(agent.amount) / 1e6).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Gas Limit</div>
                      <div className="text-white font-medium">{agent.gasCondition} gwei</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Min Yield</div>
                      <div className="text-white font-medium">{(parseFloat(agent.yieldCondition) / 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active agents yet</p>
                <Link href="/" className="text-primary hover:underline mt-2 inline-block">
                  Create your first agent
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Recent Transactions</h3>
          
          <div className="space-y-3">
            {userData?.transactions && userData.transactions.length > 0 ? (
              userData.transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      tx.type === 'DEPOSIT' ? 'bg-green-500/20' :
                      tx.type === 'WITHDRAW' ? 'bg-red-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      <Zap className={`h-4 w-4 ${
                        tx.type === 'DEPOSIT' ? 'text-green-400' :
                        tx.type === 'WITHDRAW' ? 'text-red-400' :
                        'text-blue-400'
                      }`} />
                    </div>
                    <div>
                      <div className="text-white font-medium">{tx.type}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(parseInt(tx.timestamp) * 1000).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-medium">
                      {(parseFloat(tx.amount) / 1e6).toFixed(2)} {tx.asset}
                    </div>
                    <div className="text-sm text-gray-400">{tx.protocol.toUpperCase()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  )
}