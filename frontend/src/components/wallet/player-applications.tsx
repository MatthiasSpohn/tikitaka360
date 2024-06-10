import {useEffect, useState} from "react";
import algodClient from "@/lib/algodClient.ts";
import {useQuery} from "@tanstack/react-query";
import indexerClient from "@/lib/indexerClient.ts";
import {ApplicationResult} from "@algorandfoundation/algokit-utils/types/indexer";
import { getGameConfigFromViteEnvironment } from "@/config/getGameConfigs.ts";

export default function PlayerApplications() {
    const [ createdApps, setCreatedApps] = useState<ApplicationResult[] | undefined>(undefined)
    const gameConfig = getGameConfigFromViteEnvironment()
    const creatorAddress = gameConfig.gameCallerAddress;

    const getAccountInfo = async () => {
        return await algodClient.accountInformation(creatorAddress).exclude('none').do();
    }

    const getApplicationInfo = async (id: number | bigint) => {
        return await algodClient.getApplicationByID(id as number).do()
    }

    const getAppAccountInfo = async (appId: number) => {
        return await indexerClient.lookupApplications(appId).do();
    }

    const { data: accountInfo } = useQuery({
        queryKey: [],
        queryFn: getAccountInfo,
        enabled: !!creatorAddress,
    });

    useEffect(() => {
        if ( accountInfo ) {
            setCreatedApps(accountInfo['created-apps'])
        }
    }, [accountInfo])

    return {
        createdApps,
        getApplicationInfo,
        getAppAccountInfo
    };
}
