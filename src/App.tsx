import { useState } from 'react'
import './App.css'

// ── Constants ─────────────────────────────────────────────────────────────────
const BASE_APY = 8.0
const DURATION_BOOST: Record<number, number> = { 30: 1.0, 90: 2.0, 180: 3.5, 360: 5.0 }

// ── Types ─────────────────────────────────────────────────────────────────────
type Sheet = null | 'deposit' | 'lock' | 'nft'
type DepositMode = 'deposit' | 'withdraw'
type LockDuration = 30 | 90 | 180 | 360
type Lang = 'zh' | 'en'

// ── Text strings ──────────────────────────────────────────────────────────────
const T = {
  zh: {
    header: '理财',
    lang: 'EN',
    totalLabel: '总资产',
    apyLabel: '年化',
    depositBtn: '存入 USDT',
    withdrawBtn: '取出',
    positionTitle: '我的存款',
    principalLabel: '本金',
    earnedLabel: '已赚',
    liquidityLabel: '流动性',
    liquidityVal: '活期，随时可取',
    boostTitle: '收益加速',
    lockCpotTitle: '锁仓 CPOT',
    lockedSub: (expiry: string) => `已锁 5,000 CPOT · 解锁于 ${expiry}`,
    notLockedSub: '未锁仓',
    moreLockBtn: '新增锁仓',
    lockNowBtn: '立即锁仓',
    unlockBtn: '解锁',
    expiredLabel: '已到期',
    unlocksOnLabel: '解锁于',
    noLocksLabel: '未锁仓',
    activeLocksLabel: (n: number) => `${n} 个仓位活跃`,
    nftTitle: 'NFT 加速',
    nftActiveSub: (n: number) => `持有 ${n} 个 CPNFT，已激活`,
    nftNoneSub: '持有 CPNFT 可再加速 +1.5%',
    activateNftBtn: '激活加速',
    getNftBtn: '获取 NFT',
    baseApyLabel: '基础年化',
    vecpotBoostLabel: 'veCPOT 加速',
    nftBoostLabel: 'NFT 加速',
    currentApyLabel: '当前年化',
    historyTitle: '最近记录',
    pendingCppLabel: '待领取 CPP',
    claimCppBtn: '领取',
    cppClaimedText: 'CPP 已领取',
    withdrawHistoryText: '取出 USDT',
    initialHistory: [
      { icon: '💰', text: 'CPP 已领取', amount: '+1,200 CPP', time: '今天 08:00' },
      { icon: '↑', text: '取出 USDT', amount: '-$500', time: '昨天 09:11' },
      { icon: '↓', text: '存入 USDT', amount: '+$1,000', time: '昨天 14:23' },
      { icon: '🔒', text: '锁仓 CPOT', amount: '5,000 CPOT', time: '3天前' },
      { icon: '💰', text: 'CPP 已领取', amount: '+1,200 CPP', time: '4天前 08:00' },
    ],
    // deposit sheet
    depositTab: '存入',
    withdrawTab: '取出',
    allDeposit: '全部 5,000',
    allWithdraw: (n: number) => `全部 ${n.toLocaleString('en')}`,
    youGet: '你将获得',
    estApy: '当前年化',
    flexible: '活期，随时可取',
    youGetBack: '你将取回',
    estArrival: '预计到账',
    instantVal: 'T+0，即时',
    confirmDeposit: '确认存入',
    confirmWithdraw: '确认取出',
    depositSuccess: '存入成功',
    withdrawSuccess: '已发起取出',
    depositSuccessBody: (n: number) => `已存入 ${n.toLocaleString('en')} USDT，收益从明天开始计算。`,
    withdrawSuccessBody: '取出申请已提交，通常 T+0 到账。',
    done: '完成',
    // lock sheet
    lockTitle: '锁 CPOT 提升年化',
    lockDesc: '锁仓时间越长，年化加成越高。到期自动解锁，CPOT 原路退回。',
    allCpot: '全部 12,000',
    addedBoost: '本次新增加速',
    newApy: '锁仓后年化',
    lockNext: '下一步',
    confirmLock: '确认锁仓',
    backEdit: '返回修改',
    lockWarning: '锁仓期间无法取出 CPOT，到期自动解锁并退回钱包。',
    confirmLockTitle: '确认锁仓',
    lockAmount: '锁仓数量',
    lockDuration: '锁仓时长',
    lockSuccess: '锁仓成功',
    lockSuccessBody: (n: number, d: number) => `已锁 ${n.toLocaleString('en')} CPOT，锁期 ${d} 天`,
    lockSuccessApy: (apy: number) => `你的 Earn 年化已提升至 ${apy.toFixed(1)}%`,
    alreadyBoost: '已有锁仓加速',
    durationLabels: { 30: '30天', 90: '90天', 180: '180天', 360: '360天' } as Record<number, string>,
    // nft sheet
    nftSheetTitle: '如何获得 NFT 加速',
    nftSheetBody: '持有 Chapool CPNFT 即可自动激活 +1.5% 年化加速。NFT 可在 Marketplace 购买，或参与平台活动获取。',
    goMarketplace: '去 Marketplace',
    close: '关闭',
  },
  en: {
    header: 'Earn',
    lang: '中文',
    totalLabel: 'Total Assets',
    apyLabel: 'APY',
    depositBtn: 'Deposit USDT',
    withdrawBtn: 'Withdraw',
    positionTitle: 'My Position',
    principalLabel: 'Principal',
    earnedLabel: 'Earned',
    liquidityLabel: 'Liquidity',
    liquidityVal: 'Flexible',
    boostTitle: 'Yield Boost',
    lockCpotTitle: 'Lock CPOT',
    lockedSub: (expiry: string) => `5,000 CPOT locked · Unlocks ${expiry}`,
    notLockedSub: 'Not locked yet',
    moreLockBtn: 'Add lock',
    lockNowBtn: 'Lock now',
    unlockBtn: 'Unlock',
    expiredLabel: 'Expired',
    unlocksOnLabel: 'Unlocks',
    noLocksLabel: 'No active locks',
    activeLocksLabel: (n: number) => `${n} active lock${n > 1 ? 's' : ''}`,
    nftTitle: 'NFT Boost',
    nftActiveSub: (n: number) => `${n} CPNFT active`,
    nftNoneSub: 'Hold CPNFT for +1.5% boost',
    activateNftBtn: 'Activate',
    getNftBtn: 'Get NFT',
    baseApyLabel: 'Base APY',
    vecpotBoostLabel: 'veCPOT boost',
    nftBoostLabel: 'NFT boost',
    currentApyLabel: 'Current APY',
    historyTitle: 'Recent',
    pendingCppLabel: 'Pending CPP',
    claimCppBtn: 'Claim',
    cppClaimedText: 'CPP claimed',
    withdrawHistoryText: 'Withdrew USDT',
    initialHistory: [
      { icon: '💰', text: 'CPP claimed', amount: '+1,200 CPP', time: 'Today 08:00' },
      { icon: '↑', text: 'Withdrew USDT', amount: '-$500', time: 'Yesterday 09:11' },
      { icon: '↓', text: 'Deposited USDT', amount: '+$1,000', time: 'Yesterday 14:23' },
      { icon: '🔒', text: 'Locked CPOT', amount: '5,000 CPOT', time: '3 days ago' },
      { icon: '💰', text: 'CPP claimed', amount: '+1,200 CPP', time: '4 days ago' },
    ],
    depositTab: 'Deposit',
    withdrawTab: 'Withdraw',
    allDeposit: 'Max 5,000',
    allWithdraw: (n: number) => `Max ${n.toLocaleString('en')}`,
    youGet: 'You receive',
    estApy: 'Current APY',
    flexible: 'Flexible, withdraw anytime',
    youGetBack: 'You get back',
    estArrival: 'Arrival',
    instantVal: 'T+0, instant',
    confirmDeposit: 'Confirm deposit',
    confirmWithdraw: 'Confirm withdraw',
    depositSuccess: 'Deposited',
    withdrawSuccess: 'Withdraw submitted',
    depositSuccessBody: (n: number) => `${n.toLocaleString('en')} USDT deposited. Yield starts tomorrow.`,
    withdrawSuccessBody: 'Withdrawal submitted. Usually arrives T+0.',
    done: 'Done',
    lockTitle: 'Lock CPOT for higher yield',
    lockDesc: 'Longer lock = higher boost. Auto-unlocked at expiry, CPOT returned.',
    allCpot: 'Max 12,000',
    addedBoost: 'Boost added',
    newApy: 'APY after lock',
    lockNext: 'Next',
    confirmLock: 'Confirm lock',
    backEdit: 'Edit',
    lockWarning: 'CPOT cannot be withdrawn during lock. Auto-released at expiry.',
    confirmLockTitle: 'Confirm lock',
    lockAmount: 'Amount',
    lockDuration: 'Duration',
    lockSuccess: 'Locked',
    lockSuccessBody: (n: number, d: number) => `${n.toLocaleString('en')} CPOT locked for ${d} days`,
    lockSuccessApy: (apy: number) => `Your Earn APY is now ${apy.toFixed(1)}%`,
    alreadyBoost: 'Current boost',
    durationLabels: { 30: '30d', 90: '90d', 180: '180d', 360: '360d' } as Record<number, string>,
    nftSheetTitle: 'How to get NFT boost',
    nftSheetBody: 'Hold a Chapool CPNFT to auto-activate +1.5% APY boost. Get NFTs on Marketplace or through platform events.',
    goMarketplace: 'Open Marketplace',
    close: 'Close',
  },
}

