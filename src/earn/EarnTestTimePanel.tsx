import { useCallback, useMemo, useState } from 'react'
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
  type Hash,
} from 'viem'
import { defineChain } from 'viem'
import {
  earnTestClockAbi,
  getEarnContractAddresses,
  OPBNB_TESTNET_CHAIN_ID,
} from './earnTestContracts'

const defaultOpbnbRpc = 'https://opbnb-testnet-rpc.bnbchain.org'
const opbnbRpcUrl =
  (import.meta.env.VITE_OPBNB_TESTNET_RPC as string | undefined)?.trim() || defaultOpbnbRpc

const opbnbTestnet = defineChain({
  id: OPBNB_TESTNET_CHAIN_ID,
  name: 'opBNB Testnet',
  nativeCurrency: { decimals: 18, name: 'tBNB', symbol: 'tBNB' },
  rpcUrls: { default: { http: [opbnbRpcUrl] } },
})

const HOUR = 3600n
const DAY = 86400n

type Props = {
  lang: 'zh' | 'en'
  onClose: () => void
}

export function EarnTestTimePanel({ lang, onClose }: Props) {
  const copy = lang === 'zh' ? zh : en
  const addrs = getEarnContractAddresses()

  const [account, setAccount] = useState<Address | null>(null)
  const [offsets, setOffsets] = useState<{ vault: bigint; locker: bigint; distributor: bigint } | null>(
    null
  )
  const [log, setLog] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [customSec, setCustomSec] = useState('3600')

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: opbnbTestnet,
        transport: http(opbnbRpcUrl),
      }),
    []
  )

  const refreshOffsets = useCallback(async () => {
    const [vault, locker, distributor] = await Promise.all([
      publicClient.readContract({
        address: addrs.vault,
        abi: earnTestClockAbi,
        functionName: 'testTimeOffset',
      }),
      publicClient.readContract({
        address: addrs.locker,
        abi: earnTestClockAbi,
        functionName: 'testTimeOffset',
      }),
      publicClient.readContract({
        address: addrs.distributor,
        abi: earnTestClockAbi,
        functionName: 'testTimeOffset',
      }),
    ])
    setOffsets({ vault, locker, distributor })
  }, [addrs.distributor, addrs.locker, addrs.vault, publicClient])

  const connect = async () => {
    setLog('')
    const eth = window.ethereum
    if (!eth) {
      setLog(copy.noWallet)
      return
    }
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + OPBNB_TESTNET_CHAIN_ID.toString(16) }],
      })
    } catch (e: unknown) {
      const err = e as { code?: number }
      if (err.code === 4902) {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x' + OPBNB_TESTNET_CHAIN_ID.toString(16),
              chainName: 'opBNB Testnet',
              nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
              rpcUrls: [opbnbTestnet.rpcUrls.default.http[0]],
              blockExplorerUrls: ['https://opbnb-testnet.bscscan.com'],
            },
          ],
        })
      } else {
        setLog(copy.switchChain)
        return
      }
    }

    const walletClient = createWalletClient({ chain: opbnbTestnet, transport: custom(eth) })
    const [addr] = await walletClient.requestAddresses()
    setAccount(addr)
    await refreshOffsets()
  }

  const bumpAll = async (delta: bigint) => {
    if (delta <= 0n) return
    const eth = window.ethereum
    if (!eth || !account) {
      setLog(copy.connectFirst)
      return
    }
    setBusy(true)
    setLog('')
    const walletClient = createWalletClient({
      account,
      chain: opbnbTestnet,
      transport: custom(eth),
    })

    const targets: { name: string; address: Address }[] = [
      { name: 'Vault', address: addrs.vault },
      { name: 'Locker', address: addrs.locker },
      { name: 'Distributor', address: addrs.distributor },
    ]

    try {
      const hashes: Hash[] = []
      for (const t of targets) {
        const hash = await walletClient.writeContract({
          address: t.address,
          abi: earnTestClockAbi,
          functionName: 'bumpTestTime',
          args: [delta],
        })
        hashes.push(hash)
        setLog(`${t.name}: ${hash}`)
        await publicClient.waitForTransactionReceipt({ hash })
      }
      setLog(copy.done + '\n' + hashes.join('\n'))
      await refreshOffsets()
    } catch (e: unknown) {
      setLog(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="test-time-panel">
      <div className="sheet-header-row">
        <h2 className="sheet-title">{copy.title}</h2>
        <button type="button" className="sheet-close" onClick={onClose} aria-label={copy.close}>
          ×
        </button>
      </div>
      <p className="test-time-note">{copy.note}</p>

      {!account ? (
        <button type="button" className="primary-button" onClick={() => void connect()}>
          {copy.connect}
        </button>
      ) : (
        <p className="test-time-account">
          {copy.connected} {account.slice(0, 6)}…{account.slice(-4)}
        </p>
      )}

      {offsets && (
        <div className="test-time-offsets">
          <div>
            Vault offset: {offsets.vault.toString()}s
          </div>
          <div>
            Locker offset: {offsets.locker.toString()}s
          </div>
          <div>
            Distributor offset: {offsets.distributor.toString()}s
          </div>
        </div>
      )}

      <div className="test-time-actions">
        <button
          type="button"
          className="secondary-button"
          disabled={busy || !account}
          onClick={() => void bumpAll(HOUR)}
        >
          +1h
        </button>
        <button
          type="button"
          className="secondary-button"
          disabled={busy || !account}
          onClick={() => void bumpAll(DAY)}
        >
          +1d
        </button>
        <button
          type="button"
          className="secondary-button"
          disabled={busy || !account}
          onClick={() => void bumpAll(7n * DAY)}
        >
          +7d
        </button>
      </div>

      <div className="test-time-custom">
        <input
          type="text"
          inputMode="numeric"
          className="test-time-input"
          value={customSec}
          onChange={(e) => setCustomSec(e.target.value.replace(/\D/g, ''))}
          placeholder="seconds"
        />
        <button
          type="button"
          className="mini-btn"
          disabled={busy || !account}
          onClick={() => {
            const n = BigInt(customSec || '0')
            if (n <= 0n) {
              setLog(copy.badSeconds)
              return
            }
            void bumpAll(n)
          }}
        >
          {copy.bump}
        </button>
      </div>

      <button type="button" className="mini-btn secondary" onClick={() => void refreshOffsets()} disabled={busy}>
        {copy.refresh}
      </button>

      {log ? <pre className="test-time-log">{log}</pre> : null}
    </div>
  )
}

const zh = {
  title: '测试网时间（链上）',
  note:
    '仅在 opBNB Testnet (5611) 有效。会对 Vault、Locker、Distributor 各发一笔 bumpTestTime；任意钱包可调用。本页存款/CPP 仍为本地演示数据。',
  connect: '连接钱包（切换至 5611）',
  connected: '已连接',
  connectFirst: '请先连接钱包',
  switchChain: '请切换到 opBNB Testnet',
  noWallet: '未检测到钱包（需要 window.ethereum）',
  bump: '快进',
  refresh: '刷新 offset',
  close: '关闭',
  done: '三笔交易已完成',
  badSeconds: '请输入大于 0 的秒数',
}

const en = {
  title: 'Testnet time (on-chain)',
  note:
    'Only on opBNB Testnet (5611). Sends bumpTestTime to Vault, Locker, and Distributor; any wallet can pay gas. This screen still uses local mock balances.',
  connect: 'Connect wallet (switch to 5611)',
  connected: 'Connected',
  connectFirst: 'Connect wallet first',
  switchChain: 'Switch to opBNB Testnet',
  noWallet: 'No wallet (window.ethereum)',
  bump: 'Bump',
  refresh: 'Refresh offsets',
  close: 'Close',
  done: 'All three txs confirmed',
  badSeconds: 'Enter seconds > 0',
}
