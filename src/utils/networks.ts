
import type { Network } from '@/extension/types'

export const mainNets: {[key: number]: Network} = {
    1: {
        name: 'Ethereum Main',
        rpc: 'https://eth-mainnet.public.blastapi.io',
        chainId: 1,
        explorer: '',
        icon: 'eth.webp',
        symbol: 'ETH',
        priceId: 'ethereum'
    },
    137: {
        name: 'Polygon Mainnet',
        rpc: 'https://polygon-rpc.com',
        chainId: 137,
        explorer: '',
        icon:'polygon.webp',
        symbol: 'MATIC',
        priceId: 'matic-network'
    },
    100: {
        name: 'Gnosis',
        rpc: 'https://rpc.gnosischain.com/',
        chainId: 100,
        explorer: '',
        icon:'xdai.webp',
        symbol: 'xDAI',
        priceId: 'xdai'
    },
    10: {
        name: 'Optimism',
        rpc: 'https://mainnet.optimism.io',
        chainId: 10,
        explorer: '',
        icon: 'optimism.webp',
        symbol: 'ETH',
        priceId: 'ethereum'
    },
    56: {
        name: 'BSC Main',
        rpc: 'https://bsc-dataseed2.binance.org',
        chainId: 56,
        explorer: '',
        icon: 'binance.webp',
        symbol: 'BNB',
        priceId: 'binancecoin'
    },
    42161: {
        name: 'Arbitrum One',
        rpc: 'https://rpc.ankr.com/arbitrum',
        chainId: 42161,
        explorer: '',
        icon: 'arbitrum.webp',
        symbol: 'ETH',
        priceId: 'ethereum'
    },
}

export const testNets = {
    1: {
        name: 'TESTNET Ethereum oerli',
        rpc: 'https://rpc.ankr.com/eth_goerli',
        chainId: 5,
        explorer: 'https://goerli.etherscan.io',
        icon: 'eth.webp'
    },
    4: {
        name: 'TESTNET Ethereum Rinkeby',
        rpc: 'https://rpc.ankr.com/eth_rinkeby',
        chainId: 5,
        explorer: 'https://goerli.etherscan.io',
        icon: 'eth.webp'
    },
    80001: {
        name: 'TESTNET Polygon',
        rpc: 'https://rpc.ankr.com/polygon_mumbai',
        chainId: 80001,
        explorer: '',
        icon:'polygon.webp'
    },
    100100: {
        name: 'TESTNET Gnosis Chiado',
        rpc: 'https://gnosis-mainnet.public.blastapi.io',
        chainId: 100100,
        explorer: '',
        icon:'xdai.webp'
    },
    420: {
        name: 'TESTNET Optimism Goreli',
        rpc: 'https://goerli.optimism.io/',
        chainId: 420,
        explorer: '',
        icon: 'optimism.webp'
    },
    97: {
        name: 'TESTNET BSC Main',
        rpc: 'https://bsctestapi.terminet.io/rpc',
        chainId: 97,
        explorer: '',
        icon: 'binance.webp'
    },
    421613: {
        name: 'TESTNET Arbitrum One',
        rpc: 'https://goerli-rollup.arbitrum.io/rpc/',
        chainId: 421613,
        explorer: '',
        icon: 'arbitrum.webp'
    },
}