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

type Preset = '1h' | '1d' | '7d' | 'custom' | null

function Spinner({ label }: { label?: string }) {
  return (
    <span className="test-time-spinner-wrap" role="status" aria-live="polite">
      <span className="test-time-spinner" aria-hidden />
      {label ? <span className="test-time-spinner-label">{label}</span> : null}
    </span>
  )
}

export function EarnTestTimePanel({ lang, onClose }: Props) {
  const copy = lang === 'zh' ? zh : en
  const addrs = getEarnContractAddresses()

  const [account, setAccount] = useState<Address | null>(null)
  const [offsets, setOffsets] = useState<{ vault: bigint; locker: bigint; distributor: bigint } | null>(
    null
  )
  const [log, setLog] = useState<string>('')
  const [logTone, setLogTone] = useState<'neutral' | 'success' | 'error'>('neutral')
  const [busy, setBusy] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [customSec, setCustomSec] = useState('3600')
  const [activePreset, setActivePreset] = useState<Preset>(null)
  const [statusLine, setStatusLine] = useState<string>('')

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: opbnbTestnet,
        transport: http(opbnbRpcUrl),
      }),
    []
  )

  const refreshOffsets = useCallback(
    async (opts?: { showLoading?: boolean }) => {
      if (opts?.showLoading) setRefreshing(true)
      try {
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
      } finally {
        if (opts?.showLoading) setRefreshing(false)
      }
    },
    [addrs.distributor, addrs.locker, addrs.vault, publicClient]
  )

  const connect = async () => {
    setLog('')
    setLogTone('neutral')
    setStatusLine('')
    const eth = window.ethereum
    if (!eth) {
      setLog(copy.noWallet)
      setLogTone('error')
      return
    }
    setConnecting(true)
    try {
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
          setLogTone('error')
          return
        }
      }

      setStatusLine(copy.waitingWallet)
      const walletClient = createWalletClient({ chain: opbnbTestnet, transport: custom(eth) })
      const [addr] = await walletClient.requestAddresses()
      setAccount(addr)
      setStatusLine('')
      await refreshOffsets()
      setLog(copy.connectedOk)
      setLogTone('success')
    } catch (e: unknown) {
      setLog(e instanceof Error ? e.message : String(e))
      setLogTone('error')
      setStatusLine('')
    } finally {
      setConnecting(false)
    }
  }

  const bumpAll = async (delta: bigint, preset: Preset) => {
    if (delta <= 0n) return
    const eth = window.ethereum
    if (!eth || !account) {
      setLog(copy.connectFirst)
      setLogTone('error')
      return
    }
    setBusy(true)
    setActivePreset(preset)
    setLog('')
    setLogTone('neutral')
    setStatusLine('')

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
      for (let i = 0; i < targets.length; i++) {
        const t = targets[i]
        const step = i + 1
        setStatusLine(copy.txSigning(step, targets.length, t.name))
        const hash = await walletClient.writeContract({
          address: t.address,
          abi: earnTestClockAbi,
          functionName: 'bumpTestTime',
          args: [delta],
        })
        hashes.push(hash)
        setStatusLine(copy.txConfirming(step, targets.length, t.name))
        setLog(`${t.name}: ${hash}`)
        await publicClient.waitForTransactionReceipt({ hash })
      }
      setStatusLine('')
      setLog(copy.done + '\n' + hashes.join('\n'))
      setLogTone('success')
      await refreshOffsets()
    } catch (e: unknown) {
      setStatusLine('')
      setLog(e instanceof Error ? e.message : String(e))
      setLogTone('error')
    } finally {
      setBusy(false)
      setActivePreset(null)
    }
  }

  const fmtSec = (n: bigint) => n.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')

  return (
    <div className="sheet-content test-time-panel">
      <div className="sheet-header-row">
        <h2 className="sheet-title">{copy.title}</h2>
        <button
          type="button"
          className="sheet-close test-time-close"
          onClick={onClose}
          aria-label={copy.close}
        >
          ×
        </button>
      </div>
      <p className="test-time-note">{copy.note}</p>

      {!account ? (
        <button
          type="button"
          className="primary-button full-width test-time-connect"
          disabled={connecting}
          onClick={() => void connect()}
        >
          {connecting ? <Spinner label={copy.connecting} /> : copy.connect}
        </button>
      ) : (
        <div className="test-time-account-row">
          <span className="test-time-account-badge" title={account}>
            {copy.connected} · {account.slice(0, 6)}…{account.slice(-4)}
          </span>
        </div>
      )}

      {offsets && (
        <div className="test-time-offsets">
          <div className="test-time-offsets-title">{copy.offsetsTitle}</div>
          <div className="test-time-offset-row">
            <span>Vault</span>
            <strong>{fmtSec(offsets.vault)}s</strong>
          </div>
          <div className="test-time-offset-row">
            <span>Locker</span>
            <strong>{fmtSec(offsets.locker)}s</strong>
          </div>
          <div className="test-time-offset-row">
            <span>Distributor</span>
            <strong>{fmtSec(offsets.distributor)}s</strong>
          </div>
        </div>
      )}

      {(statusLine || (busy && !statusLine)) && (
        <div className="test-time-status" role="status">
          {busy && !statusLine ? <Spinner /> : null}
          {statusLine ? <span className="test-time-status-text">{statusLine}</span> : null}
        </div>
      )}

      <div className="test-time-actions">
        <button
          type="button"
          className={`test-time-bump-btn ${activePreset === '1h' ? 'is-pending' : ''}`}
          disabled={busy || connecting || !account}
          onClick={() => void bumpAll(HOUR, '1h')}
        >
          +1h
        </button>
        <button
          type="button"
          className={`test-time-bump-btn ${activePreset === '1d' ? 'is-pending' : ''}`}
          disabled={busy || connecting || !account}
          onClick={() => void bumpAll(DAY, '1d')}
        >
          +1d
        </button>
        <button
          type="button"
          className={`test-time-bump-btn ${activePreset === '7d' ? 'is-pending' : ''}`}
          disabled={busy || connecting || !account}
          onClick={() => void bumpAll(7n * DAY, '7d')}
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
          placeholder={copy.secondsPh}
          disabled={busy || connecting}
        />
        <button
          type="button"
          className={`test-time-bump-btn test-time-bump-btn--narrow ${activePreset === 'custom' ? 'is-pending' : ''}`}
          disabled={busy || connecting || !account}
          onClick={() => {
            const n = BigInt(customSec || '0')
            if (n <= 0n) {
              setLog(copy.badSeconds)
              setLogTone('error')
              return
            }
            void bumpAll(n, 'custom')
          }}
        >
          {copy.bump}
        </button>
      </div>

      <button
        type="button"
        className="test-time-refresh"
        onClick={() => void refreshOffsets({ showLoading: true })}
        disabled={busy || connecting || refreshing}
      >
        {refreshing ? <Spinner label={copy.refreshing} /> : copy.refresh}
      </button>

      {log ? (
        <pre
          className={`test-time-log test-time-log--${logTone}`}
          role={logTone === 'error' ? 'alert' : undefined}
        >
          {log}
        </pre>
      ) : null}
    </div>
  )
}

