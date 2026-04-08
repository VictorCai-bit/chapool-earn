import type { PublicClient } from 'viem'
import type { Address } from 'viem'
import { formatEther } from 'viem'

const vaultAbi = [
  { type: 'function', name: 'PRECISION', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'BPS_DENOMINATOR', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'EMERGENCY_TIMELOCK', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'rewardRate', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'totalWeightedUSDT', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'paused', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'emergencyMode', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
] as const

const lockerAbi = [
  { type: 'function', name: 'boostPerVeUnit', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'maxVecpotBoostBps', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'DURATION_30', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'DURATION_90', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'DURATION_180', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'DURATION_360', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'BOOST_VE_PRECISION', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'MAX_LOCK_POSITIONS', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'effectiveNow', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const

export type EarnChainSnapshot = {
  vault: {
    precision: bigint
    bpsDenominator: bigint
    emergencyTimelock: bigint
    rewardRate: bigint
    totalWeightedUSDT: bigint
    paused: boolean
    emergencyMode: boolean
  }
  locker: {
    boostPerVeUnit: bigint
    maxVecpotBoostBps: bigint
    d30: bigint
    d90: bigint
    d180: bigint
    d360: bigint
    boostVePrecision: bigint
    maxLockPositions: bigint
    effectiveNow: bigint
  }
}

async function readVault(
  client: PublicClient,
  vault: Address
): Promise<EarnChainSnapshot['vault'] | null> {
  try {
    const [
      precision,
      bpsDenominator,
      emergencyTimelock,
      rewardRate,
      totalWeightedUSDT,
      paused,
      emergencyMode,
    ] = await Promise.all([
      client.readContract({ address: vault, abi: vaultAbi, functionName: 'PRECISION' }),
      client.readContract({ address: vault, abi: vaultAbi, functionName: 'BPS_DENOMINATOR' }),
      client.readContract({ address: vault, abi: vaultAbi, functionName: 'EMERGENCY_TIMELOCK' }),
      client.readContract({ address: vault, abi: vaultAbi, functionName: 'rewardRate' }),
      client.readContract({ address: vault, abi: vaultAbi, functionName: 'totalWeightedUSDT' }),
      client.readContract({ address: vault, abi: vaultAbi, functionName: 'paused' }),
      client.readContract({ address: vault, abi: vaultAbi, functionName: 'emergencyMode' }),
    ])
    return {
      precision,
      bpsDenominator,
      emergencyTimelock,
      rewardRate,
      totalWeightedUSDT,
      paused,
      emergencyMode,
    }
  } catch {
    return null
  }
}

async function readLocker(
  client: PublicClient,
  locker: Address
): Promise<EarnChainSnapshot['locker'] | null> {
  try {
    const [
      boostPerVeUnit,
      maxVecpotBoostBps,
      d30,
      d90,
      d180,
      d360,
      boostVePrecision,
      maxLockPositions,
      effectiveNow,
    ] = await Promise.all([
      client.readContract({ address: locker, abi: lockerAbi, functionName: 'boostPerVeUnit' }),
      client.readContract({ address: locker, abi: lockerAbi, functionName: 'maxVecpotBoostBps' }),
      client.readContract({ address: locker, abi: lockerAbi, functionName: 'DURATION_30' }),
      client.readContract({ address: locker, abi: lockerAbi, functionName: 'DURATION_90' }),
      client.readContract({ address: locker, abi: lockerAbi, functionName: 'DURATION_180' }),
      client.readContract({ address: locker, abi: lockerAbi, functionName: 'DURATION_360' }),
      client.readContract({ address: locker, abi: lockerAbi, functionName: 'BOOST_VE_PRECISION' }),
      client.readContract({ address: locker, abi: lockerAbi, functionName: 'MAX_LOCK_POSITIONS' }),
      client.readContract({ address: locker, abi: lockerAbi, functionName: 'effectiveNow' }),
    ])
    return {
      boostPerVeUnit,
      maxVecpotBoostBps,
      d30,
      d90,
      d180,
      d360,
      boostVePrecision,
      maxLockPositions,
      effectiveNow,
    }
  } catch {
    return null
  }
}

export async function fetchEarnChainSnapshot(
  client: PublicClient,
  vault: Address,
  locker: Address
): Promise<EarnChainSnapshot | null> {
  const [v, l] = await Promise.all([readVault(client, vault), readLocker(client, locker)])
  if (!v || !l) return null
  return { vault: v, locker: l }
}

export function formatRewardRateWei(wei: bigint): string {
  return formatEther(wei)
}
