/**
 * Earn 收益规则说明 — 供「如何计算收益」/ 帮助折叠区使用
 * 与 docs/Earn-Feature-Spec.md §9 收益规则说明 保持一致
 */

export const EARN_REWARD_RULES_TITLE = '收益规则说明'

export const EARN_REWARD_RULES_SECTIONS = [
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
] as const
