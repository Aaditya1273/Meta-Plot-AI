'use client'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1e] to-[#0a0a0f] text-white flex items-center justify-center">
            <div className="text-center px-6">
                <h1 className="text-6xl font-bold mb-6">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                        Meta-Pilot AI
                    </span>
                </h1>
                <p className="text-xl text-gray-400 mb-8">
                    Autonomous DeFi Wealth Management
                </p>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
                <p className="text-sm text-gray-500 mt-4">Loading application...</p>
            </div>
        </div>
    )
}
