'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Zap, Shield, TrendingUp, Plus, X } from 'lucide-react'

interface A2ADelegateProps {
  isOpen: boolean
  onClose: () => void
  parentTaskId: string
  onDelegate: (subAgentConfig: SubAgentConfig) => void
}

interface SubAgentConfig {
  name: string
  allocation: number
  specialization: 'gas-optimizer' | 'yield-hunter' | 'risk-manager'
  description: string
}

const AGENT_TYPES = [
  {
    type: 'gas-optimizer' as const,
    name: 'Gas Optimizer',
    icon: Zap,
    description: 'Monitors gas prices and executes only when conditions are optimal',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20'
  },
  {
    type: 'yield-hunter' as const,
    name: 'Yield Hunter',
    icon: TrendingUp,
    description: 'Seeks highest yield opportunities across protocols',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  {
    type: 'risk-manager' as const,
    name: 'Risk Manager',
    icon: Shield,
    description: 'Implements stop-loss and risk management strategies',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20'
  }
]

export default function A2ADelegate({ isOpen, onClose, parentTaskId, onDelegate }: A2ADelegateProps) {
  const [selectedType, setSelectedType] = useState<SubAgentConfig['specialization'] | null>(null)
  const [allocation, setAllocation] = useState(25)
  const [customName, setCustomName] = useState('')

  const handleDelegate = () => {
    if (!selectedType) return

    const agentType = AGENT_TYPES.find(t => t.type === selectedType)
    if (!agentType) return

    const config: SubAgentConfig = {
      name: customName || agentType.name,
      allocation,
      specialization: selectedType,
      description: agentType.description
    }

    onDelegate(config)
    onClose()
    
    // Reset form
    setSelectedType(null)
    setAllocation(25)
    setCustomName('')
  }

  if (!isOpen) return null

  return (
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
        className="glass-card w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Bot className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Create Sub-Agent</h2>
              <p className="text-sm text-gray-400">Delegate part of your strategy to a specialized agent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Agent Type Selection */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Choose Agent Specialization</h3>
            <div className="grid gap-4">
              {AGENT_TYPES.map((agent) => {
                const Icon = agent.icon
                return (
                  <motion.button
                    key={agent.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(agent.type)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedType === agent.type
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${agent.bgColor}`}>
                        <Icon className={`h-6 w-6 ${agent.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">{agent.name}</h4>
                        <p className="text-gray-400 text-sm">{agent.description}</p>
                      </div>
                      {selectedType === agent.type && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Allocation Slider */}
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-white font-medium mb-2">
                  Allocation Percentage: {allocation}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={allocation}
                  onChange={(e) => setAllocation(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer custom-slider"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>5%</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Custom Name */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Agent Name (Optional)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={AGENT_TYPES.find(t => t.type === selectedType)?.name}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Preview */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Sub-Agent Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{customName || AGENT_TYPES.find(t => t.type === selectedType)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Allocation:</span>
                    <span className="text-white">{allocation}% of parent agent</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Specialization:</span>
                    <span className="text-white">{AGENT_TYPES.find(t => t.type === selectedType)?.name}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelegate}
              disabled={!selectedType}
              className="flex-1 bg-gradient-to-r from-primary to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-primary/90 hover:to-purple-600/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Sub-Agent</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}