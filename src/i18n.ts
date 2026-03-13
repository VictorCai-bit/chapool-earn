import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      app: {
        brand: 'Chapool',
        prototype: 'Mobile prototype',
        subtitle: 'Phase 1 and Phase 2 product prototype',
        language: 'Language',
      },
      nav: {
        overview: 'Overview',
        earn: 'Earn',
        lock: 'veCPOT',
        rewards: 'CPP',
        ucard: 'UCard',
      },
      common: {
        tvl: 'TVL',
        apr: 'APR',
        apy: 'APY',
        users: 'Users',
        status: 'Status',
        phase1: 'Phase 1',
        phase2: 'Phase 2',
        liveSoon: 'Prototype only',
        primaryAction: 'Connect wallet',
        secondaryAction: 'View docs',
      },
      home: {
        title: 'USDT builds TVL. CPOT builds loyalty. CPP builds utility.',
        description:
          'This mobile-first prototype focuses on the first two phases: Chapool Earn MVP and veCPOT with NFT Boost plus CPP utility.',
        heroPrimary: 'Start Earn',
        heroSecondary: 'Explore veCPOT',
        metrics: {
          tvlLabel: 'Projected TVL target',
          tvlValue: '$100K - $300K',
          usersLabel: '30 day target users',
          usersValue: '300 - 1,000',
          lockLabel: 'CPOT lock target',
          lockValue: '10% - 20%',
        },
        sections: {
          roadmap: 'Delivery scope',
          roadmapBody:
            'Phase 1 ships the USDT vault. Phase 2 adds veCPOT, NFT Boost, and the CPP utility experience.',
          logic: 'Business logic',
          logicBody:
            'Users deposit USDT for yield, lock CPOT for status and boosts, earn CPP, and later consume CPP in existing centralized utility modules.',
        },
        cards: {
          earn: {
            title: 'Chapool Earn',
            body: 'USDT vault with simple yield display, deposit flow, and position overview.',
          },
          vecpot: {
            title: 'veCPOT',
            body: 'Lock CPOT to unlock higher rates, fee discounts, and membership status.',
          },
          cpp: {
            title: 'CPP utility',
            body: 'CPP is earned onchain, then consumed through existing centralized redemption and spending flows.',
          },
        },
      },
      earn: {
        title: 'Chapool Earn',
        description:
          'A mobile-first USDT vault screen with deposit guidance, expected APY, and a simple position card.',
        baseApy: 'Base APY',
        boostedApy: 'Boosted APY',
        netInflow: '7 day inflow',
        positionTitle: 'Your position',
        positionItems: {
          principal: 'Principal',
          earned: 'Estimated rewards',
          boost: 'Boost source',
          liquidity: 'Liquidity',
        },
        positionValues: {
          principal: '$3,200',
          earned: '$86.40',
          boost: 'veCPOT + NFT',
          liquidity: 'Flexible',
        },
        formTitle: 'Deposit prototype',
        amountLabel: 'Deposit amount',
        amountValue: '1,000 USDT',
        receiveLabel: 'You receive',
        receiveValue: '1,000 ceUSDT',
        aprLabel: 'Estimated APY',
        aprValue: '11.5%',
        cta: 'Deposit USDT',
      },
      lock: {
        title: 'veCPOT lock',
        description:
          'Lock CPOT to increase yield, unlock membership level, and qualify for CPP rewards.',
        tiersTitle: 'Lock tiers',
        benefitsTitle: 'Unlocked benefits',
        tiers: {
          thirty: '30 days',
          ninety: '90 days',
          oneEighty: '180 days',
          threeSixty: '360 days',
        },
        benefits: {
          earn: 'Earn APY boost',
          fee: 'Marketplace fee discount',
          membership: 'Membership status',
          cpp: 'CPP reward eligibility',
        },
        summaryTitle: 'Lock summary',
        summaryItems: {
          amount: 'Lock amount',
          score: 'veCPOT score',
          reward: 'Expected CPP',
        },
        summaryValues: {
          amount: '5,000 CPOT',
          score: '3,850 veCPOT',
          reward: '420 CPP / month',
        },
        cta: 'Lock CPOT',
      },
      rewards: {
        title: 'CPP rewards',
        description:
          'CPP distribution is shown in the app, while consumption and UCard redemption continue through existing centralized modules.',
        cards: {
          claimable: 'Claimable CPP',
          monthly: 'Monthly CPP',
          utility: 'Utility path',
        },
        values: {
          claimable: '286 CPP',
          monthly: '420 CPP',
          utility: 'Consume or redeem',
        },
        feedTitle: 'Recent activity',
        feed: {
          one: 'Daily vault reward credited',
          two: 'veCPOT boost applied',
          three: 'CPP redemption request submitted',
        },
        cta: 'Claim CPP',
      },
      ucard: {
        title: 'UCard redemption status',
        description:
          'This screen represents the mobile status view for the existing centralized redemption flow instead of a new onchain contract.',
        statusTitle: 'Redemption flow',
        steps: {
          request: 'Submit redemption request',
          review: 'Centralized compliance review',
          issued: 'UCard balance updated',
          spend: 'Offline spending available',
        },
        summaryTitle: 'Current request',
        summaryItems: {
          amount: 'CPP amount',
          channel: 'Redemption channel',
          eta: 'Expected arrival',
        },
        summaryValues: {
          amount: '180 CPP',
          channel: 'UCard service',
          eta: 'Within 1 business day',
        },
        note: 'The prototype only shows the mobile status layer. Settlement, review, and reconciliation remain centralized.',
      },
    },
  },
  zh: {
    translation: {
      app: {
        brand: 'Chapool',
        prototype: '手机端原型',
        subtitle: 'Phase 1 与 Phase 2 产品原型',
        language: '语言',
      },
      nav: {
        overview: '概览',
        earn: 'Earn',
        lock: 'veCPOT',
        rewards: 'CPP',
        ucard: 'UCard',
      },
      common: {
        tvl: 'TVL',
        apr: 'APR',
        apy: 'APY',
        users: '用户',
        status: '状态',
        phase1: '第一阶段',
        phase2: '第二阶段',
        liveSoon: '仅原型演示',
        primaryAction: '连接钱包',
        secondaryAction: '查看方案',
      },
      home: {
        title: 'USDT 建 TVL，CPOT 建粘性，CPP 建消费能力。',
        description:
          '这个手机端原型聚焦前两个阶段：Chapool Earn MVP，以及 veCPOT、NFT Boost 和 CPP Utility。',
        heroPrimary: '进入 Earn',
        heroSecondary: '查看 veCPOT',
        metrics: {
          tvlLabel: 'TVL 目标',
          tvlValue: '$100K - $300K',
          usersLabel: '30 天用户目标',
          usersValue: '300 - 1,000',
          lockLabel: 'CPOT 锁仓目标',
          lockValue: '10% - 20%',
        },
        sections: {
          roadmap: '交付范围',
          roadmapBody:
            'Phase 1 交付 USDT 金库，Phase 2 增加 veCPOT、NFT Boost 和 CPP Utility 体验层。',
          logic: '业务逻辑',
          logicBody:
            '用户存入 USDT 获取收益，锁仓 CPOT 获得权益与加成，领取 CPP，并在现有中心化消费模块里完成使用。',
        },
        cards: {
          earn: {
            title: 'Chapool Earn',
            body: '以 USDT 金库为核心，展示收益、存款流程和持仓状态。',
          },
          vecpot: {
            title: 'veCPOT',
            body: '锁仓 CPOT，提升收益率、手续费权益和会员等级。',
          },
          cpp: {
            title: 'CPP Utility',
            body: 'CPP 在链上领取，在现有中心化兑换与消费服务中完成使用。',
          },
        },
      },
      earn: {
        title: 'Chapool Earn',
        description:
          '一个以手机端为中心的 USDT 金库页面，包含存款引导、预估 APY 和持仓卡片。',
        baseApy: '基础 APY',
        boostedApy: '加成后 APY',
        netInflow: '7 日净流入',
        positionTitle: '你的持仓',
        positionItems: {
          principal: '本金',
          earned: '预估收益',
          boost: '加成来源',
          liquidity: '流动性',
        },
        positionValues: {
          principal: '$3,200',
          earned: '$86.40',
          boost: 'veCPOT + NFT',
          liquidity: '活期',
        },
        formTitle: '存款原型',
        amountLabel: '存入金额',
        amountValue: '1,000 USDT',
        receiveLabel: '你将获得',
        receiveValue: '1,000 ceUSDT',
        aprLabel: '预估 APY',
        aprValue: '11.5%',
        cta: '存入 USDT',
      },
      lock: {
        title: 'veCPOT 锁仓',
        description:
          '锁仓 CPOT，提升收益率、解锁会员等级，并获得 CPP 奖励资格。',
        tiersTitle: '锁仓档位',
        benefitsTitle: '解锁权益',
        tiers: {
          thirty: '30 天',
          ninety: '90 天',
          oneEighty: '180 天',
          threeSixty: '360 天',
        },
        benefits: {
          earn: 'Earn 收益加成',
          fee: 'Marketplace 手续费折扣',
          membership: '会员等级',
          cpp: 'CPP 奖励资格',
        },
        summaryTitle: '锁仓概览',
        summaryItems: {
          amount: '锁仓数量',
          score: 'veCPOT 积分',
          reward: '预估 CPP',
        },
        summaryValues: {
          amount: '5,000 CPOT',
          score: '3,850 veCPOT',
          reward: '420 CPP / 月',
        },
        cta: '锁仓 CPOT',
      },
      rewards: {
        title: 'CPP 奖励',
        description:
          'CPP 的发放在链上展示，消费和 UCard 提现继续由现有中心化模块完成。',
        cards: {
          claimable: '可领取 CPP',
          monthly: '月度 CPP',
          utility: '使用路径',
        },
        values: {
          claimable: '286 CPP',
          monthly: '420 CPP',
          utility: '消费或兑换',
        },
        feedTitle: '最近动态',
        feed: {
          one: '每日金库奖励已到账',
          two: 'veCPOT 加成已生效',
          three: 'CPP 兑换申请已提交',
        },
        cta: '领取 CPP',
      },
      ucard: {
        title: 'UCard 兑换状态',
        description:
          '这个页面用于展示现有中心化兑换流程的手机端状态，而不是新增链上合约。',
        statusTitle: '兑换流程',
        steps: {
          request: '提交兑换申请',
          review: '中心化合规审核',
          issued: 'UCard 余额到账',
          spend: '支持线下消费',
        },
        summaryTitle: '当前申请',
        summaryItems: {
          amount: 'CPP 数量',
          channel: '兑换渠道',
          eta: '预计到账',
        },
        summaryValues: {
          amount: '180 CPP',
          channel: 'UCard 服务',
          eta: '1 个工作日内',
        },
        note: '此原型仅展示手机端状态层，审核、清算、对账仍由中心化系统处理。',
      },
    },
  },
} as const

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
