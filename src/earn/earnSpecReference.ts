/**
 * Static reference aligned with `docs/Earn-Feature-Spec.md` (Chapool Earn).
 * For developer / test tooling only — on-chain values may differ if admin changed params.
 */

export const SPEC_DOC = 'docs/Earn-Feature-Spec.md'

export type SpecCopy = {
  sectionTitle: string
  docHint: string
  formulasTitle: string
  formulaLines: string[]
  cppRefTitle: string
  cppRefLine: string
  rateInjectTitle: string
  rateInjectLine: string
  lockTitle: string
  lockLine: string
  veTitle: string
  veLine: string
  boostTitle: string
  boostLine: string
  nftTitle: string
  nftNote: string
  durationsTitle: string
  durations: string
  testClockTitle: string
  testClockLine: string
  chainReadsTitle: string
  chainReadsHint: string
  fetchChainBtn: string
  explorer: string
  copyAddr: string
  copied: string
  quickBumpTitle: string
  bumpEmergency: string
  bumpWeek: string
  na: string
  yes: string
  no: string
}

const zh: SpecCopy = {
  sectionTitle: '规范与参数（Feature Spec）',
  docHint: '对照仓库内 Earn-Feature-Spec.md；链上可调参数以「链上只读」为准。',
  formulasTitle: '核心公式',
  formulaLines: [
    'userWeightedUSDT = usdtBalance × (10000 + veBoost + nftBoost) / 10000',
    'userCPP/s = rewardRate × userWeightedUSDT / totalWeightedUSDT',
  ],
  cppRefTitle: 'CPP 参考价（产品说明）',
  cppRefLine: '1 CPP ≈ 0.002 USDT（站内/运营换算参考）',
  rateInjectTitle: '排放速率（运营线下）',
  rateInjectLine:
    'cppPerSecond ≈ (周期内平台USDT收入 / 0.002) / 周期秒数 — 见 Spec §5.3；链上为 vault.rewardRate',
  lockTitle: '锁仓周期',
  lockLine: 'durationDays ∈ {30, 90, 180, 360}（天）',
  veTitle: '单仓 veAmount',
  veLine: 'veAmount = amount × durationDays / 360（Spec §3.5）',
  boostTitle: 'veCPOT → boost',
  boostLine:
    'veUnits = totalVeCPOT / 1e18；boostBps = min((veUnits × boostPerVeUnit) / BOOST_VE_PRECISION, maxVecpotBoostBps)（默认每 10 ve 单位 ≈ 1 bps，上限 500 bps）',
  nftTitle: 'NFT 加速（取激活的一张，不叠加）',
  nftNote: 'Spec §4.2 表示例；SS 等等级以链上 CPNFT / Controller 为准。',
  durationsTitle: '锁仓档位',
  durations: '30 / 90 / 180 / 360 天',
  testClockTitle: '测试时钟',
  testClockLine: 'bumpTestTime 仅 chainId 5611 / 31337 / 1337；三合约 offset 建议同幅度递增。',
  chainReadsTitle: '链上只读（当前 RPC）',
  chainReadsHint: '点击下方按钮从 Vault / Locker 拉取；失败项显示 —',
  fetchChainBtn: '拉取链上参数',
  explorer: '浏览器',
  copyAddr: '复制',
  copied: '已复制',
  quickBumpTitle: '快捷快进（联调）',
  bumpEmergency: '+24h（紧急提款 timelock）',
  bumpWeek: '+7d（604800s，示例周期）',
  na: '—',
  yes: '是',
  no: '否',
}

const en: SpecCopy = {
  sectionTitle: 'Spec & parameters (Feature Spec)',
  docHint: 'See Earn-Feature-Spec.md in repo; tunables shown from chain reads below.',
  formulasTitle: 'Core formulas',
  formulaLines: [
    'userWeightedUSDT = usdtBalance × (10000 + veBoost + nftBoost) / 10000',
    'userCPP/s = rewardRate × userWeightedUSDT / totalWeightedUSDT',
  ],
  cppRefTitle: 'CPP reference (product)',
  cppRefLine: '1 CPP ≈ 0.002 USDT (off-chain reference)',
  rateInjectTitle: 'Emission rate (ops, off-chain)',
  rateInjectLine:
    'cppPerSecond ≈ (period USDT revenue / 0.002) / periodSeconds — Spec §5.3; on-chain: vault.rewardRate',
  lockTitle: 'Lock durations',
  lockLine: 'durationDays ∈ {30, 90, 180, 360}',
  veTitle: 'Per-position veAmount',
  veLine: 'veAmount = amount × durationDays / 360 (Spec §3.5)',
  boostTitle: 'veCPOT → boost',
  boostLine:
    'veUnits = totalVeCPOT / 1e18; boostBps = min((veUnits × boostPerVeUnit) / BOOST_VE_PRECISION, maxVecpotBoostBps)',
  nftTitle: 'NFT boost (single activated NFT)',
  nftNote: 'Spec §4.2 table; exact levels on-chain.',
  durationsTitle: 'Lock tiers',
  durations: '30 / 90 / 180 / 360 days',
  testClockTitle: 'Test clock',
  testClockLine: 'bumpTestTime only on chainIds 5611 / 31337 / 1337; bump all three contracts with same delta.',
  chainReadsTitle: 'On-chain reads (current RPC)',
  chainReadsHint: 'Fetch from Vault / Locker; failed items show —',
  fetchChainBtn: 'Fetch on-chain params',
  explorer: 'Explorer',
  copyAddr: 'Copy',
  copied: 'Copied',
  quickBumpTitle: 'Quick bump (dev)',
  bumpEmergency: '+24h (emergency timelock)',
  bumpWeek: '+7d (604800s sample period)',
  na: '—',
  yes: 'Yes',
  no: 'No',
}

export function getSpecCopy(lang: 'zh' | 'en'): SpecCopy {
  return lang === 'zh' ? zh : en
}

/** Spec §4.2 style rows + common SS tier from spec appendix */
export const NFT_BOOST_SPEC_ROWS = [
  { level: 'L1', bps: 50, pct: '0.5%' },
  { level: 'L2', bps: 100, pct: '1.0%' },
  { level: 'L3', bps: 200, pct: '2.0%' },
  { level: 'L4', bps: 350, pct: '3.5%' },
] as const

export const SECONDS_DAY = 86400
export const SECONDS_WEEK = 604800
