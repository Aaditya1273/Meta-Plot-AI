'use client'

import { useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
    Sparkles, Bot, Zap, Shield, TrendingUp, ArrowRight,
    Star, DollarSign, Clock, Lock,
    Cpu, Network, BarChart3, Rocket, ChevronDown
} from 'lucide-react'
import dynamic from 'next/dynamic'
import ConnectWallet from '@/components/ConnectWallet'

// Dynamically import heavy components
const Background3D = dynamic(() => import('@/components/3D/Background3D'), { ssr: false })
const ChatInterface = dynamic(() => import('@/components/ChatInterface'), { ssr: false })

export default function LandingPage() {
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [isWalletConnected, setIsWalletConnected] = useState(false)
    const { scrollYProgress } = useScroll()
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1e] to-[#0a0a0f] text-white overflow-x-hidden">
            <Background3D />

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/5">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center space-x-3"
                        >
                            <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-xl glow">
                                <Bot className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold font-space-grotesk">Meta-Pilot AI</span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center space-x-6"
                        >
                            <a href="#features" className="hidden md:block text-gray-300 hover:text-white transition-colors">Features</a>
                            <a href="#how-it-works" className="hidden md:block text-gray-300 hover:text-white transition-colors">How It Works</a>
                            <a href="#stats" className="hidden md:block text-gray-300 hover:text-white transition-colors">Impact</a>
                            <ConnectWallet onConnect={() => setIsWalletConnected(true)} />
                        </motion.div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <motion.section
                style={{ opacity, scale }}
                className="relative min-h-screen flex items-center justify-center pt-20 px-6"
            >
                <div className="container mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm text-primary font-medium">Powered by ERC-7715 & Envio</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 font-space-grotesk"
                    >
                        <span className="gradient-text glow-text">Autonomous DeFi</span>
                        <br />
                        <span className="text-white">Wealth Management</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
                    >
                        Describe your DeFi strategy in plain English. Grant permission once.
                        Let AI agents execute optimal trades autonomously.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                    >
                        <button
                            onClick={() => setIsChatOpen(true)}
                            disabled={!isWalletConnected}
                            className="group relative px-8 py-4 bg-gradient-to-r from-primary via-purple-600 to-pink-600 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 animate-gradient"
                        >
                            <span className="flex items-center space-x-2">
                                <Rocket className="h-5 w-5" />
                                <span>Start Your AI Pilot</span>
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>

                        <a
                            href="#how-it-works"
                            className="px-8 py-4 glass-card-hover rounded-xl font-semibold text-lg flex items-center space-x-2"
                        >
                            <span>See How It Works</span>
                            <ChevronDown className="h-5 w-5" />
                        </a>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
                    >
                        {[
                            { label: 'Gas Saved', value: '50-70%', icon: Zap },
                            { label: 'Signatures', value: '90% Less', icon: Lock },
                            { label: 'Time Saved', value: '2+ hrs/week', icon: Clock },
                            { label: 'Missed Ops', value: 'Near Zero', icon: TrendingUp },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card p-6 text-center">
                                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <div className="animate-bounce">
                        <ChevronDown className="h-8 w-8 text-primary" />
                    </div>
                </motion.div>
            </motion.section>

            {/* Features Section */}
            <section id="features" className="py-32 px-6">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 font-space-grotesk">
                            <span className="gradient-text">Revolutionary Features</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Built on cutting-edge blockchain technology for the future of DeFi
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Bot,
                                title: 'Natural Language Intents',
                                description: 'Describe your strategy in plain English. No complex interfaces or technical jargon required.',
                                color: 'from-blue-500 to-cyan-500',
                            },
                            {
                                icon: Shield,
                                title: 'ERC-7715 Permissions',
                                description: 'Scoped, time-bound, and revocable permissions. You maintain full control at all times.',
                                color: 'from-purple-500 to-pink-500',
                            },
                            {
                                icon: Zap,
                                title: 'Gas Optimization',
                                description: 'AI agents execute only when gas prices are optimal, saving you 50-70% on transaction costs.',
                                color: 'from-amber-500 to-orange-500',
                            },
                            {
                                icon: TrendingUp,
                                title: 'Yield Hunting',
                                description: 'Automatically find and invest in the highest APY opportunities across DeFi protocols.',
                                color: 'from-green-500 to-emerald-500',
                            },
                            {
                                icon: Network,
                                title: 'A2A Delegation',
                                description: 'Create specialized sub-agents for gas optimization, yield hunting, and risk management.',
                                color: 'from-indigo-500 to-purple-500',
                            },
                            {
                                icon: BarChart3,
                                title: 'Real-time Analytics',
                                description: 'Powered by Envio HyperSync for sub-second dashboard updates and portfolio tracking.',
                                color: 'from-pink-500 to-rose-500',
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="glass-card-hover p-8 group"
                            >
                                <div className={`inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 font-space-grotesk">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-32 px-6 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 font-space-grotesk">
                            <span className="gradient-text">How It Works</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            From intent to execution in four simple steps
                        </p>
                    </motion.div>

                    <div className="max-w-4xl mx-auto space-y-12">
                        {[
                            {
                                step: '01',
                                title: 'Describe Your Strategy',
                                description: 'Tell Meta-Pilot what you want in natural language. For example: "Keep $100 USDC safe, invest extra in best Aave yield weekly when gas is under 25 gwei"',
                                icon: Bot,
                            },
                            {
                                step: '02',
                                title: 'AI Analysis',
                                description: 'Gemini AI parses your intent, analyzes market conditions, assesses risks, and suggests optimizations for your strategy.',
                                icon: Cpu,
                            },
                            {
                                step: '03',
                                title: 'Grant Permission',
                                description: 'Approve one-time ERC-7715 permission via MetaMask. Scoped to specific protocols, amounts, and time periods.',
                                icon: Shield,
                            },
                            {
                                step: '04',
                                title: 'Autonomous Execution',
                                description: 'AI agents monitor conditions 24/7 and execute trades automatically when optimal. Track everything in real-time.',
                                icon: Rocket,
                            },
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="glass-card p-8 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 text-9xl font-bold text-primary/5 font-space-grotesk">
                                    {step.step}
                                </div>
                                <div className="relative z-10 flex items-start space-x-6">
                                    <div className="flex-shrink-0">
                                        <div className="p-4 bg-gradient-to-br from-primary to-purple-600 rounded-2xl glow">
                                            <step.icon className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm text-primary font-semibold mb-2">STEP {step.step}</div>
                                        <h3 className="text-2xl font-bold mb-4 font-space-grotesk">{step.title}</h3>
                                        <p className="text-gray-400 leading-relaxed">{step.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section id="stats" className="py-32 px-6">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass-card p-12 md:p-16 text-center"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-12 font-space-grotesk">
                            <span className="gradient-text">Transforming DeFi Experience</span>
                        </h2>

                        <div className="grid md:grid-cols-3 gap-12">
                            {[
                                { value: '1', label: 'Signature per Week', sublabel: 'vs 5-10 before', icon: Lock },
                                { value: '30-50%', label: 'Gas Costs', sublabel: 'vs 100% before', icon: DollarSign },
                                { value: '0 min', label: 'Monitoring Time', sublabel: 'vs 2+ hours before', icon: Clock },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="text-center"
                                >
                                    <stat.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                                    <div className="text-5xl md:text-6xl font-bold gradient-text mb-2">{stat.value}</div>
                                    <div className="text-xl font-semibold text-white mb-1">{stat.label}</div>
                                    <div className="text-sm text-gray-400">{stat.sublabel}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass-card p-12 md:p-16 text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-600/20 to-pink-600/20 animate-gradient" />

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-bold mb-6 font-space-grotesk">
                                Ready to Transform Your <span className="gradient-text">DeFi Experience?</span>
                            </h2>
                            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                                Join the future of autonomous wealth management. Connect your wallet and start your AI pilot today.
                            </p>

                            <button
                                onClick={() => setIsChatOpen(true)}
                                disabled={!isWalletConnected}
                                className="group px-10 py-5 bg-gradient-to-r from-primary via-purple-600 to-pink-600 rounded-xl font-bold text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed animate-gradient"
                            >
                                <span className="flex items-center space-x-3">
                                    <Sparkles className="h-6 w-6" />
                                    <span>Launch Meta-Pilot AI</span>
                                    <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                </span>
                            </button>

                            {!isWalletConnected && (
                                <p className="mt-6 text-sm text-gray-400">
                                    Connect your wallet to get started
                                </p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/10">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-3 mb-6 md:mb-0">
                            <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-xl">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold font-space-grotesk">Meta-Pilot AI</span>
                        </div>

                        <div className="flex items-center space-x-8 text-sm text-gray-400">
                            <a href="#" className="hover:text-white transition-colors">Documentation</a>
                            <a href="#" className="hover:text-white transition-colors">GitHub</a>
                            <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-gray-500">
                        <p>Built with ❤️ for the MetaMask Developer Hackathon</p>
                        <p className="mt-2">Powered by ERC-7715, Envio, and Gemini AI</p>
                    </div>
                </div>
            </footer>

            {/* Chat Interface */}
            {isChatOpen && <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
        </div>
    )
}
