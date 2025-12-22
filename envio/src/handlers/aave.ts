import {
  AaveV3Pool_Supply_handler,
  AaveV3Pool_Withdraw_handler,
} from "../../generated/src/Handlers.gen";

import {
  User,
  Transaction,
  YieldEvent,
  DailyStats,
  TransactionType,
  TransactionStatus,
} from "../../generated/src/Types.gen";

// Handle Aave Supply events (deposits)
AaveV3Pool_Supply_handler(async ({ event, context }) => {
  const { reserve, user, onBehalfOf, amount, referralCode } = event.params;
  const { blockNumber, blockTimestamp, transactionHash } = event;

  // Get or create user
  let userEntity = await context.User.get(user.toLowerCase());
  if (!userEntity) {
    userEntity = {
      id: user.toLowerCase(),
      address: user.toLowerCase(),
      totalInvested: 0n,
      totalYieldEarned: 0n,
      activeStrategies: 0,
      createdAt: blockTimestamp,
      updatedAt: blockTimestamp,
    };
  } else {
    userEntity.updatedAt = blockTimestamp;
  }

  // Update user stats
  userEntity.totalInvested = userEntity.totalInvested + amount;
  await context.User.set(userEntity);

  // Create transaction record
  const transaction: Transaction = {
    id: `${transactionHash}-${event.logIndex}`,
    hash: transactionHash,
    user_id: user.toLowerCase(),
    type: TransactionType.DEPOSIT,
    amount: amount,
    asset: getAssetSymbol(reserve),
    protocol: "aave",
    gasUsed: 0n, // Will be updated from transaction receipt
    gasPrice: 0n,
    blockNumber: blockNumber,
    timestamp: blockTimestamp,
    status: TransactionStatus.SUCCESS,
  };

  await context.Transaction.set(transaction);

  // Create yield event
  const yieldEvent: YieldEvent = {
    id: `yield-${transactionHash}-${event.logIndex}`,
    user_id: user.toLowerCase(),
    transaction_id: transaction.id,
    protocol: "aave",
    asset: getAssetSymbol(reserve),
    amount: amount,
    apy: await getAaveAPY(reserve), // Helper function to get current APY
    yieldEarned: 0n, // Initial deposit, no yield yet
    timestamp: blockTimestamp,
    blockNumber: blockNumber,
  };

  await context.YieldEvent.set(yieldEvent);

  // Update daily stats
  await updateDailyStats(context, blockTimestamp, amount, "aave");
});

// Handle Aave Withdraw events
AaveV3Pool_Withdraw_handler(async ({ event, context }) => {
  const { reserve, user, to, amount } = event.params;
  const { blockNumber, blockTimestamp, transactionHash } = event;

  // Get user
  let userEntity = await context.User.get(user.toLowerCase());
  if (userEntity) {
    userEntity.updatedAt = blockTimestamp;
    await context.User.set(userEntity);
  }

  // Create transaction record
  const transaction: Transaction = {
    id: `${transactionHash}-${event.logIndex}`,
    hash: transactionHash,
    user_id: user.toLowerCase(),
    type: TransactionType.WITHDRAW,
    amount: amount,
    asset: getAssetSymbol(reserve),
    protocol: "aave",
    gasUsed: 0n,
    gasPrice: 0n,
    blockNumber: blockNumber,
    timestamp: blockTimestamp,
    status: TransactionStatus.SUCCESS,
  };

  await context.Transaction.set(transaction);

  // Calculate yield earned (simplified)
  const yieldEarned = await calculateYieldEarned(context, user.toLowerCase(), reserve, amount);

  // Create yield event for withdrawal
  const yieldEvent: YieldEvent = {
    id: `yield-${transactionHash}-${event.logIndex}`,
    user_id: user.toLowerCase(),
    transaction_id: transaction.id,
    protocol: "aave",
    asset: getAssetSymbol(reserve),
    amount: amount,
    apy: await getAaveAPY(reserve),
    yieldEarned: yieldEarned,
    timestamp: blockTimestamp,
    blockNumber: blockNumber,
  };

  await context.YieldEvent.set(yieldEvent);

  // Update user yield stats
  if (userEntity) {
    userEntity.totalYieldEarned = userEntity.totalYieldEarned + yieldEarned;
    await context.User.set(userEntity);
  }
});

// Helper functions
function getAssetSymbol(address: string): string {
  const assetMap: { [key: string]: string } = {
    "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8": "USDC",
    "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14": "WETH",
    // Add more asset mappings
  };
  
  return assetMap[address.toLowerCase()] || "UNKNOWN";
}

async function getAaveAPY(reserve: string): Promise<bigint> {
  // In a real implementation, this would query Aave's data provider
  // For demo, return mock APY (4.2% = 420 basis points)
  return 420n;
}

async function calculateYieldEarned(
  context: any,
  userAddress: string,
  reserve: string,
  withdrawAmount: bigint
): Promise<bigint> {
  // Simplified yield calculation
  // In reality, this would track deposit/withdraw history and calculate actual yield
  const estimatedYield = withdrawAmount / 100n; // 1% yield estimate
  return estimatedYield;
}

async function updateDailyStats(
  context: any,
  timestamp: bigint,
  amount: bigint,
  protocol: string
) {
  const date = new Date(Number(timestamp) * 1000).toISOString().split('T')[0];
  const statsId = date;

  let dailyStats = await context.DailyStats.get(statsId);
  if (!dailyStats) {
    dailyStats = {
      id: statsId,
      date: date,
      totalUsers: 0,
      totalTransactions: 0,
      totalVolume: 0n,
      totalYieldEarned: 0n,
      avgGasPrice: 0n,
      topProtocol: protocol,
    };
  }

  dailyStats.totalTransactions += 1;
  dailyStats.totalVolume = dailyStats.totalVolume + amount;
  
  await context.DailyStats.set(dailyStats);
}