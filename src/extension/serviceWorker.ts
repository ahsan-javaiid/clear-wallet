import { getAccounts, getSelectedAccount, getSelectedNetwork, smallRandomString, storageSave} from '@/utils/platform';
import { userApprove, userReject, rIdWin, rIdData } from '@/extension/userRequest'
import { signMsg, getBalance, getBlockNumber, estimateGas, sendTransaction, getGasPrice } from '@/utils/wallet'
import type { RequestArguments } from '@/extension/types'
import type { Account } from '@/extension/types'
import { rpcError } from '@/extension/rpcConstants'
import { updatePrices } from '@/utils/gecko'

chrome.runtime.onInstalled.addListener(() => {
    console.log('Service worker installed');
    chrome.runtime.connect(null as unknown as string, {
        name:'sw-connection'
    })
})

chrome.runtime.onConnect.addListener(port => port.onDisconnect.addListener((a) => 
{
    console.log('Service worker connected', storageSave('test-d', a));
}))


chrome.runtime.onStartup.addListener(() => {
    console.log('Service worker startup');
})

chrome.runtime.onSuspend.addListener(() => {
    console.log('Service worker suspend');
})


chrome.alarms.create('updatePrices', {
    periodInMinutes: 1
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if(alarm.name === 'updatePrices') {
    updatePrices().then(() => {
        console.log('Prices updated')
    })
  }
})

chrome.windows.onRemoved.addListener((winId) => {
    if (winId in (userReject ?? {})){
        userReject[winId]?.()
    }
    userReject[winId] = undefined
    userApprove[winId] = undefined
    rIdWin[winId] = undefined
    rIdData[winId] = undefined
    chrome.windows.getAll().then((wins) => {
    if(wins.length === 0) {
        storageSave('test-p', 'browser-closed')
    }
    })
})

