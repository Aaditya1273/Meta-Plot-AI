import { GoogleGenerativeAI } from '@google/generative-ai'
import { IntentParams } from '../permissions'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export interface AdvancedIntentParams extends IntentParams {
  confidence: number
  riskLevel: 'low' | 'medium' | 'high'
  complexity: 'simple' | 'moderate' | 'complex'
  suggestedOptimizations: string[]
  marketContext: {
    sentiment: 'bullish' | 'bearish' | 'neutral'
    volatility: 'low' | 'medium' | 'high'
    recommendation: string
  }
}

export class AdvancedIntentAnalyzer {
  private static readonly SYSTEM_PROMPT = `
You are Meta-Pilot AI, an expert DeFi strategy analyzer. Parse user intents into structured parameters and provide intelligent recommendations.

PROTOCOLS SUPPORTED:
- Aave (lending/borrowing)
- Compound (lending)
- Uniswap (swapping/LP)
- Curve (stable swaps)

ASSETS SUPPORTED:
- USDC, USDT, DAI (stablecoins)
- ETH, WETH (ethereum)
- WBTC (bitcoin)

ACTIONS:
- invest/yield: Deposit into lending protocols
- swap: Exchange tokens
- dca: Dollar cost averaging
- lp: Provide liquidity

Respond with JSON only, no explanations.
`

  private static readonly USER_PROMPT_TEMPLATE = `
Parse this DeFi intent: "{intent}"

Return JSON with this exact structure:
{
  "amount": number,
  "asset": "USDC|ETH|DAI|USDT|WBTC",
  "protocol": "aave|compound|uniswap|curve",
  "frequency": "hourly|daily|weekly|monthly",
  "gasLimit": number,
  "minYield": number,
  "action": "invest|swap|dca|yield",
  "confidence": number (0-100),
  "riskLevel": "low|medium|high",
  "complexity": "simple|moderate|complex",
  "suggestedOptimizations": ["optimization1", "optimization2"],
  "marketContext": {
    "sentiment": "bullish|bearish|neutral",
    "volatility": "low|medium|high",
    "recommendation": "brief recommendation"
  }
}

Consider:
- Gas efficiency (lower gas limits for frequent operations)
- Market conditions (adjust timing based on volatility)
- Risk management (suggest diversification for large amounts)
- Yield optimization (recommend highest APY protocols)
`

  static async analyzeIntent(userIntent: string): Promise<AdvancedIntentParams> {
    try {
      // First try AI analysis with Gemini
      const aiResult = await this.analyzeWithGemini(userIntent)
      if (aiResult) {
        return aiResult
      }
    } catch (error) {
      console.warn('Gemini AI analysis failed, falling back to rule-based parsing:', error)
    }

    // Fallback to enhanced rule-based parsing
    return this.analyzeWithRules(userIntent)
  }

  private static async analyzeWithGemini(userIntent: string): Promise<AdvancedIntentParams | null> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      
      const prompt = `${this.SYSTEM_PROMPT}\n\n${this.USER_PROMPT_TEMPLATE.replace('{intent}', userIntent)}`
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      if (!text) throw new Error('No response from Gemini AI')

      // Extract JSON from response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')

      const parsed = JSON.parse(jsonMatch[0]) as AdvancedIntentParams
      
      // Validate the response
      if (!this.validateIntentParams(parsed)) {
        throw new Error('Invalid AI response structure')
      }

