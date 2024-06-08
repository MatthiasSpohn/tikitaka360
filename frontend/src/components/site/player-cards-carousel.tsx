import PlayerCard from "@/components/site/partials/player-card.tsx";
import {ApplicationResult} from "@algorandfoundation/algokit-utils/types/indexer";
import {useQuery} from "@tanstack/react-query";
import {useEffect, useState} from "react";
import algodClient from "@/lib/algodClient.ts";
import {getGameConfigFromViteEnvironment} from "@/config/getGameConfigs.ts";

type Props = {
    updateProfile: (arg0: number, arg1: number | undefined) => void
    reload: number | undefined
}

export default function PlayerCardsCarousel(props: Props) {
    const gameConfig = getGameConfigFromViteEnvironment()
    const creatorAddress = gameConfig.gameCallerAddress;
    const [ createdApps, setCreatedApps] = useState<ApplicationResult[] | undefined>(undefined)

    const getAccountInfo = async () => {
        return await algodClient.accountInformation(creatorAddress).exclude('none').do();
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

    useEffect(() => {
        getAccountInfo().then((accountInfo) => {
            setCreatedApps(accountInfo['created-apps'])
        })
    }, [props.reload]);

    return (
        <section>
            <div className="overflow-x-auto flex snap-mandatory snap-x">
                {createdApps?.map((app) =>
                    <div key={app.id} className="snap-start">
                        <PlayerCard
                            appId={app.id}
                            globalStates={app.params['global-state']}
                            updateProfile={props.updateProfile}/>
                    </div>
                )}
            </div>
        </section>
    )
}