// ── BottomSheet ───────────────────────────────────────────────────────────────
function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <>
      <div className={`sheet-overlay ${open ? 'visible' : ''}`} onClick={onClose} />
      <div className={`bottom-sheet ${open ? 'open' : ''}`}>
        <div className="sheet-handle" />
        {children}
      </div>
    </>
  )
}

// ── Deposit Sheet ──────────────────────────────────────────────────────────────
function DepositSheet({
  lang,
  currentPrincipal,
  currentApy,
  onClose,
  onSuccess,
}: {
  lang: Lang
  currentPrincipal: number
  currentApy: number
  onClose: () => void
  onSuccess: (amount: number, mode: DepositMode) => void
}) {
  const t = T[lang]
  const [mode, setMode] = useState<DepositMode>('deposit')
  const [amount, setAmount] = useState('')
  const [done, setDone] = useState(false)
  const num = parseFloat(amount) || 0

  const handleConfirm = () => {
    onSuccess(num, mode)
    setDone(true)
  }

  if (done) {
    return (
      <div className="sheet-content">
        <div className="success-icon">✓</div>
        <h2>{mode === 'deposit' ? t.depositSuccess : t.withdrawSuccess}</h2>
        <p className="success-body">
          {mode === 'deposit' ? t.depositSuccessBody(num) : t.withdrawSuccessBody}
        </p>
        <button className="primary-button full-width" onClick={onClose}>
          {t.done}
        </button>
      </div>
    )
  }

  return (
    <div className="sheet-content">
      <div className="sheet-mode-tabs">
        <button
          className={`sheet-tab ${mode === 'deposit' ? 'active' : ''}`}
          onClick={() => setMode('deposit')}
        >
          {t.depositTab}
        </button>
        <button
          className={`sheet-tab ${mode === 'withdraw' ? 'active' : ''}`}
          onClick={() => setMode('withdraw')}
        >
          {t.withdrawTab}
        </button>
      </div>

      <div className="amount-field">
        <div className="amount-currency">USDT</div>
        <input
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="amount-input"
          autoFocus
        />
      </div>
      <button
        className="max-btn"
        onClick={() =>
          mode === 'deposit' ? setAmount('5000') : setAmount(currentPrincipal.toString())
        }
      >
        {mode === 'deposit' ? t.allDeposit : t.allWithdraw(currentPrincipal)}
      </button>

      {num > 0 && (
        <div className="preview-card">
          {mode === 'deposit' ? (
            <>
              <div className="list-item">
                <span>{t.youGet}</span>
                <strong>{num.toLocaleString('en')} ceUSDT</strong>
              </div>
              <div className="list-item">
                <span>{t.estApy}</span>
                <strong className="green">{currentApy.toFixed(1)}%</strong>
              </div>
              <div className="list-item">
                <span>{t.flexible}</span>
                <strong>✓</strong>
              </div>
            </>
          ) : (
            <>
              <div className="list-item">
                <span>{t.youGetBack}</span>
                <strong>{num.toLocaleString('en')} USDT</strong>
              </div>
              <div className="list-item">
                <span>{t.estArrival}</span>
                <strong>{t.instantVal}</strong>
              </div>
            </>
          )}
        </div>
      )}

      <button className="primary-button full-width" onClick={handleConfirm} disabled={num <= 0}>
        {mode === 'deposit' ? t.confirmDeposit : t.confirmWithdraw}
      </button>
    </div>
  )
}