chrome.runtime.onMessage.addListener((message: RequestArguments, sender, sendResponse) => {
    console.log(message);
    (async () => {
        if (!('method' in message)) {
            sendResponse({
                code: 500,
                message: 'Invalid request method'
            })
        } else {
            // ETH API
            switch (message.method) {
                case 'eth_call': {
                    break
                }
                case 'eth_getBalance': {
                    sendResponse(await getBalance())
                    break
                }
                case 'eth_blockNumber': {
                    sendResponse(await getBlockNumber())
                    break               
                }
                case 'eth_estimateGas': {
                    const params = message?.params?.[0] as any
                    if(!params) {
                        sendResponse({
                            error: true,
                            code: rpcError.INVALID_PARAM,
                            message: 'Invalid param for gas estimate'
                        })
                        break
                    }
                    sendResponse(await estimateGas({
                        to: params?.to ?? '',
                        from: params?.from ?? '',
                        data: params?.data ?? '',
                        value: params?.value ?? '0x0'
                    }))
                    break             
                }
                case 'eth_accounts': {
                    const accounts = await getAccounts()
                    const addresses = accounts.map((a: Account) => a.address) ?? []
                    sendResponse(addresses)
                    break
                }
                case 'eth_requestAccounts': {
                    const account = await getSelectedAccount()
                    const address = account?.address ? [account?.address] : []
                    sendResponse(address)
                    break
                }
                case 'eth_chainId': {
                    const network = await getSelectedNetwork()
                    console.log(network, 'network')
                    const chainId = network?.chainId ?? 0
                    sendResponse(`0x${chainId.toString(16)}`)
                    break
                }
                case 'eth_sendTransaction': {
                    try {
                        const params = message?.params?.[0] as any
                        if(!params) {
                            sendResponse({
                                error: true,
                                code: rpcError.INVALID_PARAM,
                                message: 'Invalid param for send transaction'
                            })
                            break
                        }
                        const [account, network] = await Promise.all([getSelectedAccount(), getSelectedNetwork()])
                        if(!account || !network) {
                            return
                        }
                        const serializeParams = encodeURIComponent(JSON.stringify(params)) ?? ''
                        const pEstimateGas = estimateGas({
                            to: params?.to ?? '',
                            from: params?.from ?? '',
                            data: params?.data ?? '',
                            value: params?.value ?? '0x0'
                        })
                        const pGasPrice = getGasPrice()
                        let gWin: any
                        await new Promise((resolve, reject) => {
                        chrome.windows.create({
                            height: 450,
                            width: 400,
                            url: chrome.runtime.getURL(`index.html?route=sign-tx&param=${serializeParams}&rid=${String(message?.resId ?? '')}`),
                            type: 'popup'
                        }).then((win) => {
                            gWin = win
                            userReject[String(win.id)] = reject
                            userApprove[String(win.id)] = resolve
                            rIdWin[String(win.id)] = String(message.resId)
                            rIdData[String(win.id)] = {}
                        })
                        
                        })
                        sendResponse(
                            await sendTransaction({...params, ...(rIdData?.[String(gWin?.id ?? 0)] ?? {}) }, pEstimateGas, pGasPrice)
                        )
                        } catch(err) {
                            console.error(err)
                            sendResponse({
                                error: true,
                                code: rpcError.USER_REJECTED,
                                message: 'User Rejected Signature'
                            })
                        }
                    break
                }
                case ('personal_sign' || 'eth_sign'): {
                    try {
                    
                    await new Promise((resolve, reject) => {
                    chrome.windows.create({
                        height: 450,
                        width: 400,
                        url: chrome.runtime.getURL(`index.html?route=sign-msg&param=${String(message?.params?.[0] ?? '' )}&rid=${String(message?.resId ?? '')}`),
                        type: 'popup'
                    }).then((win) => {
                        userReject[String(win.id)] = reject
                        userApprove[String(win.id)] = resolve
                        rIdWin[String(win.id)] = String(message.resId)
                    })
                    
                    })
                    sendResponse(
                        await signMsg(String(message?.params?.[0]) ?? '' )
                    )
                    } catch {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'User Rejected Signature'
                        })
                    }
                    
                    break
                }
                // NON Standard  metamask API
                case 'wallet_requestPermissions': {
                    const account = await getSelectedAccount()
                    const address = account?.address ? [account?.address] : []
                    sendResponse([{
                        caveats: {
                            type:'',
                            value: address
                        },
                        invoker: '',
                        date: Date.now(),
                        id: smallRandomString(),
                        parentCapability: Object.keys(message?.params?.[0] ?? {})?.[0] ?? 'unknown'
                    }])
                    break
                }
                case 'net_version': {
                    const network = await getSelectedNetwork()
                    const chainId = network?.chainId ?? 0
                    sendResponse(chainId)
                    break
                }
                case 'wallet_switchEthereumChain': {
                    try {
                        await new Promise((resolve, reject) => {
                        chrome.windows.create({
                            height: 450,
                            width: 400,
                            url: chrome.runtime.getURL(`index.html?route=switch-network&param=${String(message?.params?.[0] ?? '' )}&rid=${String(message?.resId ?? '')}`),
                            type: 'popup'
                        }).then((win) => {
                            userReject[String(win.id)] = reject
                            userApprove[String(win.id)] = resolve
                            rIdWin[String(win.id)] = String(message.resId)
                        })
                        
                        })
                        sendResponse(
                            await signMsg(String(message?.params?.[0]) ?? '' )
                        )
                        } catch {
                            sendResponse({
                                error: true,
                                code: rpcError.USER_REJECTED,
                                message: 'User Rejected Signature'
                            })
                        }
                    break
                }
                // internal messeges
                case 'wallet_approve': {
                    if(String(sender.tab?.windowId) in rIdWin){
                        userApprove[String(sender.tab?.windowId)]?.(true)
                    }
                    try {
                        chrome.windows.remove(sender.tab?.windowId ?? 0)
                    }catch{
                        // ignore
                    }
                    break
                }
                case 'wallet_send_data': {
                    if(String(sender.tab?.windowId) in rIdData){
                        rIdData[String(sender?.tab?.windowId ?? '')] = (message as any)?.data ?? {}
                        sendResponse(true)
                    }
                    break
                }
                case 'wallet_get_data': {
                    if(String(sender.tab?.windowId) in rIdData){
                        sendResponse( rIdData[String(sender?.tab?.windowId ?? '')] ?? {})
                    }
                    break
                }
                case 'wallet_ping': {
                    sendResponse(true)
                    break
                }
                default: {
                    sendResponse({
                        error: true,
                        code: rpcError.INVALID_PARAM,
                        message: 'Invalid request method'
                    })
                    break
                }
            }
        }
    }
    )();
    return true;
});