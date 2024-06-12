import { useWallet } from '@txnlab/use-wallet';
import useWalletBalance from "@/components/wallet/useWalletBalance.ts";
import NftViewer from "@/components/nft/nft-viewer.tsx";
import algodClient from "@/lib/algodClient.ts";
import {useQuery} from "@tanstack/react-query";
import {TealKeyValue} from "algosdk/dist/types/client/v2/algod/models/types";
import {getGameConfigFromViteEnvironment} from "@/config/getGameConfigs.ts";
import { TikiTaka360Client } from '@/components/contracts/TikiTaka360Client.ts';
import {
    Sheet,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useLocalStorage} from "@/utils/use_local_store.ts";

import * as algosdk from "algosdk";
import axios from "axios";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"

type AppData = {
    appId: number
    assetId: number
    reviewValue: number
    assetPrice: number
}

const formSchema = z.object({
    club: z.string().min(2).max(55),
    password: z.string().min(2).max(55),
    age: z.coerce.number().int().min(16),
});

function Account() {
    const gameConfig = getGameConfigFromViteEnvironment()
    const { activeAddress, activeAccount, providers } = useWallet()
    const { walletBalance, walletAvailableBalance, optedAssets } = useWalletBalance()
    const [gameAccount, setGameAccount] = useLocalStorage("tikitaka", null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            club: "",
            password: "",
            age: 16
        }
    })
    const tikiTaka360Client = new TikiTaka360Client(
      {
          resolveBy: 'id',
          id: Number(gameConfig.gameAppId),
      },
      algodClient,
    );

    const fetchAppAccountInfo = async () => {
        const result =  await tikiTaka360Client.readScoreBox({ address: activeAddress! }, {});
        console.log(result.return);
    }

    const fetchAppInfo = async () => {
        const callerAppAddress = gameConfig.gameCallerAddress;
        return await algodClient.accountInformation(callerAppAddress).do();
    }

    const { status, data, error } = useQuery({
        queryKey: [],
        queryFn: fetchAppInfo,
        staleTime: 1000 * 60 * 5
    });

    const appData: AppData[] = [];
    const assetIds: number[] = [];
    if (status === 'success') {
        fetchAppAccountInfo().then(() => null);
        data['created-apps'].forEach((app: { id: number; params: { [x: string]: TealKeyValue[]; }}) => {
            const globalStates = app.params['global-state'];
            const assetID = globalStates.find((tealKeyValue: TealKeyValue) => Buffer.from(tealKeyValue.key, 'base64').toString() === "n")?.value.uint;
            const reviewValue = globalStates.find((tealKeyValue) => Buffer.from(tealKeyValue.key, 'base64').toString() === "r")?.value.uint;
            const assetPrice = globalStates.find((tealKeyValue) => Buffer.from(tealKeyValue.key, 'base64').toString() === "p")?.value.uint;
            appData.push({appId: app.id, assetId: assetID as number, reviewValue: reviewValue as number, assetPrice: assetPrice as number});
        })
        data.assets.forEach((asset: { 'asset-id': number; }) => {
            assetIds.push(asset['asset-id']);
        })
    }


    if (status === 'error') {
        return <div>An error occurred: {error.message}</div>;  // Error state
    }

    const activeProvider = providers?.find(
        (provider) => provider.metadata.id === activeAccount?.providerId
    )

    const createAccount = async (data: z.infer<typeof formSchema>) => {
        if (activeAccount || gameAccount !== null) {
            console.log(gameAccount);
            return;
        }
        // const baseUrl = gameConfig.gameBaseUrl;

        try {
            const freeAccount = algosdk.generateAccount();
            const payload = {
                addr: freeAccount.addr,
                age: data.age,
                club: data.club,
                mn: algosdk.secretKeyToMnemonic(freeAccount.sk),
                password: data.password,
            }

            const axiosResponse = await axios.post(
                `https://localhost/account/`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

            if (axiosResponse && axiosResponse.data.status) {
                setGameAccount({"account":axiosResponse.data.data,"version":1});
            }
        }
        catch (err) {
            console.log("err", err);
        }
    }

    let challengePoints = 0;
    const usersAssets: AppData[] = [];

    if (!activeAccount && !gameAccount) {
        return (
            <Sheet>
                <section className="space-top-4 p-8 pt-6">
                    <div className="space-y-3.5">
                        <h2 className="text-3xl font-bold tracking-tight">Connect your wallet</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="text-balance text-sm leading-loose text-muted-foreground">
                                To collect rewards, you must connect your Algorand wallet with the game.
                                If you want to try out the game without wallet, you can
                                <SheetTrigger asChild>
                                    <a href="#" className="text-gray-200 font-bold"> create a game account </a>
                                </SheetTrigger>
                                and transfer the rewards later.
                                However, it is better to <span className="text-gray-300">get a wallet</span> now,
                                as it can be used for more than just this game.
                                You'll also need the wallet so that the rewards can be exchanged for tickets, jerseys and other things.
                            </div>
                            <div className="bg-slate-800 h-48 p-3">
                                <div className="text-balance text-sm leading-loose text-muted-foreground mb-3">
                                    Next step: Get your Algorand wallet
                                </div>
                                <div className="grid grid-cols-3 grid-rows-3 gap-4">
                                    <div>
                                        <div className="w-24 mb-4">
                                            <a href="https://perawallet.app" target="_blank" className="flex justify-center content-center items-center">
                                                <img
                                                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAk1BMVEX/7lUAAAD/8Fb/9Ff/8lb/9Vf/91jy4lH97FTv31Ds3E/25lLCtUGWjDLMvkTf0ErZy0iHfi2uojpXUR0QDwWQhjCmmze0qDyckjRzayZJRBi7rz46NhMbGQmjmDZ/dipmXyJEQBc0MBHGuUInJA1sZSReVx9QSxt4cCgiHwvk1UwxLhHTxUZiWyELCgMcGgkqJw05mSVFAAAIsUlEQVR4nO2daVfqMBCG6WTSlhZkkVVwQUQBEf3/v+6CiLdNJm2CFNqcPOfcc7+ozdtsk1nSWs3hcDgcDofD4XA4HA6Hw+FwOBwOh8PhqBzIEK7dhkLhm2Y34hZr9Dvejj5YK5EPvG9ua5ZKhGDr/Ui0tBex6x1Z8ms3phDw9VehN2TXbk0BQND7r9CLLBynsE4I9Bb+tdtzfnCSVOi18doNOjtslFI4tVBhP6XQm1gnkXfSCt+sU8iWaYX2zUQ2FhQubNsTpT706pbtieI89LyBZZ3I+6LCe8t2fdYUFdq21rCBpLBv1xEDG5LCd7vOiWnL+0DLqmEKdVnhg1WrKcQrSeGHVX1Yw1tJ4Ta2aiLyR3mYbqzqxIQn6peRVRMRN7LCJ6sU1oJPWaJVo7Tm38kKA6uWGtGPsadhVSfiXFbY1VYIe4ps3hmAUFb4qGN8AzKOYRzH4e7/Uqv05T3/LveMCOjH7Yfx6/NqtZp+dBqRX+KBTeyInzkKgdcai5S5t13clDfGCpE8TDPnFrCYWJ2816i02yi+Sa3NCNEAr1P69jTKenYmzvnqIyLig0KfV97wHDFMlbY3b03VAj1vUtJe5E9iS29ohYByd6dZl3NJlTd9WiGGoodcYlZcJwIeOMXEAHzXUYjBLE9gUcErYIjxZj6ZTBo36xCRMTTTKa01lEKMiFOI3IkFGHGA9cFr8iHTcXMSxdwglQtAaCex0iCxbVKc36EMQG5PX0+jdqxtSjFhC1hLLwfrL3oKm2efib60EP6y+hjuROr0JMS91G9KvigIZ3oCvdtzj1Lq8JN6YDfQGa5smPwlOTrDPjQFEm/njwipBhSLmzDXKgZImm63okJfDuAoObeDgPKVSUxHQZ5GbCV+XnS2YVtfIDGH/wbEes99rOdo5InFRjBLIXw2UHh2byvXHUB5Gv3F8SefhS7UfkQxCgHkMzpNb1TLejiEx9VEsEuQiE9lcO5RujemRJtLyXPbz3g8/JidT8J7+N+5WhQQ9cBYtxc9rwMZ3Qj+ZDfhOqHw51v5fzZBr4i4DiARXlEwDbJGKvpBTZytfu6BIsXZd/yDRNbY5j/7wH078yAuGc6UGyeLTkHnJxbrv2mzKDbT2XATzIs6AwNvyw4lmpXRTCH8VFlsC8ypQj6f6bViaZAUZDpIPwr11CDM9VZVg3xuHOb/uSQFJ6gCYktnPho0Q058y2RbfAQD/Xg4O6NCMJuG5z//Um1C3hplj1b91YCKTGURXih4gQyjrnq4GrimDRVepAuPTdupbHXH93IrblsGzaByptQ8X6oLjyByP9hM+k9v06/7Xq+3mr4th2aRPrPNorDdPrOJO5ncD+N6FEVByE2jtUYKF1eMWsAh3n6CO9xkHpY+ok9horCaycUAM12B3ZJG1vKgMvtI+iWNjuZCpEmTjMubqJBH0MuXtxOY5QAqOXJFBkGn3ClD2ehYNQ/VHaJ7eEbyxYFNRVfRX4i0sCQlzhTSBeJZhsBulge2KqBa4jgv4FMRQOHLGEcV3iTSAG9LwfTn5toafXsQW/1EBOiu2c4PLFcN5BjMu4PBoDtpoa3XEu0Tr9h35tW1W+JwOMoIIDf2s1UIYDwadhbLbmYuRnUBXn841kZYeU2Sv074koqNX14FHqRs5p5t93ogF9Obz5+wdE2At8TqyZ5VExGI6pZpJUMLCshcsFMuDoREoUOZ3g8narRPyIwEDnHQbuwLHTbrQzFlOfZUoF2AK9PoIa77qZEwW3SGraAE1pEqla9r6PcLpVuk9ny+deaRf9UjMIavVMu8rWGYnRGF7Efemxu4mkgMFC0zLA8U7lSUWTbiq4xXDBTVLXeGS2FuKd5uwD7ewMUdUuryHUVRofov5fXhN8+j4LJ13BjJV+oc6JheUwaomZY7brHLacRY1YMv5tu1bvzX857a/EIaMxILlJnBoF4siNvcMjReYj4C0NvEjoHKXsNws1Z1AGgFgH9YxheIsqlz9pVpwd/LyfNG1Tg/NzyaYFj41sGVSefKjeJYs6VMhuE3mpWVez7qxc5GdYXZizJ3nc+8HIkYk6YbTa9dpJtErANNEKlebeKlKPMKwagbh0WWqyvLZdUJZ8kLhtSVkYgDIk9Vgal1r4+68kO5jOwWksQdEFLh6H+AxyOtxKHs9/k31GkvGVVA6czDScbbBxbr9uOqoCtelSV0WWVO6bXpM7OWBhhv6FVzFFNyQV0st6eXWceFN6kfzrtrD/11P/NqkwPF1HYpqpNelKvo4bfShuc2znsM8HDTUZn2RwrJwxQ648gszh4wYsnPKP/tA/Jau/mVpbAQrzOS9ugyz4qSivm1zh+AzA8mS8V43c6L6ELqrty9sZ3XXkmh9mXeu65k0WY0vhM2kdkos0b1ZKiLFe41Mgal35ua2M77K+nCINoMR/3O43jZ6T/M6yErxvgmLpJ9CjXepeyJMfV0wN4jzhhnu3/c9Fock8dIk2GilZAlFxeOyxlglBQ+1vXmk3wxyn1QcFtPQ1A4a+vOJuLql2E5whIimDDZZg195x5hCYkXKpQEWP9Yxb3xxsTpRe0yJb3qGoPm7WzRmQdmTj15iSrvt3T2URI0DyL4svmldTtrdeCEtWeXQsrlW80iOxXUfQIDuxQSd8+8WvWhGWox/bLrc51IhIvt+kYJFXqx7EZ2IkRY1C1B14Gqt3+tfC1aEqjJE/G9pKbpiVA1W3YloVJ+SLsWUwjkcERJT8GnQtTA2vUlHSovyK7tgrrbY2xXH9Z86Yx4a9c8JMwa2757DCCupivLFMoH/XvbFEo+ResU1riQA9CzTqGYTPVlnULRqTizT6HQiZZ9pvObdDaOZVbbN+mjvmWW94FURN+u75D+AJDwZpQzDvxXEp+RsewzpL+wX3eGXf7SBPznKGxaPFQh2Pc31dQ54RaAfN6c6GQaVRhbrw5yOBwOh8PhcDgcDofD4XA4HA6Hw+FwWM4/HqBml7Y9u0kAAAAASUVORK5CYII="
                                                    alt="Pera Wallet"
                                                    className="w-5 mr-1 rounded-full"
                                                />
                                                <p className="text-xs font-bold tracking-tight">Pera</p>
                                            </a>
                                        </div>
                                        <a href="https://apps.apple.com/us/app/algorand-wallet/id1459898525"
                                           target="_blank">
                                            <img src="/assets/apple-app-store.svg" alt="apple" className="w-24 mb-4"/>
                                        </a>
                                        <a className="w-5 mb-4"
                                           target="_blank"
                                           href="https://play.google.com/store/apps/details?id=com.algorand.android">
                                            <img src="/assets/play-store.svg" alt="playStore" className="w-24 mb-4"/>
                                        </a>
                                    </div>

                                    <div>
                                        <div className="w-24 mb-4">
                                            <a href="https://defly.app" target="_blank" className="flex justify-center content-center items-center">
                                                <img
                                                    src="data:image/png;base64,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"
                                                    alt="defly Wallet"
                                                    className="w-5 mr-1 rounded-full"
                                                />
                                                <p className="text-xs font-bold tracking-tight">Defly</p>
                                            </a>
                                        </div>
                                        <a href="https://apps.apple.com/us/app/defly/id1602672723" target="_blank">
                                            <img src="/assets/apple-app-store.svg" alt="apple" className="w-24 mb-4"/>
                                        </a>
                                        <a className="w-5 mb-4"
                                           target="_blank"
                                           href="https://play.google.com/store/apps/details?id=io.blockshake.defly.app">
                                            <img src="/assets/play-store.svg" alt="playStore" className="w-24 mb-2"/>
                                        </a>
                                    </div>

                                    <div>
                                        <div className="w-24 mb-4">
                                            <a href="https://web.daffiwallet.app" target="_blank" className="flex justify-center content-center items-center">
                                                <img
                                                    src="/assets/daffiWalletLogo.jpg"
                                                    alt="daffi Wallet"
                                                    className="w-5 mr-1 rounded-full"
                                                />
                                                <p className="text-xs font-bold tracking-tight">Daffi</p>
                                            </a>
                                        </div>
                                        <a href="https://apps.apple.com/kn/app/daffiwallet/id1659597876"
                                           target="_blank">
                                            <img src="/assets/apple-app-store.svg" alt="apple" className="w-24 mb-4"/>
                                        </a>
                                        <a className="w-5 mb-4"
                                           target="_blank"
                                           href="https://play.google.com/store/apps/details?id=me.daffi.daffi_wallet">
                                            <img src="/assets/play-store.svg" alt="playStore" className="w-24 mb-2"/>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <SheetContent className="bg-slate-900">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(createAccount)}>
                            <SheetHeader>
                                <SheetTitle>Create Game Account</SheetTitle>
                                <SheetDescription>
                                    Make changes to your profile here.<br/>Click "Create Account" when you're done.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="club"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Your favorite football club</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="w-full"
                                                        placeholder="e.g. FC Barcelona"
                                                        autoComplete="off"
                                                        type="text"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="w-full"
                                                        autoComplete="off"
                                                        type="password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="age"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Age</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="w-1/2"
                                                        placeholder="21"
                                                        type="number"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <SheetFooter>
                                <SheetClose asChild>
                                    <Button type="submit">Create Account</Button>
                                </SheetClose>
                            </SheetFooter>
                        </form>
                    </Form>
                </SheetContent>

            </Sheet>
        );
    }

    if (!activeAccount) {
        return (
            <>
                <section className={"space-top-4 p-8 pt-6"}>
                    <div className="flex items-center justify-between space-y-3.5 mb-3">
                        <h2 className="text-3xl font-bold tracking-tight">Your Account</h2>

                        <div className="flex items-center space-x-2">
                            <p>
                                Address: <span>{gameAccount.account.slice(0, 5)}...{gameAccount.account.slice(-5)}</span>
                            </p>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    const cp = optedAssets?.find((asset) => (asset["asset-id"] === Number(gameConfig.gameAssetId)));

    if (cp) {
        challengePoints = cp.amount / 10;
    }

    optedAssets?.map((asset) => {
        if (asset["asset-id"] !== assetIds[0]) {
            appData.find(appData => appData.assetId === asset["asset-id"] ? usersAssets.push(appData) : null);
        }
    });

    return (
        <>
            <section className={"space-top-4 p-8 pt-6"}>
                <div className="flex items-center justify-between space-y-3.5 mb-3">
                    <h2 className="text-3xl font-bold tracking-tight">Your Account</h2>

                    <div className="flex items-center space-x-2">
                        <p>
                            Address: <span>{activeAccount.address.slice(0, 5)}...{activeAccount.address.slice(-5)}</span>
                        </p>
                        <div className="grid gap-2">
                            {activeProvider && (
                                <img
                                    src={activeProvider?.metadata.icon}
                                    alt={activeProvider?.metadata.name}
                                    className={"w-6 mr-1 rounded-full"}
                                    title={activeProvider?.metadata.name}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2"><h3
                            className="tracking-tight text-sm font-medium">ALGO Balance</h3>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 244" fill="currentColor"
                                 stroke="none"
                                 style={{width: "23px", height: "23px"}}>
                                <polygon
                                    points="239.2,240.3 201.8,240.3 177.5,150 125.4,240.3 83.6,240.3 164.3,100.6 151.3,52 42.6,240.4 0.8,240.4 138.6,1.6 175.2,1.6 191.2,61 228.9,61 203.1,105.7"/>
                            </svg>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="text-2xl font-bold">{walletBalance}</div>
                            {walletAvailableBalance !== walletBalance && (
                                <p className="text-xs text-muted-foreground">
                                    Available balance: {walletAvailableBalance}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Challenge Points</h3>
                            <svg version="1.1"
                                 xmlns="http://www.w3.org/2000/svg"
                                 viewBox="0 0 512 512"
                                 style={{width: "24px", height: "24px"}}>
                                <path className="fill-blue-300"
                                      d="M386.2,0l-3.2,5.3l-44.6,73.1H175.4L127.8,0L386.2,0z"/>
                                <path className="fill-blue-400"
                                      d="M389.6,0L466,95.8l-89.5,153.7c-22.6-25.9-53.5-44.4-88.5-51.3L386.4,5.3l-0.8,1.3l3.6-6.6H389.6z"/>
                                <path className="fill-blue-800"
                                      d="M137.5,249.5L48,95.8L124,0h0.2l6.5,11.2L129.5,9l96.8,189.1C191.1,205,160.1,223.5,137.5,249.5L137.5,249.5z"
                                />
                                <circle className="fill-blue-700" cx="257" cy="353.6" r="158.5"/>
                                <path className="fill-blue-100" d="M257.1,233.9c65.8,0,119.2,53.4,119.2,119.2c0,65.8-53.4,119.2-119.2,119.2c-65.8,0-119.2-53.4-119.2-119.2
	C137.9,287.3,191.3,233.9,257.1,233.9z"/>
                                <path className="fill-blue-950" d="M260.6,285.7l18.7,43.8l47.5,4.3c2.1,0.2,3.6,2,3.5,4.1c-0.1,1-0.5,1.9-1.3,2.5v0l-35.9,31.3l10.6,46.5
	c0.5,2.1-0.8,4.1-2.9,4.6c-1,0.2-2.1,0-2.9-0.5l-40.8-24.4l-40.9,24.5c-1.8,1.1-4.1,0.5-5.2-1.3c-0.5-0.8-0.7-1.8-0.4-2.8l0,0
	l10.6-46.5l-35.9-31.3c-1.6-1.4-1.7-3.8-0.4-5.4c0.7-0.8,1.6-1.2,2.7-1.3l47.3-4.2l18.7-43.8c0.8-1.9,3.1-2.8,5-2
	C259.5,284,260.2,284.8,260.6,285.7z"/>
                            </svg>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="text-2xl font-bold">{challengePoints / 10}</div>
                            <p className="text-xs text-muted-foreground">Howto get Challenge Points</p></div>
                    </div>

                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Scouting Points</h3>
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                                 style={{width: "24px", height: "24px"}}>
                                <path className="fill-blue-800" d="M349.3,218.2c5.3,0,9.8-4.3,9.8-9.8c0-5.3-4.3-9.8-9.8-9.8H243.5c-5.5,0-9.8,4.5-9.8,9.8c0,5.5,4.5,9.8,9.8,9.8
	H349.3L349.3,218.2z M192.6,320.4c6.5,0,11.9,4.4,11.9,11.1v73.3h7.2v-35c0-14.1,22.3-13.7,22.3,0.8v35l0.4-0.1h7.8v-27.8
	c0-14.1,22.3-13.7,22.3,0.8v25.8l0.1,0l7.8,0v-19.7c0-14.1,22.3-13.7,22.3,0.8c0,16.3,0.9,35.5,0.3,51.8c-0.7,17.9-4.3,38-17.3,49.2
	c-16.4,13.3-32.9,16.9-49.9,14.2c-30.7-4.8-38.5-23.7-53-46.8l-37.1-58.8c-2.3-5.4-2-9,0.3-11.3c9.9-6.4,25.9,7.2,43.6,26.4l0.6-0.1
	v-79.3C182.3,325.1,186.9,320.4,192.6,320.4z M161.8,0h189.3c16,0,30.5,6.5,40.9,17C402.6,27.5,409,42,409,57.9v396.6
	c0,16-6.5,30.5-16.9,40.9c-10.5,10.5-25,17-40.9,17h-90.4c8.5-2.8,16.8-7.4,25.1-13.9l1.3-1c8.5-7.4,14-17.3,17.3-28.1l0.2-0.7
	c3-9.9,4.2-20.7,4.6-30.7c0.1-1.9,0.1-3.9,0.2-5.9h81V57.3H122.4v326c-0.4,1.5-0.6,3-0.6,4.5c-0.1,2.1,0.1,4.3,0.6,6.6v37.5h21.5
	l18.7,29.6l4.8,7.8c12,19.7,21.7,35.7,46.5,42.9h-52.1c-16,0-30.5-6.5-40.9-17c-10.5-10.5-16.9-25-16.9-40.9V57.8
	c0-16,6.5-30.5,16.9-40.9C131.5,6.3,145.9,0,161.8,0z M157.6,272.1h48.6c3.7,0,6.7,3,6.7,6.7v36.4c-0.6-0.7-1.2-1.4-1.9-2
	c-3.2-3-7.1-5.1-11.4-6.2v-21.5h-35.2v34.4h6.2c-1.7,3.4-2.6,7.2-2.6,11v2.3h-10.3c-3.7,0-6.7-3-6.7-6.7v-47.7
	C151,275.1,154,272.1,157.6,272.1L157.6,272.1z M349.3,312.4c5.3,0,9.8-4.3,9.8-9.8c0-5.3-4.3-9.8-9.8-9.8H243.5
	c-5.5,0-9.8,4.5-9.8,9.8c0,5.5,4.5,9.8,9.8,9.8H349.3z M153.4,123.9c-3.2-3.8-2.8-9.6,1.1-12.8s9.6-2.8,12.8,1.1l8.1,9.6l20.8-26.1
	c3.1-3.9,8.9-4.6,12.8-1.5c3.9,3.1,4.6,8.9,1.5,12.8l-27.8,34.8l-1.3,1.3c-3.8,3.2-9.6,2.8-12.8-1.1L153.4,123.9L153.4,123.9z
	 M349.3,128.2c5.3,0,9.8-4.3,9.8-9.8c0-5.3-4.3-9.8-9.8-9.8H243.5c-5.5,0-9.8,4.5-9.8,9.8c0,5.5,4.5,9.8,9.8,9.8H349.3L349.3,128.2z
	 M157.6,177.8h48.6c3.7,0,6.7,3,6.7,6.7v47.7c0,3.7-3,6.7-6.7,6.7h-48.6c-3.7,0-6.7-3-6.7-6.7v-47.7
	C151,180.8,154,177.9,157.6,177.8z M199.5,191.2h-35.2v34.4h35.2V191.2L199.5,191.2z"/>
                            </svg>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">Howto get Scouting Points</p></div>
                    </div>

                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">TikiTaka360° NFTs</h3>
                            <svg version="1.1"
                                 xmlns="http://www.w3.org/2000/svg"
                                 viewBox="0 0 512 512"
                                 style={{width: "24px", height: "24px"}}>
                                <path className="fill-blue-600" d="M262,88.8l130.4,69.1c3.6,2.1,5.9,6,5.9,10.2v138.3c0,2.3-0.6,4.5-1.8,6.3c-1.1,1.8-2.8,3.3-4.7,4.3
	l-129.8,68.8c-1.8,1-3.9,1.6-6,1.5c-2.1,0-4.1-0.6-5.9-1.6l-130.4-69.1c-1.8-1.1-3.3-2.6-4.3-4.3l-0.2-0.4c-0.9-1.7-1.4-3.6-1.4-5.5
	V168.1c0-2.2,0.6-4.4,1.8-6.3c1.2-1.8,2.8-3.3,4.7-4.3l129.8-68.8c1.9-1.1,3.9-1.6,6-1.6C258.2,87.2,260.2,87.8,262,88.8L262,88.8z
	 M381.6,386c-4.6-1.9-9.7-1.9-14.3,0c-2.2,0.9-4.2,2.3-5.9,3.9l-0.1,0.1c-1.5,1.5-2.7,3.3-3.6,5.2h-29.8v-24.8l-16.7,8.9v24.3
	c0,2.3,0.9,4.4,2.5,5.9c1.6,1.6,3.7,2.4,5.9,2.4h38.4c2,3.9,5.4,7,9.4,8.7c4.5,1.9,9.6,1.9,14.1,0l0.1,0c7-2.9,11.5-9.7,11.5-17.3
	S388.6,388.9,381.6,386L381.6,386z M423.6,360.1c-1.9-4.6-1.9-9.7,0-14.3c1.8-4.2,5.1-7.7,9.2-9.7v-29.7h-17.1v-16.7h25.4
	c2.3,0,4.4,0.9,5.9,2.4c1.6,1.6,2.4,3.7,2.4,5.9v38.4c3.9,2,7,5.4,8.7,9.4c1.9,4.5,1.9,9.6,0,14.1l0,0.1c-2.9,7-9.7,11.5-17.3,11.5
	C433.3,371.6,426.5,367.1,423.6,360.1L423.6,360.1z M476.5,264.6h-60.8l0-16.7h60.8c2-4,5.4-7.2,9.6-8.9c4.5-1.9,9.6-1.9,14.2-0.1
	l0.1,0.1c7,2.9,11.5,9.7,11.5,17.3c0,7.6-4.6,14.4-11.6,17.3c-4.5,1.9-9.6,1.9-14.1,0l-0.1,0C482,271.9,478.5,268.7,476.5,264.6
	L476.5,264.6z M492.4,219h-76.6v-16.7h68.3V148c-3.6-2.1-6.4-5.2-8-9.1c-1.9-4.6-1.9-9.7,0-14.3c2.9-7,9.7-11.6,17.3-11.6
	c7.6,0,14.4,4.6,17.3,11.6c1.9,4.5,1.9,9.6,0.1,14.1l-0.1,0.1c-1.9,4.5-5.4,8.1-9.9,10v61.8c0,2.3-0.9,4.4-2.4,5.9
	C496.7,218.2,494.6,219,492.4,219L492.4,219z M427,178.8h-11.3v-11.6h0.1c0-1.7-0.2-3.4-0.5-5.1h3.4v-24.6c-4.1-2-7.4-5.4-9.1-9.7
	c-1.9-4.6-1.9-9.7,0-14.3c2.9-7,9.7-11.6,17.3-11.6c7.5,0,14.3,4.5,17.2,11.4l0.1,0.1c1.9,4.6,1.9,9.7,0,14.3
	c-1.7,4.1-4.8,7.5-8.8,9.5v33.1c0,2.3-0.9,4.4-2.5,5.9C431.3,177.9,429.2,178.8,427,178.8L427,178.8z M136.1,88.4
	c4.2-1.8,7.7-5.1,9.7-9.2h29.7v29.4l16.7-8.8V70.9c0-2.3-0.9-4.4-2.4-5.9c-1.6-1.6-3.7-2.4-5.9-2.4h-38.4
	c-4.4-8.6-14.7-12.3-23.6-8.7l-0.1,0c-7,2.9-11.6,9.7-11.6,17.3c0,2.5,0.5,4.9,1.4,7.1C115.6,87.8,126.5,92.4,136.1,88.4z
	 M217.2,35.5v51l16.7-8.8V35.5c4-2,7.2-5.4,8.9-9.6c1.9-4.5,1.9-9.6,0.1-14.2l-0.1-0.1c-2.9-7-9.7-11.5-17.3-11.5
	c-7.6,0-14.4,4.6-17.3,11.6c-1.9,4.5-1.9,9.6-0.1,14.2l0.1,0.1C210,30,213.2,33.5,217.2,35.5z M262.8,19.6c0,8.8-1.8,30.5-2.3,50.3
	c3.3,0.5,6.5,1.7,9.3,3.3l9.6,5.1V27.9h54.4c0.3,0.5,0.6,0.9,0.9,1.4c2.1,3,4.9,5.2,8.2,6.6c4.5,1.9,9.7,1.9,14.3,0
	c4.6-1.9,8.2-5.5,10.1-10.1c0.9-2.2,1.4-4.6,1.4-7.1c0-7.6-4.6-14.4-11.6-17.3c-4.5-1.9-9.6-1.9-14.1,0L343,1.4
	c-2.3,0.9-4.3,2.3-6.1,4.1c-1.1,1.1-2,2.2-2.8,3.6c-0.4,0.7-0.8,1.5-1.2,2.3h-61.8c-2.3,0-4.4,0.9-5.9,2.4
	C263.7,15.3,262.8,17.4,262.8,19.6L262.8,19.6z M303,85v5.8l16.7,8.8v-6.3h24.6c2,4.1,5.5,7.3,9.7,9.1c4.5,1.9,9.7,1.9,14.3,0
	c7-2.9,11.6-9.7,11.6-17.3c0-7.5-4.5-14.3-11.4-17.2l-0.1-0.1c-4.6-1.9-9.7-1.9-14.3,0c-4.1,1.7-7.5,4.8-9.5,8.8h-33.1
	c-2.3,0-4.4,0.9-5.9,2.4C303.9,80.7,303,82.8,303,85L303,85z M88.4,113.6c1.9,4.6,1.9,9.8,0,14.3c-1.8,4.3-5.1,7.7-9.2,9.7v29.7
	h17.1V184H70.9c-2.3,0-4.4-0.9-5.9-2.4c-1.6-1.6-2.4-3.7-2.4-5.9v-38.4c-3.9-2-7-5.4-8.7-9.4c-1.9-4.5-1.9-9.6,0-14.2l0-0.2
	c2.9-7,9.7-11.5,17.3-11.5C78.7,102,85.5,106.6,88.4,113.6L88.4,113.6z M35.5,209h60.8v16.6H35.5c-2,4-5.4,7.2-9.6,8.9
	c-4.5,1.9-9.6,1.9-14.1,0.1l-0.1-0.1c-7-2.9-11.5-9.7-11.5-17.3c0-7.6,4.6-14.4,11.6-17.3c4.5-1.9,9.6-1.9,14.1-0.1l0.1,0.1
	C30,201.8,33.5,205,35.5,209L35.5,209z M19.6,254.6h76.7v16.7H27.9v54.4c3.6,2.1,6.4,5.2,8,9.1c1.9,4.6,1.9,9.7,0,14.3
	c-2.9,7-9.7,11.5-17.3,11.5C8.4,360.6,0,352.2,0,341.9c0-2.4,0.5-4.8,1.4-7l0.1-0.1c1.9-4.5,5.4-8.1,9.9-10v-61.8
	c0-2.3,0.9-4.4,2.4-5.9C15.3,255.5,17.4,254.6,19.6,254.6L19.6,254.6z M85,294.8h11.3v12.5h-0.1c0,1.4,0.1,2.8,0.3,4.2h-3.2v24.6
	c4.1,2,7.3,5.4,9.1,9.7c1.9,4.6,1.9,9.7,0,14.3c-2.9,7-9.7,11.6-17.3,11.6c-7.5,0-14.3-4.5-17.2-11.4l-0.1-0.1
	c-3.7-9,0.1-19.4,8.8-23.8v-33.1c0-2.3,0.9-4.4,2.4-5.9C80.7,295.7,82.8,294.8,85,294.8z M286.2,439v-46.4l-16.5,8.7l-0.2,0.1V439
	c-4,2-7.2,5.4-9,9.6c-1.9,4.5-1.9,9.6,0,14.2l0,0.1c2.9,7,9.7,11.5,17.3,11.5c7.6,0,14.4-4.6,17.3-11.6c1.9-4.5,1.9-9.6,0-14.1
	l0-0.1C293.4,444.4,290.2,441,286.2,439L286.2,439z M240.6,454.8v-54.5l-16.7-8.8v55h-54.4c-2.1-3.6-5.3-6.4-9.1-8
	c-4.6-1.9-9.7-1.9-14.3,0c-7,2.9-11.5,9.7-11.5,17.3c0,7.5,4.6,14.4,11.6,17.3c4.5,1.9,9.6,1.9,14.1,0l0.1,0c4.5-1.9,8.1-5.4,10-9.9
	h61.8c2.3,0,4.4-0.9,5.9-2.5C239.7,459.2,240.6,457,240.6,454.8L240.6,454.8z M200.3,389.5v-10.4l-16.7-8.8v10.9h-24.6
	c-2-4.1-5.5-7.4-9.7-9.1c-4.6-1.9-9.7-1.9-14.3,0c-7,2.9-11.6,9.7-11.6,17.3c0,7.5,4.6,14.3,11.4,17.2l0.1,0.1
	c4.6,1.9,9.7,1.9,14.3,0c2.2-0.9,4.2-2.3,5.9-3.9l0.2-0.1c0.9-0.9,1.7-1.9,2.4-3c0.4-0.6,0.7-1.1,1-1.7H192c2.3,0,4.4-0.9,5.9-2.5
	C199.5,393.8,200.3,391.7,200.3,389.5L200.3,389.5z M161.6,275.2v-75.9h23.9l14.9,28h2.8v-28h24.4v75.9h-24l-14.6-30h-2.9v30H161.6
	L161.6,275.2z M238.5,275.2v-75.9h50.7v18.5h-26.4v16.8h20.1v17.7h-20.1v22.9H238.5z M297.9,219.1v-19.8h52.5v19.8h-13.6v56.1h-24.4
	v-56.1L297.9,219.1L297.9,219.1z M261.8,107.6c37.1,20.2,75.3,39.6,112.7,59.3c4.2,2.2,6.6,6.5,6.6,11l0,118.7c0,5.1-3,9.5-7.4,11.4
	l-111.9,58.9c-3.6,1.9-8,1.9-11.6,0c-37.1-20.2-75.3-39.6-112.7-59.3c-4.2-2.2-6.6-6.5-6.6-11l0-118.7c0-5.1,3.1-9.5,7.4-11.4
	l111.9-58.9C254,105.6,258.3,105.7,261.8,107.6z"/>
                            </svg>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="text-2xl font-bold">{usersAssets.length}</div>
                            <p className="text-xs text-muted-foreground">Howto get TikiTaka360° NFTS</p></div>
                    </div>
                </div>
            </section>

            <div>
                {usersAssets && usersAssets.length > 0 && (
                    <div className="overflow-x-auto flex snap-mandatory snap-x">
                        {usersAssets.map((appData: AppData, index) =>
                            <div key={index}>
                                <NftViewer appData={appData} amount={10}/>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}

export default Account