      return parsed
    } catch (error) {
      console.error('Gemini AI parsing error:', error)
      return null
    }
  }

  private static analyzeWithRules(userIntent: string): AdvancedIntentParams {
    const text = userIntent.toLowerCase()
    
    // Enhanced pattern matching
    const patterns = {
      amount: /\$?(\d+(?:,\d{3})*(?:\.\d+)?)\s*(k|thousand|m|million)?\s*(usdc|eth|dai|usdt|wbtc)/i,
      protocol: /(aave|compound|uniswap|curve|uni|comp)/i,
      frequency: /(every\s+)?(hourly|daily|weekly|monthly|hour|day|week|month)/i,
      gas: /gas.*?(?:under|below|<|less\s+than)\s*(\d+)\s*gwei/i,
      yield: /(?:yield|apy|return).*?(?:above|over|>|more\s+than)\s*(\d+(?:\.\d+)?)%/i,
      action: /(invest|deposit|lend|swap|trade|exchange|dca|dollar.cost|liquidity|lp)/i,
      reserve: /(?:keep|reserve|save|hold)\s*\$?(\d+(?:\.\d+)?)/i,
      risk: /(safe|conservative|aggressive|risky|high.risk|low.risk)/i,
      timing: /(immediately|asap|when\s+gas|during\s+dip|bull\s+market|bear\s+market)/i
    }

    // Extract base parameters
    const amountMatch = text.match(patterns.amount)
    const protocolMatch = text.match(patterns.protocol)
    const frequencyMatch = text.match(patterns.frequency)
    const gasMatch = text.match(patterns.gas)
    const yieldMatch = text.match(patterns.yield)
    const actionMatch = text.match(patterns.action)
    const riskMatch = text.match(patterns.risk)

    // Parse amount with multipliers
    let amount = 100
    if (amountMatch) {
      const baseAmount = parseFloat(amountMatch[1].replace(/,/g, ''))
      const multiplier = amountMatch[2]?.toLowerCase()
      
      if (multiplier === 'k' || multiplier === 'thousand') {
        amount = baseAmount * 1000
      } else if (multiplier === 'm' || multiplier === 'million') {
        amount = baseAmount * 1000000
      } else {
        amount = baseAmount
      }
    }

    // Determine action type with better logic
    let action: IntentParams['action'] = 'invest'
    if (actionMatch) {
      const actionText = actionMatch[1]
      if (['swap', 'trade', 'exchange'].includes(actionText)) action = 'swap'
      else if (['dca', 'dollar'].includes(actionText)) action = 'dca'
      else if (['invest', 'deposit', 'lend'].includes(actionText)) action = 'yield'
    }

    // Risk assessment
    let riskLevel: 'low' | 'medium' | 'high' = 'medium'
    if (riskMatch) {
      const riskText = riskMatch[1]
      if (['safe', 'conservative', 'low'].some(r => riskText.includes(r))) {
        riskLevel = 'low'
      } else if (['aggressive', 'risky', 'high'].some(r => riskText.includes(r))) {
        riskLevel = 'high'
      }
    }

    // Complexity assessment
    const complexity = this.assessComplexity(text, amount, action)
    
    // Generate optimizations
    const suggestedOptimizations = this.generateOptimizations(amount, action, riskLevel)
    
    // Market context (simplified)
    const marketContext = this.getMarketContext(action, amount)

    return {
      amount,
      asset: amountMatch ? amountMatch[3].toUpperCase() as any : 'USDC',
      protocol: protocolMatch ? this.normalizeProtocol(protocolMatch[1]) : 'aave',
      frequency: frequencyMatch ? this.normalizeFrequency(frequencyMatch[2] || frequencyMatch[1]) : 'weekly',
      gasLimit: gasMatch ? parseInt(gasMatch[1]) : this.getOptimalGasLimit(action),
      minYield: yieldMatch ? parseFloat(yieldMatch[1]) : this.getMinYieldForRisk(riskLevel),
      action,
      confidence: this.calculateConfidence(userIntent, amountMatch, protocolMatch, actionMatch),
      riskLevel,
      complexity,
      suggestedOptimizations,
      marketContext
    }
  }

  private static normalizeProtocol(protocol: string): string {
    const protocolMap: { [key: string]: string } = {
      'uni': 'uniswap',
      'comp': 'compound'
    }
    return protocolMap[protocol.toLowerCase()] || protocol.toLowerCase()
  }

  private static normalizeFrequency(frequency: string): string {
    const freqMap: { [key: string]: string } = {
      'hour': 'hourly',
      'day': 'daily',
      'week': 'weekly',
      'month': 'monthly'
    }
    return freqMap[frequency.toLowerCase()] || frequency.toLowerCase()
  }

  private static assessComplexity(text: string, amount: number, action: string): 'simple' | 'moderate' | 'complex' {
    let complexityScore = 0
    
    // Amount complexity
    if (amount > 10000) complexityScore += 1
    if (amount > 100000) complexityScore += 2
    
    // Action complexity
    if (['swap', 'dca'].includes(action)) complexityScore += 1
    
    // Conditional complexity
    if (text.includes('when') || text.includes('if')) complexityScore += 1
    if (text.includes('and') || text.includes('also')) complexityScore += 1
    
    // Multiple protocols/assets
    const protocolCount = (text.match(/(aave|compound|uniswap|curve)/g) || []).length
    const assetCount = (text.match(/(usdc|eth|dai|usdt|wbtc)/g) || []).length
    complexityScore += Math.max(protocolCount - 1, 0) + Math.max(assetCount - 1, 0)
    
    if (complexityScore <= 1) return 'simple'
    if (complexityScore <= 3) return 'moderate'
    return 'complex'
  }

  private static generateOptimizations(amount: number, action: string, riskLevel: string): string[] {
    const optimizations: string[] = []
    
    if (amount > 50000) {
      optimizations.push('Consider splitting into smaller batches to reduce slippage')
    }
    
    if (action === 'yield' && riskLevel === 'low') {
      optimizations.push('Diversify across multiple stable protocols for better risk distribution')
    }
    
    if (action === 'swap') {
      optimizations.push('Use limit orders during high volatility periods')
    }
    
    optimizations.push('Enable gas optimization for 30-50% savings')
    optimizations.push('Set up yield compounding for maximum returns')
    
    return optimizations
  }

  private static getMarketContext(action: string, amount: number) {
    // Simplified market context - in production, integrate with real market data
    return {
      sentiment: 'neutral' as const,
      volatility: amount > 100000 ? 'high' as const : 'medium' as const,
      recommendation: `Consider ${action === 'yield' ? 'stablecoin strategies' : 'DCA approach'} in current market conditions`
    }
  }

  private static getOptimalGasLimit(action: string): number {
    const gasLimits = {
      'invest': 25,
      'yield': 25,
      'swap': 30,
      'dca': 20
    }
    return gasLimits[action as keyof typeof gasLimits] || 25
  }

  private static getMinYieldForRisk(riskLevel: string): number {
    const yieldTargets = {
      'low': 2.5,
      'medium': 4.0,
      'high': 6.0
    }
    return yieldTargets[riskLevel as keyof typeof yieldTargets] || 4.0
  }

  private static calculateConfidence(
    intent: string, 
    amountMatch: RegExpMatchArray | null,
    protocolMatch: RegExpMatchArray | null,
    actionMatch: RegExpMatchArray | null
  ): number {
    let confidence = 60 // Base confidence
    
    if (amountMatch) confidence += 15
    if (protocolMatch) confidence += 15
    if (actionMatch) confidence += 10
    
    // Penalize very short or very long intents
    if (intent.length < 20) confidence -= 10
    if (intent.length > 200) confidence -= 5
    
    return Math.min(100, Math.max(0, confidence))
  }

  private static validateIntentParams(params: any): boolean {
    const required = ['amount', 'asset', 'protocol', 'frequency', 'gasLimit', 'minYield', 'action']
    return required.every(field => params[field] !== undefined)
  }
}