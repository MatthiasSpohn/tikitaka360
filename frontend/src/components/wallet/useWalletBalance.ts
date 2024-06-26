import {useQuery} from '@tanstack/react-query'
import {Asset, useWallet} from '@txnlab/use-wallet'
import {useEffect, useState} from 'react'
import {formatPrice} from '@/utils/convert.ts'
import algodClient from "@/lib/algodClient.ts";

function useWalletBalance() {
    const [ walletBalance, setWalletBalance] = useState<string | null>(null)
    const [ walletAvailableBalance, setWalletAvailableBalance] = useState<string | null>(null)
    const [ optedAssets, setOptedAssets] = useState<Asset[] | undefined>(undefined)

    const { activeAccount } = useWallet()

    const getAccountInfo = async () => {
        if (!activeAccount) throw new Error('No selected account.')
        return await algodClient.accountInformation(activeAccount.address).do()
    }

    const getAssetInfo = async (id: number) => {
        return await algodClient.getAssetByID(id).do()
    }

    const { data: accountInfo } = useQuery({
        queryKey: ['balance', activeAccount?.address],
        queryFn: getAccountInfo,
        enabled: !!activeAccount?.address,
        refetchInterval: 30000
    });

    useEffect(() => {
        if (
            accountInfo &&
            accountInfo.amount !== undefined &&
            accountInfo['min-balance'] !== undefined
        ) {
            const balance = formatPrice(accountInfo.amount, false, { minimumFractionDigits: 6 })
            const availableBalance = formatPrice(accountInfo.amount - accountInfo['min-balance'], false, {
                minimumFractionDigits: 6
            })
            if (accountInfo.assets) {
                setOptedAssets(accountInfo.assets);
            }

            if (availableBalance !== walletAvailableBalance) {
                setWalletAvailableBalance(availableBalance)
                return
            }

            if (balance !== walletBalance) {
                setWalletBalance(balance)
                return
            }

            if (parseFloat(availableBalance) < 0) {
                setWalletAvailableBalance('0.000000')
                return
            }

            if (availableBalance !== walletAvailableBalance) {
                setWalletAvailableBalance(availableBalance)
                return
            }
        } else {
            setWalletBalance('0.000000')
            setWalletAvailableBalance('0.000000')
        }
    }, [accountInfo, walletBalance, walletAvailableBalance])

    return {
        walletBalance,
        walletAvailableBalance,
        optedAssets,
        getAssetInfo,
    }
}

export default useWalletBalance
