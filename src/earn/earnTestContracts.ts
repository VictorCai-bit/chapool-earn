import type { Address } from 'viem'

/** Matches ChapoolEarnVault / VeCPOTLocker / ChapoolRewardDistributor test clock API. */
export const earnTestClockAbi = [
  {
    type: 'function',
    name: 'testTimeOffset',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
  },
  {
    type: 'function',
    name: 'bumpTestTime',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'delta', type: 'uint256' }],
    outputs: [],
  },
] as const

/** opBNB Testnet — bumpTestTime is only allowed on this chain (and local dev chains in contracts). */
export const OPBNB_TESTNET_CHAIN_ID = 5611

const DEFAULT_VAULT = '0xe57E96e423306847990877b8334BDB711efdfD10' as Address
const DEFAULT_LOCKER = '0xfF226A6D5A8F3Ff5E621cD9C1564310beC65509f' as Address
const DEFAULT_DISTRIBUTOR = '0x385D801f556e676bd22e40B8bd1388C46833EC3a' as Address

export function getEarnContractAddresses(): {
  vault: Address
  locker: Address
  distributor: Address
} {
  const env = import.meta.env
  return {
    vault: (env.VITE_EARN_VAULT as Address) || DEFAULT_VAULT,
    locker: (env.VITE_EARN_LOCKER as Address) || DEFAULT_LOCKER,
    distributor: (env.VITE_EARN_DISTRIBUTOR as Address) || DEFAULT_DISTRIBUTOR,
  }
}
