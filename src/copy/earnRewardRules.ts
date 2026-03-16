/**
 * Earn 收益规则说明 — 供「如何计算收益」/ 帮助折叠区使用
 * 与 docs/Earn-Feature-Spec.md §9 收益规则说明 保持一致
 * 中英文双语
 */

export type RewardRulesSection = { title: string; body: string }

export const EARN_REWARD_RULES_TITLE_ZH = '收益规则说明'
export const EARN_REWARD_RULES_TITLE_EN = 'How rewards work'

export const EARN_REWARD_RULES_ZH: RewardRulesSection[] = [
  {
    title: '收益从哪来？',
    body: '平台将部分收入或手续费折算成 CPP，按周期注入 Earn 金库；您存入的 USDT 越多、占比越高，分到的 CPP 越多。',
  },
  {
    title: '怎么算我的那份？',
    body: '先按您的存款金额算一个「权重」：存款越多，权重越大。若您锁仓 CPOT 或持有/激活指定 NFT，还会在权重上再加一层「加速」，让您分到的 CPP 比例更高。金库每秒都会按「您的权重 ÷ 全网总权重」把当秒产生的 CPP 记在您名下，所以存得越久、领得越多。',
  },
  {
    title: '什么时候能拿到？',
    body: '收益会持续累加在「待领取 CPP」里，需要您主动点击「领取」才会发到您的账户；领取后可用于站内消费或充值 UCard 取现/消费。',
  },
  {
    title: '一句话总结',
    body: '多存、多锁 CPOT 或激活 NFT 可提高您的分配比例；收益按秒累积，随时可领取，领到的 CPP 可充 UCard 用。',
  },
]

export const EARN_REWARD_RULES_EN: RewardRulesSection[] = [
  {
    title: 'Where do rewards come from?',
    body: 'Platform revenue or fees are converted into CPP and injected into the Earn vault on a schedule. The more USDT you deposit and the higher your share of the pool, the more CPP you earn.',
  },
  {
    title: 'How is my share calculated?',
    body: 'Your "weight" is based on your deposit: more deposit means a larger weight. If you lock CPOT or hold/activate an eligible NFT, you get an extra "boost" on top, so you earn a higher share of CPP. Every second, the vault allocates that second\'s CPP by (your weight ÷ total weight), so the longer you stay, the more you can claim.',
  },
  {
    title: 'When do I get my rewards?',
    body: 'Rewards keep accruing under "Pending CPP". You need to tap "Claim" to send them to your account. After claiming, you can use CPP in-app or top up your UCard for withdrawal or spending.',
  },
  {
    title: 'In a nutshell',
    body: 'Deposit more, lock CPOT, or activate an NFT to increase your share. Rewards accrue every second and can be claimed anytime; claimed CPP can be used to top up your UCard.',
  },
]

export function getEarnRewardRulesSections(lang: 'zh' | 'en'): RewardRulesSection[] {
  return lang === 'zh' ? EARN_REWARD_RULES_ZH : EARN_REWARD_RULES_EN
}