const zh = {
  title: '测试网时间（链上）',
  note:
    '仅在 opBNB Testnet (5611) 有效。会对 Vault、Locker、Distributor 各发一笔 bumpTestTime；任意钱包可调用。本页存款/CPP 仍为本地演示数据。',
  connect: '连接钱包（切换至 5611）',
  connecting: '连接中…',
  connected: '已连接',
  connectedOk: '已连接，可在钱包中查看地址。',
  connectFirst: '请先连接钱包',
  switchChain: '请切换到 opBNB Testnet',
  noWallet: '未检测到钱包（需要 window.ethereum）',
  waitingWallet: '请在钱包中批准连接…',
  txSigning: (i: number, total: number, name: string) =>
    `请在钱包中签名 ${i}/${total} · ${name}`,
  txConfirming: (i: number, total: number, name: string) =>
    `链上确认 ${i}/${total} · ${name}…`,
  bump: '快进',
  refresh: '刷新 offset',
  refreshing: '刷新中…',
  close: '关闭',
  done: '三笔交易已完成',
  badSeconds: '请输入大于 0 的秒数',
  offsetsTitle: '当前虚拟时间偏移（秒）',
  secondsPh: '秒数',
}

const en = {
  title: 'Testnet time (on-chain)',
  note:
    'Only on opBNB Testnet (5611). Sends bumpTestTime to Vault, Locker, and Distributor; any wallet can pay gas. This screen still uses local mock balances.',
  connect: 'Connect wallet (switch to 5611)',
  connecting: 'Connecting…',
  connected: 'Connected',
  connectedOk: 'Connected. Check your wallet for the active address.',
  connectFirst: 'Connect wallet first',
  switchChain: 'Switch to opBNB Testnet',
  noWallet: 'No wallet (window.ethereum)',
  waitingWallet: 'Approve the connection in your wallet…',
  txSigning: (i: number, total: number, name: string) =>
    `Sign in wallet ${i}/${total} · ${name}`,
  txConfirming: (i: number, total: number, name: string) =>
    `Confirming on-chain ${i}/${total} · ${name}…`,
  bump: 'Bump',
  refresh: 'Refresh offsets',
  refreshing: 'Refreshing…',
  close: 'Close',
  done: 'All three txs confirmed',
  badSeconds: 'Enter seconds > 0',
  offsetsTitle: 'Virtual time offset (seconds)',
  secondsPh: 'seconds',
}