// ── Lock Sheet ────────────────────────────────────────────────────────────────
function LockSheet({
  lang,
  currentVecpotBoost,
  onClose,
  onSuccess,
}: {
  lang: Lang
  currentVecpotBoost: number
  onClose: () => void
  onSuccess: (duration: LockDuration, amount: number) => void
}) {
  const t = T[lang]
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form')
  const [duration, setDuration] = useState<LockDuration>(90)
  const [amount, setAmount] = useState('')
  const num = parseFloat(amount) || 0
  const boost = DURATION_BOOST[duration]
  const newTotalApy = BASE_APY + currentVecpotBoost + boost

  const handleConfirm = () => {
    onSuccess(duration, num)
    setStep('success')
  }

  if (step === 'success') {
    return (
      <div className="sheet-content">
        <div className="success-icon">✓</div>
        <h2>{t.lockSuccess}</h2>
        <p className="success-body">{t.lockSuccessBody(num, duration)}</p>
        <p className="success-apy">{t.lockSuccessApy(newTotalApy)}</p>
        <button className="primary-button full-width" onClick={onClose}>
          {t.done}
        </button>
      </div>
    )
  }

  if (step === 'confirm') {
    return (
      <div className="sheet-content">
        <h2>{t.confirmLockTitle}</h2>
        <div className="preview-card">
          <div className="list-item">
            <span>{t.lockAmount}</span>
            <strong>{num.toLocaleString('en')} CPOT</strong>
          </div>
          <div className="list-item">
            <span>{t.lockDuration}</span>
            <strong>{t.durationLabels[duration]}</strong>
          </div>
          <div className="list-item">
            <span>{t.addedBoost}</span>
            <strong className="green">+{boost.toFixed(1)}%</strong>
          </div>
          <div className="list-item">
            <span>{t.newApy}</span>
            <strong className="green">{newTotalApy.toFixed(1)}%</strong>
          </div>
        </div>
        <p className="note-text">{t.lockWarning}</p>
        <button className="primary-button full-width" onClick={handleConfirm}>
          {t.confirmLock}
        </button>
        <button className="secondary-button full-width" onClick={() => setStep('form')}>
          {t.backEdit}
        </button>
      </div>
    )
  }

  return (
    <div className="sheet-content">
      <h2>{t.lockTitle}</h2>
      <p className="sheet-desc">{t.lockDesc}</p>

      <div className="duration-grid">
        {([30, 90, 180, 360] as LockDuration[]).map((d) => (
          <button
            key={d}
            className={`duration-btn ${duration === d ? 'active' : ''}`}
            onClick={() => setDuration(d)}
          >
            <span className="d-label">{t.durationLabels[d]}</span>
            <span className="d-boost">+{DURATION_BOOST[d].toFixed(1)}%</span>
          </button>
        ))}
      </div>

      <div className="amount-field">
        <div className="amount-currency">CPOT</div>
        <input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="amount-input"
        />
      </div>
      <button className="max-btn" onClick={() => setAmount('12000')}>
        {t.allCpot}
      </button>

      <div className="apy-calc">
        <div className="calc-row">
          <span>{t.baseApyLabel}</span>
          <span>{BASE_APY.toFixed(1)}%</span>
        </div>
        {currentVecpotBoost > 0 && (
          <div className="calc-row">
            <span>{t.alreadyBoost}</span>
            <span className="green">+{currentVecpotBoost.toFixed(1)}%</span>
          </div>
        )}
        <div className="calc-row green-row">
          <span>{t.addedBoost}</span>
          <span className="green">+{boost.toFixed(1)}%</span>
        </div>
        <div className="calc-row total-row">
          <strong>{t.newApy}</strong>
          <strong className="green">{newTotalApy.toFixed(1)}%</strong>
        </div>
      </div>

      <button
        className="primary-button full-width"
        onClick={() => setStep('confirm')}
        disabled={num <= 0}
      >
        {t.lockNext}
      </button>
    </div>
  )
}

