import { ethers } from 'ethers'
import { PermissionManager, IntentParams, GasMonitor, YieldMonitor } from '../permissions'

export interface AgentTask {
  id: string
  userId: string
  params: IntentParams
  permissionHash: string
  status: 'active' | 'paused' | 'completed' | 'failed'
  lastExecution?: Date
  nextExecution?: Date
  executionCount: number
  totalInvested: number
  totalYieldEarned: number
  createdAt: Date
}

export interface ExecutionResult {
  success: boolean
  txHash?: string
  amount?: number
  gasUsed?: number
  yieldEarned?: number
  error?: string
}

// Main Automation Engine
export class AutomationEngine {
  private permissionManager: PermissionManager
  private gasMonitor: GasMonitor
  private yieldMonitor: YieldMonitor
  private activeTasks: Map<string, AgentTask> = new Map()
  private isRunning: boolean = false

  constructor() {
    this.permissionManager = new PermissionManager()
    this.gasMonitor = new GasMonitor()
    this.yieldMonitor = new YieldMonitor()
  }

  // Add a new automation task
  async addTask(userId: string, params: IntentParams, permissionHash: string): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const task: AgentTask = {
      id: taskId,
      userId,
      params,
      permissionHash,
      status: 'active',
      nextExecution: this.calculateNextExecution(params.frequency),
      executionCount: 0,
      totalInvested: 0,
      totalYieldEarned: 0,
      createdAt: new Date()
    }

    this.activeTasks.set(taskId, task)
    
    // Start the engine if not already running
    if (!this.isRunning) {
      this.startEngine()
    }

