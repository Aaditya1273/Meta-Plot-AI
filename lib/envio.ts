import { GraphQLClient } from 'graphql-request'

// Envio GraphQL endpoint (replace with your deployed endpoint)
const ENVIO_ENDPOINT = process.env.NEXT_PUBLIC_ENVIO_ENDPOINT || 'http://localhost:8080/v1/graphql'

export const envioClient = new GraphQLClient(ENVIO_ENDPOINT)

// GraphQL Queries
export const GET_USER_ACTIVITY = `
  query GetUserActivity($userAddress: String!) {
    User(id: $userAddress) {
      id
      address
      totalInvested
      totalYieldEarned
      activeStrategies
      transactions(orderBy: timestamp, orderDirection: desc, first: 10) {
        id
        hash
        type
        amount
        asset
        protocol
        timestamp
        status
      }
      yieldEvents(orderBy: timestamp, orderDirection: desc, first: 5) {
        id
        protocol
        asset
        amount
        apy
        yieldEarned
        timestamp
      }
    }
  }
`

export const GET_RECENT_TRANSACTIONS = `
  query GetRecentTransactions($userAddress: String!, $first: Int = 20) {
    transactions(
      where: { user: $userAddress }
      orderBy: timestamp
      orderDirection: desc
      first: $first
    ) {
      id
      hash
      type
      amount
      asset
      protocol
      gasUsed
      gasPrice
      timestamp
      status
    }
  }
`

export const GET_YIELD_HISTORY = `
  query GetYieldHistory($userAddress: String!, $days: Int = 30) {
    yieldEvents(
      where: { user: $userAddress }
      orderBy: timestamp
      orderDirection: desc
      first: 100
    ) {
      id
      protocol
      asset
      amount
      apy
      yieldEarned
      timestamp
      blockNumber
    }
  }
`

export const GET_DAILY_STATS = `
  query GetDailyStats($days: Int = 7) {
    dailyStats(
      orderBy: date
      orderDirection: desc
      first: $days
    ) {
      id
      date
      totalUsers
      totalTransactions
      totalVolume
      totalYieldEarned
      avgGasPrice
      topProtocol
    }
  }
`

export const GET_AGENT_ACTIVITIES = `
  query GetAgentActivities($userAddress: String!) {
    agentActivities(
      where: { user: $userAddress }
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      agentType
      action
      amount
      asset
      protocol
      gasCondition
      yieldCondition
      executionCount
      lastExecution
      nextExecution
      status
      createdAt
    }
  }
`

// Type definitions for GraphQL responses
export interface UserData {
  id: string
  address: string
  totalInvested: string
  totalYieldEarned: string
  activeStrategies: number
  transactions: Transaction[]
  yieldEvents: YieldEvent[]
}

export interface Transaction {
  id: string
  hash: string
  type: 'DEPOSIT' | 'WITHDRAW' | 'SWAP' | 'PERMISSION_GRANT' | 'PERMISSION_REVOKE'
  amount: string
  asset: string
  protocol: string
  gasUsed: string
  gasPrice: string
  timestamp: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
}

export interface YieldEvent {
  id: string
  protocol: string
  asset: string
  amount: string
  apy: string
  yieldEarned: string
  timestamp: string
  blockNumber: string
}

export interface DailyStats {
  id: string
  date: string
  totalUsers: number
  totalTransactions: number
  totalVolume: string
  totalYieldEarned: string
  avgGasPrice: string
  topProtocol: string
}

export interface AgentActivity {
  id: string
  agentType: 'MASTER' | 'SUB_AGENT' | 'GAS_OPTIMIZER' | 'YIELD_HUNTER' | 'RISK_MANAGER'
  action: string
  amount: string
  asset: string
  protocol: string
  gasCondition: number
  yieldCondition: string
  executionCount: number
  lastExecution: string
  nextExecution: string
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED'
  createdAt: string
}

// API functions
export class EnvioAPI {
  static async getUserActivity(userAddress: string): Promise<UserData | null> {
    try {
      const data: any = await envioClient.request(GET_USER_ACTIVITY, { userAddress: userAddress.toLowerCase() })
      return data.User || null
    } catch (error) {
      console.error('Failed to fetch user activity:', error)
      return null
    }
  }

  static async getRecentTransactions(userAddress: string, first: number = 20): Promise<Transaction[]> {
    try {
      const data: any = await envioClient.request(GET_RECENT_TRANSACTIONS, { userAddress: userAddress.toLowerCase(), first })
      return data.transactions || []
    } catch (error) {
      console.error('Failed to fetch recent transactions:', error)
      return []
    }
  }

  static async getYieldHistory(userAddress: string, days: number = 30): Promise<YieldEvent[]> {
    try {
      const data: any = await envioClient.request(GET_YIELD_HISTORY, { userAddress: userAddress.toLowerCase(), days })
      return data.yieldEvents || []
    } catch (error) {
      console.error('Failed to fetch yield history:', error)
      return []
    }
  }

  static async getDailyStats(days: number = 7): Promise<DailyStats[]> {
    try {
      const data: any = await envioClient.request(GET_DAILY_STATS, { days })
      return data.dailyStats || []
    } catch (error) {
      console.error('Failed to fetch daily stats:', error)
      return []
    }
  }

  static async getAgentActivities(userAddress: string): Promise<AgentActivity[]> {
    try {
      const data: any = await envioClient.request(GET_AGENT_ACTIVITIES, { userAddress: userAddress.toLowerCase() })
      return data.agentActivities || []
    } catch (error) {
      console.error('Failed to fetch agent activities:', error)
      return []
    }
  }
}

// Real-time subscription setup (for WebSocket connections)
export const setupRealtimeSubscriptions = (userAddress: string, onUpdate: (data: any) => void) => {
  // This would set up WebSocket subscriptions for real-time updates
  // For demo purposes, we'll use polling
  const interval = setInterval(async () => {
    const userData = await EnvioAPI.getUserActivity(userAddress)
    if (userData) {
      onUpdate(userData)
    }
  }, 5000) // Poll every 5 seconds

  return () => clearInterval(interval)
}