// ── NFT Info Sheet ─────────────────────────────────────────────────────────────
function NftSheet({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const t = T[lang]
  return (
    <div className="sheet-content">
      <div className="nft-icon">🖼</div>
      <h2>{t.nftSheetTitle}</h2>
      <p className="sheet-desc">{t.nftSheetBody}</p>
      <button className="primary-button full-width">{t.goMarketplace}</button>
      <button className="secondary-button full-width" onClick={onClose}>
        {t.close}
      </button>
    </div>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────
type HistoryItem = { icon: string; text: string; amount: string; time: string }
type LockPos = {
  id: number
  amount: number
  durationDays: LockDuration
  unlockZh: string
  unlockEn: string
  expired: boolean
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState<Lang>('zh')
  const [sheet, setSheet] = useState<Sheet>(null)

  // Simulated wallet state
  const [principal, setPrincipal] = useState(3200)
  const earned = 86.4

  // Multiple lock positions — each has its own duration and expiry
  const [locks, setLocks] = useState<LockPos[]>([
    { id: 1, amount: 5000, durationDays: 180, unlockZh: '6月1日', unlockEn: 'Jun 1', expired: false },
    { id: 2, amount: 2000, durationDays: 30,  unlockZh: '3月20日', unlockEn: 'Mar 20', expired: true },
  ])
  const activeLocks = locks.filter((l) => !l.expired)
  const maxDuration = activeLocks.length > 0
    ? (Math.max(...activeLocks.map((l) => l.durationDays)) as LockDuration)
    : 0
  const vecpotBoost = maxDuration > 0 ? DURATION_BOOST[maxDuration] : 0

  const nftCount = 0
  const nftBoost = nftCount > 0 ? 1.5 : 0
  const currentApy = BASE_APY + vecpotBoost + nftBoost
  const totalAssets = principal + earned

  // CPP claim state
  const [pendingCPP, setPendingCPP] = useState(286)
  const [cppClaiming, setCppClaiming] = useState(false)

  // Dynamic history (zh and en kept in sync via lang switch)
  const [historyZh, setHistoryZh] = useState<HistoryItem[]>(T.zh.initialHistory)
  const [historyEn, setHistoryEn] = useState<HistoryItem[]>(T.en.initialHistory)
  const history = lang === 'zh' ? historyZh : historyEn

  const t = T[lang]

  const now = () => {
    const d = new Date()
    return lang === 'zh'
      ? `今天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      : `Today ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  const handleDepositSuccess = (amount: number, mode: DepositMode) => {
    if (mode === 'deposit') {
      setPrincipal((p) => p + amount)
      const entry: HistoryItem = { icon: '↓', text: lang === 'zh' ? '存入 USDT' : 'Deposited USDT', amount: `+$${amount.toLocaleString('en')}`, time: now() }
      setHistoryZh((h) => [{ ...entry, text: '存入 USDT' }, ...h])
      setHistoryEn((h) => [{ ...entry, text: 'Deposited USDT' }, ...h])
    } else {
      setPrincipal((p) => Math.max(0, p - amount))
      const entry: HistoryItem = { icon: '↑', text: lang === 'zh' ? '取出 USDT' : 'Withdrew USDT', amount: `-$${amount.toLocaleString('en')}`, time: now() }
      setHistoryZh((h) => [{ ...entry, text: '取出 USDT' }, ...h])
      setHistoryEn((h) => [{ ...entry, text: 'Withdrew USDT' }, ...h])
    }
  }

  const handleLockSuccess = (duration: LockDuration, amount: number) => {
    const newLock: LockPos = {
      id: Date.now(),
      amount,
      durationDays: duration,
      unlockZh: `${duration}天后`,
      unlockEn: `${duration}d later`,
      expired: false,
    }
    setLocks((prev) => [...prev, newLock])
    setHistoryZh((h) => [{ icon: '🔒', text: '锁仓 CPOT', amount: `${amount.toLocaleString('en')} CPOT`, time: now() }, ...h])
    setHistoryEn((h) => [{ icon: '🔒', text: 'Locked CPOT', amount: `${amount.toLocaleString('en')} CPOT`, time: now() }, ...h])
  }

  const handleUnlock = (lockId: number) => {
    const lock = locks.find((l) => l.id === lockId)
    if (!lock) return
    setLocks((prev) => prev.filter((l) => l.id !== lockId))
    setHistoryZh((h) => [{ icon: '🔓', text: '解锁 CPOT', amount: `${lock.amount.toLocaleString('en')} CPOT`, time: now() }, ...h])
    setHistoryEn((h) => [{ icon: '🔓', text: 'Unlocked CPOT', amount: `${lock.amount.toLocaleString('en')} CPOT`, time: now() }, ...h])
  }

  const handleClaimCPP = () => {
    if (pendingCPP <= 0 || cppClaiming) return
    setCppClaiming(true)
    const claimed = pendingCPP
    setTimeout(() => {
      setPendingCPP(0)
      const entry: HistoryItem = { icon: '💰', text: '', amount: `+${claimed.toLocaleString('en')} CPP`, time: now() }
      setHistoryZh((h) => [{ ...entry, text: 'CPP 已领取' }, ...h])
      setHistoryEn((h) => [{ ...entry, text: 'CPP claimed' }, ...h])
      setCppClaiming(false)
    }, 800)
  }

  const closeSheet = () => setSheet(null)

  return (
    <div className="mobile-shell">
      <header className="app-header">
        <strong className="brand">{t.header}</strong>
        <button className="language-toggle" onClick={() => setLang((l) => (l === 'zh' ? 'en' : 'zh'))}>
          {t.lang}
        </button>
      </header>

      <main className="app-main">
        <div className="screen-body">
          {/* ── Hero ── */}
          <section className="earn-hero">
            <div className="hero-label">{t.totalLabel}</div>
            <div className="hero-amount">
              ${totalAssets.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="hero-apy">
              {t.apyLabel} <span className="apy-num">{currentApy.toFixed(1)}%</span>
            </div>
            <div className="button-row">
              <button className="primary-button" onClick={() => setSheet('deposit')}>
                {t.depositBtn}
              </button>
              <button className="secondary-button" onClick={() => setSheet('deposit')}>
                {t.withdrawBtn}
              </button>
            </div>
          </section>

          {/* ── Position ── */}
          <section className="content-card">
            <h2>{t.positionTitle}</h2>
            <div className="list-group">
              <div className="list-item">
                <span>{t.principalLabel}</span>
                <strong>
                  ${principal.toLocaleString('en', { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <div className="list-item">
                <span>{t.liquidityLabel}</span>
                <strong>{t.liquidityVal}</strong>
              </div>
              <div className="list-item cpp-claim-row">
                <div className="cpp-claim-left">
                  <span>{t.pendingCppLabel}</span>
                  <strong className={pendingCPP > 0 ? 'green' : ''}>
                    {pendingCPP > 0 ? `${pendingCPP.toLocaleString('en')} CPP` : '—'}
                  </strong>
                </div>
                <button
                  className={`claim-btn ${pendingCPP <= 0 ? 'disabled' : ''} ${cppClaiming ? 'loading' : ''}`}
                  onClick={handleClaimCPP}
                  disabled={pendingCPP <= 0 || cppClaiming}
                >
                  {cppClaiming ? '···' : t.claimCppBtn}
                </button>
              </div>
            </div>
          </section>

          {/* ── Boost ── */}
          <section className="content-card">
            <div className="section-header">
              <h2>{t.boostTitle}</h2>
              <span className="apy-badge">{currentApy.toFixed(1)}%</span>
            </div>

            {/* veCPOT header row */}
            <div className="boost-row-card">
              <div className="boost-left">
                <div className="boost-title">{t.lockCpotTitle}</div>
                <div className="boost-sub">
                  {activeLocks.length === 0 ? t.noLocksLabel : t.activeLocksLabel(activeLocks.length)}
                </div>
              </div>
              <div className="boost-right">
                <span className={`boost-badge ${vecpotBoost > 0 ? 'on' : 'off'}`}>
                  {vecpotBoost > 0 ? `+${vecpotBoost.toFixed(1)}%` : '+0%'}
                </span>
                <button className="mini-btn" onClick={() => setSheet('lock')}>
                  {activeLocks.length > 0 ? t.moreLockBtn : t.lockNowBtn}
                </button>
              </div>
            </div>

            {/* Lock position list */}
            {locks.length > 0 && (
              <div className="lock-list">
                {locks.map((lock) => (
                  <div className="lock-item" key={lock.id}>
                    <div className="lock-item-info">
                      <span className="lock-item-amount">{lock.amount.toLocaleString('en')} CPOT</span>
                      <span className="lock-item-meta">
                        {lock.expired
                          ? t.expiredLabel
                          : `${t.unlocksOnLabel} ${lang === 'zh' ? lock.unlockZh : lock.unlockEn}`}
                      </span>
                    </div>
                    <button
                      className={`unlock-btn ${lock.expired ? 'ready' : 'pending'}`}
                      onClick={() => lock.expired && handleUnlock(lock.id)}
                      disabled={!lock.expired}
                    >
                      {lock.expired ? t.unlockBtn : (lang === 'zh' ? lock.unlockZh : lock.unlockEn)}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="boost-divider" />

            {/* NFT */}
            <div className="boost-row-card">
              <div className="boost-left">
                <div className="boost-title">{t.nftTitle}</div>
                <div className="boost-sub">
                  {nftCount > 0 ? t.nftActiveSub(nftCount) : t.nftNoneSub}
                </div>
              </div>
              <div className="boost-right">
                <span className={`boost-badge ${nftBoost > 0 ? 'on' : 'off'}`}>
                  {nftBoost > 0 ? `+${nftBoost.toFixed(1)}%` : '+0%'}
                </span>
                <button
                  className="mini-btn secondary"
                  onClick={() => setSheet('nft')}
                >
                  {nftCount > 0 ? t.activateNftBtn : t.getNftBtn}
                </button>
              </div>
            </div>

            {/* APY breakdown */}
            <div className="apy-calc">
              <div className="calc-row">
                <span>{t.baseApyLabel}</span>
                <span>{BASE_APY.toFixed(1)}%</span>
              </div>
              {vecpotBoost > 0 && (
                <div className="calc-row">
                  <span>{t.vecpotBoostLabel}</span>
                  <span className="green">+{vecpotBoost.toFixed(1)}%</span>
                </div>
              )}
              {nftBoost > 0 && (
                <div className="calc-row">
                  <span>{t.nftBoostLabel}</span>
                  <span className="green">+{nftBoost.toFixed(1)}%</span>
                </div>
              )}
              <div className="calc-row total-row">
                <strong>{t.currentApyLabel}</strong>
                <strong className="green">{currentApy.toFixed(1)}%</strong>
              </div>
            </div>
          </section>

          {/* ── History ── */}
          <section className="content-card">
            <h2>{t.historyTitle}</h2>
            <div className="history-list">
              {history.map((item, i) => (
                <div className="history-item" key={i}>
                  <div className="history-icon">{item.icon}</div>
                  <div className="history-info">
                    <span>{item.text}</span>
                    <span className="history-time">{item.time}</span>
                  </div>
                  <strong className={`history-amount ${item.icon === '↑' ? 'red' : ''}`}>
                    {item.amount}
                  </strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* ── Sheets ── */}
      <BottomSheet open={sheet === 'deposit'} onClose={closeSheet}>
        <DepositSheet
          lang={lang}
          currentPrincipal={principal}
          currentApy={currentApy}
          onClose={closeSheet}
          onSuccess={handleDepositSuccess}
        />
      </BottomSheet>

      <BottomSheet open={sheet === 'lock'} onClose={closeSheet}>
        <LockSheet
          lang={lang}
          currentVecpotBoost={vecpotBoost}
          onClose={closeSheet}
          onSuccess={(d, n) => handleLockSuccess(d, n)}
        />
      </BottomSheet>

      <BottomSheet open={sheet === 'nft'} onClose={closeSheet}>
        <NftSheet lang={lang} onClose={closeSheet} />
      </BottomSheet>
    </div>
  )
}