    return taskId
  }

  // Remove/pause a task
  async pauseTask(taskId: string): Promise<boolean> {
    const task = this.activeTasks.get(taskId)
    if (task) {
      task.status = 'paused'
      return true
    }
    return false
  }

  async resumeTask(taskId: string): Promise<boolean> {
    const task = this.activeTasks.get(taskId)
    if (task && task.status === 'paused') {
      task.status = 'active'
      task.nextExecution = this.calculateNextExecution(task.params.frequency)
      return true
    }
    return false
  }

  // Get task status
  getTask(taskId: string): AgentTask | undefined {
    return this.activeTasks.get(taskId)
  }

  getAllTasks(userId: string): AgentTask[] {
    return Array.from(this.activeTasks.values()).filter(task => task.userId === userId)
  }

  // Main execution engine
  private async startEngine() {
    if (this.isRunning) return
    
    this.isRunning = true
    console.log('🤖 Automation Engine started')

    // Run every 60 seconds
    const interval = setInterval(async () => {
      try {
        await this.processTasks()
      } catch (error) {
        console.error('Engine processing error:', error)
      }
    }, 60000)

    // Store interval for cleanup
    ;(this as any).engineInterval = interval
  }

  private async processTasks() {
    const now = new Date()
    const tasksToExecute = Array.from(this.activeTasks.values()).filter(
      task => task.status === 'active' && 
               task.nextExecution && 
               task.nextExecution <= now
    )

    console.log(`🔄 Processing ${tasksToExecute.length} tasks`)

    for (const task of tasksToExecute) {
      try {
        await this.executeTask(task)
      } catch (error) {
        console.error(`Task ${task.id} execution failed:`, error)
        task.status = 'failed'
      }
    }
  }

  private async executeTask(task: AgentTask): Promise<ExecutionResult> {
    console.log(`🚀 Executing task ${task.id}`)
    
    const { params } = task

    // Step 1: Check gas conditions
    const currentGas = await this.gasMonitor.getCurrentGasPrice()
    if (currentGas > params.gasLimit) {
      console.log(`⛽ Gas too high: ${currentGas} > ${params.gasLimit} gwei, skipping`)
      // Reschedule for 10 minutes later
      task.nextExecution = new Date(Date.now() + 10 * 60 * 1000)
      return { success: false, error: 'Gas price too high' }
    }

    // Step 2: Check yield conditions (for yield farming)
    if (params.action === 'yield') {
      const bestPool = await this.yieldMonitor.getBestYieldPool(params.minYield)
      if (!bestPool) {
        console.log(`📉 No pools meet minimum yield requirement: ${params.minYield}%`)
        task.nextExecution = new Date(Date.now() + 60 * 60 * 1000) // Try again in 1 hour
        return { success: false, error: 'Yield requirements not met' }
      }
    }

    // Step 3: Execute the strategy
    let result: ExecutionResult
    
    switch (params.action) {
      case 'yield':
        result = await this.executeYieldStrategy(task)
        break
      case 'swap':
        result = await this.executeSwapStrategy(task)
        break
      case 'dca':
        result = await this.executeDCAStrategy(task)
        break
      default:
        result = await this.executeYieldStrategy(task) // Default to yield
    }

    // Step 4: Update task status
    if (result.success) {
      task.executionCount++
      task.lastExecution = new Date()
      task.nextExecution = this.calculateNextExecution(params.frequency)
      task.totalInvested += result.amount || 0
      task.totalYieldEarned += result.yieldEarned || 0
      
      console.log(`✅ Task ${task.id} executed successfully`)
    } else {
      console.log(`❌ Task ${task.id} execution failed: ${result.error}`)
    }

    return result
  }

  private async executeYieldStrategy(task: AgentTask): Promise<ExecutionResult> {
    const { params } = task
    
    try {
      // Get best yield pool
      const bestPool = await this.yieldMonitor.getBestYieldPool(params.minYield)
      if (!bestPool) {
        return { success: false, error: 'No suitable yield pool found' }
      }

      // Simulate Aave deposit transaction
      console.log(`💰 Depositing ${params.amount} ${params.asset} to ${bestPool.asset} pool (${bestPool.apy}% APY)`)
      
      // In real implementation, this would:
      // 1. Use the granted permission to execute the transaction
      // 2. Call Aave's deposit function
      // 3. Handle EIP-7702 batching for gas optimization
      
      const mockTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
      const estimatedYield = (params.amount * bestPool.apy / 100) / 52 // Weekly yield
      
      return {
        success: true,
        txHash: mockTxHash,
        amount: params.amount,
        gasUsed: 150000,
        yieldEarned: estimatedYield
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  private async executeSwapStrategy(task: AgentTask): Promise<ExecutionResult> {
    const { params } = task
    
    try {
      console.log(`🔄 Swapping ${params.amount} ${params.asset}`)
      
      // Simulate swap transaction
      const mockTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
      
      return {
        success: true,
        txHash: mockTxHash,
        amount: params.amount,
        gasUsed: 120000
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  private async executeDCAStrategy(task: AgentTask): Promise<ExecutionResult> {
    const { params } = task
    
    try {
      console.log(`📈 DCA: Buying ${params.amount} ${params.asset}`)
      
      // Simulate DCA transaction
      const mockTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
      
      return {
        success: true,
        txHash: mockTxHash,
        amount: params.amount,
        gasUsed: 180000
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  private calculateNextExecution(frequency: string): Date {
    const now = new Date()
    
    switch (frequency) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000)
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000)
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Default weekly
    }
  }

  // A2A (Agent-to-Agent) Delegation
  async createSubAgent(parentTaskId: string, subAgentParams: {
    name: string
    allocation: number // Percentage of parent agent's allocation
    specialization: 'gas-optimizer' | 'yield-hunter' | 'risk-manager'
  }): Promise<string> {
    const parentTask = this.activeTasks.get(parentTaskId)
    if (!parentTask) {
      throw new Error('Parent task not found')
    }

    // Create sub-agent with limited permissions
    const subAgentId = `subagent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const subAgentTask: AgentTask = {
      id: subAgentId,
      userId: parentTask.userId,
      params: {
        ...parentTask.params,
        amount: parentTask.params.amount * (subAgentParams.allocation / 100)
      },
      permissionHash: `sub_${parentTask.permissionHash}`,
      status: 'active',
      nextExecution: this.calculateNextExecution(parentTask.params.frequency),
      executionCount: 0,
      totalInvested: 0,
      totalYieldEarned: 0,
      createdAt: new Date()
    }

    // Add specialization logic
    switch (subAgentParams.specialization) {
      case 'gas-optimizer':
        subAgentTask.params.gasLimit = Math.floor(parentTask.params.gasLimit * 0.8) // More aggressive gas limits
        break
      case 'yield-hunter':
        subAgentTask.params.minYield = parentTask.params.minYield + 1 // Higher yield requirements
        break
      case 'risk-manager':
        subAgentTask.params.amount = Math.min(subAgentTask.params.amount, 50) // Cap individual transactions
        break
    }

    this.activeTasks.set(subAgentId, subAgentTask)
    
    console.log(`🤝 Created sub-agent ${subAgentParams.name} (${subAgentParams.specialization}) with ${subAgentParams.allocation}% allocation`)
    
    return subAgentId
  }

  // Stop the engine
  stopEngine() {
    if ((this as any).engineInterval) {
      clearInterval((this as any).engineInterval)
      this.isRunning = false
      console.log('🛑 Automation Engine stopped')
    }
  }
}

// Singleton instance
export const automationEngine = new AutomationEngine()