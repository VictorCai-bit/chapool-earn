import { useCallback, useMemo, useState } from 'react'
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
  type Hash,
} from 'viem'
import { defineChain, formatEther } from 'viem'
import { fetchEarnChainSnapshot, formatRewardRateWei, type EarnChainSnapshot } from './earnDevReads'
import {
  earnTestClockAbi,
  getEarnContractAddresses,
  OPBNB_TESTNET_CHAIN_ID,
} from './earnTestContracts'
import {
  getSpecCopy,
  NFT_BOOST_SPEC_ROWS,
  SECONDS_WEEK,
  SPEC_DOC,
} from './earnSpecReference'

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

type Preset =
  | '1h'
  | '1d'
  | '7d'
  | 'custom'
  | 'emergency'
  | 'weekSample'
  | null

const EXPLORER_BASE = 'https://opbnb-testnet.bscscan.com/address/'

function Spinner({ label }: { label?: string }) {
  return (
    <span className="test-time-spinner-wrap" role="status" aria-live="polite">
      <span className="test-time-spinner" aria-hidden />
      {label ? <span className="test-time-spinner-label">{label}</span> : null}
    </span>
  )
}

function AddressRow({
  label,
  addr,
  spec,
}: {
  label: string
  addr: Address
  spec: ReturnType<typeof getSpecCopy>
}) {
  const [copied, setCopied] = useState(false)
  const short = `${addr.slice(0, 6)}…${addr.slice(-4)}`
  return (
    <div className="test-time-addr-row">
      <span className="test-time-addr-label">{label}</span>
      <code className="test-time-addr-code" title={addr}>
        {short}
      </code>
      <div className="test-time-addr-actions">
        <a
          className="test-time-link"
          href={`${EXPLORER_BASE}${addr}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {spec.explorer}
        </a>
        <button
          type="button"
          className="test-time-link test-time-link--btn"
          onClick={() => {
            void navigator.clipboard.writeText(addr).then(() => {
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1600)
            })
          }}
        >
          {copied ? spec.copied : spec.copyAddr}
        </button>
      </div>
    </div>
  )
}

export function EarnTestTimePanel({ lang, onClose }: Props) {
  const copy = lang === 'zh' ? zh : en
  const spec = getSpecCopy(lang)
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
  const [chainSnap, setChainSnap] = useState<EarnChainSnapshot | null>(null)
  const [chainLoading, setChainLoading] = useState(false)
  const [chainError, setChainError] = useState<string | null>(null)

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

  const loadChainSnapshot = useCallback(async () => {
    setChainLoading(true)
    setChainError(null)
    try {
      const snap = await fetchEarnChainSnapshot(publicClient, addrs.vault, addrs.locker)
      if (!snap) {
        setChainSnap(null)
        setChainError(
          lang === 'zh'
            ? '无法读取 Vault/Locker（检查 RPC、合约地址与网络）'
            : 'Could not read Vault/Locker (check RPC, addresses, network).'
        )
      } else {
        setChainSnap(snap)
      }
    } finally {
      setChainLoading(false)
    }
  }, [addrs.locker, addrs.vault, lang, publicClient])

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

  const emergencyDelta = chainSnap?.vault.emergencyTimelock ?? 86400n

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

      <details className="test-time-details">
        <summary className="test-time-details-summary">{spec.sectionTitle}</summary>
        <p className="test-time-spec-hint">
          <code>{SPEC_DOC}</code> — {spec.docHint}
        </p>

        <div className="test-time-spec-block">
          <div className="test-time-spec-label">{spec.formulasTitle}</div>
          <pre className="test-time-spec-pre">
            {spec.formulaLines.join('\n')}
          </pre>
        </div>
        <ul className="test-time-spec-list">
          <li>
            <strong>{spec.cppRefTitle}</strong> — {spec.cppRefLine}
          </li>
          <li>
            <strong>{spec.rateInjectTitle}</strong> — {spec.rateInjectLine}
          </li>
          <li>
            <strong>{spec.lockTitle}</strong> — {spec.lockLine}
          </li>
          <li>
            <strong>{spec.durationsTitle}</strong> — {spec.durations}
          </li>
          <li>
            <strong>{spec.veTitle}</strong> — {spec.veLine}
          </li>
          <li>
            <strong>{spec.boostTitle}</strong> — {spec.boostLine}
          </li>
          <li>
            <strong>{spec.testClockTitle}</strong> — {spec.testClockLine}
          </li>
        </ul>

        <div className="test-time-spec-block">
          <div className="test-time-spec-label">{spec.nftTitle}</div>
          <p className="test-time-spec-muted">{spec.nftNote}</p>
          <table className="test-time-spec-table">
            <thead>
              <tr>
                <th>NFT</th>
                <th>bps</th>
                <th>APY</th>
              </tr>
            </thead>
            <tbody>
              {NFT_BOOST_SPEC_ROWS.map((row) => (
                <tr key={row.level}>
                  <td>{row.level}</td>
                  <td>{row.bps}</td>
                  <td>+{row.pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="test-time-spec-block">
          <div className="test-time-spec-label">{copy.addressesTitle}</div>
          <AddressRow label="Vault" addr={addrs.vault} spec={spec} />
          <AddressRow label="VeCPOTLocker" addr={addrs.locker} spec={spec} />
          <AddressRow label="Distributor" addr={addrs.distributor} spec={spec} />
        </div>

        <div className="test-time-spec-block">
          <div className="test-time-spec-label">{spec.chainReadsTitle}</div>
          <p className="test-time-spec-muted">{spec.chainReadsHint}</p>
          <button
            type="button"
            className="test-time-fetch-chain"
            disabled={chainLoading}
            onClick={() => void loadChainSnapshot()}
          >
            {chainLoading ? <Spinner label={copy.fetchingChain} /> : spec.fetchChainBtn}
          </button>
          {chainError ? <p className="test-time-chain-error">{chainError}</p> : null}
          {chainSnap ? (
            <div className="test-time-chain-grid">
              <div className="test-time-chain-col">
                <div className="test-time-chain-col-title">ChapoolEarnVault</div>
                <div className="test-time-kv">
                  <span>rewardRate</span>
                  <strong>{formatRewardRateWei(chainSnap.vault.rewardRate)} CPP/s</strong>
                </div>
                <div className="test-time-kv">
                  <span>totalWeightedUSDT</span>
                  <strong title={chainSnap.vault.totalWeightedUSDT.toString()}>
                    {formatEther(chainSnap.vault.totalWeightedUSDT)}
                  </strong>
                </div>
                <div className="test-time-kv">
                  <span>PRECISION</span>
                  <strong>{chainSnap.vault.precision.toString()}</strong>
                </div>
                <div className="test-time-kv">
                  <span>BPS_DENOMINATOR</span>
                  <strong>{chainSnap.vault.bpsDenominator.toString()}</strong>
                </div>
                <div className="test-time-kv">
                  <span>EMERGENCY_TIMELOCK</span>
                  <strong>{fmtSec(chainSnap.vault.emergencyTimelock)} s</strong>
                </div>
                <div className="test-time-kv">
                  <span>paused</span>
                  <strong>{chainSnap.vault.paused ? spec.yes : spec.no}</strong>
                </div>
                <div className="test-time-kv">
                  <span>emergencyMode</span>
                  <strong>{chainSnap.vault.emergencyMode ? spec.yes : spec.no}</strong>
                </div>
              </div>
              <div className="test-time-chain-col">
                <div className="test-time-chain-col-title">VeCPOTLocker</div>
                <div className="test-time-kv">
                  <span>effectiveNow</span>
                  <strong className="test-time-kv-wrap">
                    {new Date(Number(chainSnap.locker.effectiveNow) * 1000).toLocaleString(
                      lang === 'zh' ? 'zh-CN' : 'en-US',
                      { dateStyle: 'short', timeStyle: 'medium' }
                    )}
                  </strong>
                </div>
                <div className="test-time-kv">
                  <span>boostPerVeUnit</span>
                  <strong>{chainSnap.locker.boostPerVeUnit.toString()}</strong>
                </div>
                <div className="test-time-kv">
                  <span>maxVecpotBoostBps</span>
                  <strong>{chainSnap.locker.maxVecpotBoostBps.toString()} bps</strong>
                </div>
                <div className="test-time-kv">
                  <span>BOOST_VE_PRECISION</span>
                  <strong>{chainSnap.locker.boostVePrecision.toString()}</strong>
                </div>
                <div className="test-time-kv">
                  <span>MAX_LOCK_POSITIONS</span>
                  <strong>{chainSnap.locker.maxLockPositions.toString()}</strong>
                </div>
                <div className="test-time-kv">
                  <span>DURATION</span>
                  <strong>
                    {[
                      chainSnap.locker.d30,
                      chainSnap.locker.d90,
                      chainSnap.locker.d180,
                      chainSnap.locker.d360,
                    ].join(' / ')}
                  </strong>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </details>

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

      <div className="test-time-quick-label">{spec.quickBumpTitle}</div>
      <div className="test-time-actions test-time-actions--quick">
        <button
          type="button"
          className={`test-time-bump-btn test-time-bump-btn--accent ${activePreset === 'emergency' ? 'is-pending' : ''}`}
          disabled={busy || connecting || !account}
          title={`${spec.bumpEmergency} (${fmtSec(emergencyDelta)}s)`}
          onClick={() => void bumpAll(emergencyDelta, 'emergency')}
        >
          {spec.bumpEmergency}
        </button>
        <button
          type="button"
          className={`test-time-bump-btn test-time-bump-btn--accent ${activePreset === 'weekSample' ? 'is-pending' : ''}`}
          disabled={busy || connecting || !account}
          title={spec.bumpWeek}
          onClick={() => void bumpAll(BigInt(SECONDS_WEEK), 'weekSample')}
        >
          {spec.bumpWeek}
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
  addressesTitle: '合约地址（当前环境）',
  fetchingChain: '读取中…',
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
  addressesTitle: 'Contract addresses (env)',
  fetchingChain: 'Loading…',
}
