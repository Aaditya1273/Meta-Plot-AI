'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, User, Sparkles, CheckCircle, AlertTriangle, Plus } from 'lucide-react'
import { PermissionManager, IntentParser } from '@/lib/permissions'
import { AdvancedIntentAnalyzer } from '@/lib/ai/intent-analyzer'
import { automationEngine } from '@/lib/agents/automation-engine'
import A2ADelegate from './A2ADelegate'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  status?: 'processing' | 'success' | 'error'
  taskId?: string
}

interface ChatInterfaceProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm your Meta-Pilot AI. Tell me what you'd like to do with your DeFi portfolio. For example: 'Keep $100 USDC safe, invest extra in best Aave yield weekly'",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [showA2ADelegate, setShowA2ADelegate] = useState(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Get user address
    const loadUserAddress = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            setUserAddress(accounts[0])
          }
        } catch (error) {
          console.error('Failed to get user address:', error)
        }
      }
    }
    loadUserAddress()
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    // Simulate AI processing with Gemini
    setTimeout(async () => {
      try {
        // Use advanced AI-powered intent analysis
        const analysis = await AdvancedIntentAnalyzer.analyzeIntent(input)
        
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `Perfect! I understand you want to:

📊 **Strategy**: ${analysis.action === 'yield' ? 'Auto-invest' : analysis.action} in ${analysis.protocol.toUpperCase()} 
💰 **Amount**: ${analysis.amount} ${analysis.asset}
⏰ **Frequency**: ${analysis.frequency}
⛽ **Gas Limit**: Under ${analysis.gasLimit} gwei
📈 **Min Yield**: ${analysis.minYield}% APY
🎯 **Confidence**: ${analysis.confidence}%
⚠️ **Risk Level**: ${analysis.riskLevel}

**AI Recommendations:**
${analysis.suggestedOptimizations.map(opt => `• ${opt}`).join('\n')}

**Market Context:** ${analysis.marketContext.recommendation}

I'll create a permission request for MetaMask. This will allow me to execute these actions autonomously on your behalf. Ready to proceed?`,
          timestamp: new Date(),
          status: 'success'
        }

        setMessages(prev => [...prev, botResponse])
        setIsProcessing(false)

        // Add permission flow button after a delay
        setTimeout(() => {
          const permissionMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: 'bot',
            content: 'PERMISSION_FLOW',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, permissionMessage])
        }, 1000)
      } catch (error) {
        console.error('AI analysis error:', error)
        // Fallback to basic parsing
        const params = IntentParser.parse(input)
        const summary = IntentParser.generateSummary(params)
        
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `I understand you want to:

${summary}

I'll create a permission request for MetaMask. This will allow me to execute these actions autonomously on your behalf. Ready to proceed?`,
          timestamp: new Date(),
          status: 'success'
        }

        setMessages(prev => [...prev, botResponse])
        setIsProcessing(false)

        setTimeout(() => {
          const permissionMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: 'bot',
            content: 'PERMISSION_FLOW',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, permissionMessage])
        }, 1000)
      }
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleGrantPermission = async () => {
    try {
      // Parse the last user input to get intent parameters
      const lastUserMessage = messages.filter(m => m.type === 'user').pop()
      if (!lastUserMessage) return

      // Use advanced AI analysis for permission creation
      const analysis = await AdvancedIntentAnalyzer.analyzeIntent(lastUserMessage.content)
      
      // Create permission (simplified for demo)
      const permissionManager = new PermissionManager()
      await permissionManager.connect()
      
      const permission = await permissionManager.createPermission(analysis)
      const permissionHash = await permissionManager.grantPermission(permission)
      
      // Add task to automation engine
      const taskId = await automationEngine.addTask(userAddress, analysis, permissionHash)
      setCurrentTaskId(taskId)

      const successMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `🎉 Permission granted successfully! Your Meta-Pilot AI is now active and monitoring conditions.

**Task ID**: ${taskId}
**Status**: Active
**Next Check**: Within 60 seconds

I'll start executing your strategy when optimal conditions are met. You can also create sub-agents to handle specific aspects of your strategy.`,
        timestamp: new Date(),
        status: 'success',
        taskId
      }
      setMessages(prev => [...prev, successMessage])

      // Add A2A delegation option
      setTimeout(() => {
        const a2aMessage: Message = {
          id: (Date.now() + 3).toString(),
          type: 'bot',
          content: 'A2A_DELEGATION',
          timestamp: new Date(),
          taskId
        }
        setMessages(prev => [...prev, a2aMessage])
      }, 2000)

    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: '❌ Permission request failed. Please make sure you\'re connected to Sepolia testnet and try again.',
        timestamp: new Date(),
        status: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleA2ADelegate = async (subAgentConfig: any) => {
    if (!currentTaskId) return

    try {
      const subAgentId = await automationEngine.createSubAgent(currentTaskId, subAgentConfig)
      
      const successMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `🤝 Sub-agent "${subAgentConfig.name}" created successfully!

**Sub-Agent ID**: ${subAgentId}
**Specialization**: ${subAgentConfig.specialization.replace('_', ' ')}
**Allocation**: ${subAgentConfig.allocation}% of parent agent
**Status**: Active

Your sub-agent is now working alongside your main agent to optimize your strategy.`,
        timestamp: new Date(),
        status: 'success'
      }
      setMessages(prev => [...prev, successMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: '❌ Failed to create sub-agent. Please try again.',
        timestamp: new Date(),
        status: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-card w-full max-w-2xl h-[600px] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Meta-Pilot AI</h2>
                <p className="text-sm text-gray-400">Your DeFi Co-Pilot</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`p-2 rounded-lg ${message.type === 'user' ? 'bg-primary/20' : 'bg-gray-700/50'}`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-primary" />
                    ) : (
                      <Bot className="h-4 w-4 text-secondary" />
                    )}
                  </div>
                  
                  <div className={`p-4 rounded-xl ${
                    message.type === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-800/50 text-gray-100'
                  }`}>
                    {message.content === 'PERMISSION_FLOW' ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-amber-400">
                          <Sparkles className="h-5 w-5" />
                          <span className="font-medium">Ready to Grant Permission</span>
                        </div>
                        <p className="text-sm text-gray-300">
                          Click below to grant Meta-Pilot AI the necessary permissions via MetaMask Advanced Permissions (ERC-7715).
                        </p>
                        <button
                          onClick={handleGrantPermission}
                          className="w-full bg-gradient-to-r from-primary to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-primary/90 hover:to-purple-600/90 transition-all duration-200"
                        >
                          Grant Permission via MetaMask
                        </button>
                      </div>
                    ) : message.content === 'A2A_DELEGATION' ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-purple-400">
                          <Bot className="h-5 w-5" />
                          <span className="font-medium">Create Sub-Agents (A2A)</span>
                        </div>
                        <p className="text-sm text-gray-300">
                          Want to optimize further? Create specialized sub-agents to handle specific aspects of your strategy.
                        </p>
                        <button
                          onClick={() => setShowA2ADelegate(true)}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600/90 hover:to-pink-600/90 transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                          <Plus className="h-5 w-5" />
                          <span>Create Sub-Agent</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.status && (
                          <div className={`flex items-center space-x-1 mt-2 text-xs ${
                            message.status === 'success' ? 'text-green-400' : 
                            message.status === 'error' ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {message.status === 'success' && <CheckCircle className="h-3 w-3" />}
                            {message.status === 'error' && <AlertTriangle className="h-3 w-3" />}
                            <span className="capitalize">{message.status}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-700/50 rounded-lg">
                    <Bot className="h-4 w-4 text-secondary" />
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-secondary border-t-transparent" />
                      <span className="text-gray-300">Analyzing your intent...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-white/10">
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your DeFi strategy in natural language..."
                className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isProcessing}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isProcessing}
                className="bg-primary hover:bg-primary/90 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              Try: "Keep $100 USDC safe, invest extra in best Aave yield weekly when gas is under 25 gwei"
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* A2A Delegation Modal */}
      <A2ADelegate
        isOpen={showA2ADelegate}
        onClose={() => setShowA2ADelegate(false)}
        parentTaskId={currentTaskId || ''}
        onDelegate={handleA2ADelegate}
      />
    </AnimatePresence>
  )
}