/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EARN_VAULT?: string
  readonly VITE_EARN_LOCKER?: string
  readonly VITE_EARN_DISTRIBUTOR?: string
  readonly VITE_OPBNB_TESTNET_RPC?: string
  readonly VITE_SHOW_EARN_TEST_TOOLS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  }
}
