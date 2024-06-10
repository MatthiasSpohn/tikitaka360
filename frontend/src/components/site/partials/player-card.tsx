import {Avatar, AvatarImage} from "@radix-ui/react-avatar";
import {Button} from "@/components/ui/button.tsx";
import {NftType} from "@/interfaces/tikitaka.ts";
import {useQuery} from "@tanstack/react-query";
import AppAssets from "@/components/wallet/app-assets.ts";
import {TealKeyValue} from "algosdk/dist/types/client/v2/algod/models/types";
import {microalgosToAlgos} from "algosdk";
import useTxnHandler from "@/components/wallet/txn-handler.ts";

type Props = {
    appId: number | bigint,
    globalStates: TealKeyValue[] | undefined,
    updateProfile: (arg0: number, arg1: number | undefined) => void
}

export default function PlayerCard(props: Props) {
    const {getPlayerCardClient, optInToAsset, purchaseAsset} = useTxnHandler();

    const appAssets = AppAssets();

    if (!props.appId || !props.globalStates) throw new Error('Player not found.')

    let challengePoints = 100;
    const globals = props.globalStates;
    const reviewValue = globals.find((tealKeyValue) => Buffer.from(tealKeyValue.key, 'base64').toString() === "r")?.value.uint;
    const reviewCount = globals.find((tealKeyValue) => Buffer.from(tealKeyValue.key, 'base64').toString() === "c")?.value.uint;
    const assetID = globals.find((tealKeyValue) => Buffer.from(tealKeyValue.key, 'base64').toString() === "n")?.value.uint;
    const nftPrice = globals.find((tealKeyValue) => Buffer.from(tealKeyValue.key, 'base64').toString() === "p")?.value.uint;

    const fetchNftFromIpfs = async () => {
        if ( !assetID ) {
            throw new Error('Error in ApplicationData.');
        }
        return await appAssets.getAssetInfo(assetID) as NftType | undefined;
    }

    const { data, error, isLoading } = useQuery({
        queryKey: [assetID],
        queryFn: fetchNftFromIpfs,
        enabled: !!assetID,
    });

    const handlePlayer = (player_id: number) => {
        props.updateProfile(player_id, props.appId as number);
    }

    const purchaseNft = async () => {
        if (!assetID) {  throw new Error('Asset not found.') }
        const playerCardClient = getPlayerCardClient(props.appId as number);
        await optInToAsset(assetID as number, playerCardClient);
        await purchaseAsset(props.appId as number, playerCardClient);
    }

    // Error and Loading states
    if (error) return <div>Request Failed</div>;
    if (isLoading) return <div>Loading...</div>;
    if (data) {
        const review = reviewValue?.valueOf() as number ?? 0;
        const price  =  microalgosToAlgos((nftPrice?.valueOf() as number ?? 0));
        const rc = reviewCount?.valueOf() as number ?? 1;
        challengePoints = rc <= 99 ? challengePoints - rc : 1;

        return (
            <div className="min-w-96 flex-none p-3 pl-4">
                <div className="rounded-2xl border-2 border-amber-400 py-3 bg-gradient-to-r from-[rgb(6,6,75)] via-[rgb(16,37,161)] to-[rgb(6,6,75)]">
                    <div className="relative h-[485px]">
                        <div className="flex justify-between justify-items-center">
                            <div className="absolute left-8 top-1.5 w-16">
                                <img className="w-auto h-10"
                                     src={`https://media.api-sports.io/football/leagues/${data.properties.league_id}.png`}
                                     alt="League"
                                />
                            </div>
                            <div className="absolute right-8">
                                <img className="w-10 h-10"
                                     src={`https://media.api-sports.io/football/teams/${data.properties.team_id}.png`}
                                     alt=""
                                />
                                {data.properties.number !== 0 && (
                                    <p className="text-white text-sm text-center">{data.properties.number}</p>
                                )}
                            </div>
                        </div>

                        <div className="absolute top-16 w-full">
                            <Avatar>
                                <AvatarImage src={`https://media.api-sports.io/football/players/${data.properties.player_id}.png`}
                                             alt={data.properties.firstname + ' ' + data.properties.lastname}
                                             className="w-32 h-32 rounded-full mx-auto border-2 bg-gray-400"/>
                            </Avatar>
                            <div className="p-2 mt-5">
                                <h3 className="text-white text-xl font-bold text-center">{data.properties.firstname + ' ' + data.properties.lastname}</h3>
                                <div className="text-center text-gray-400 text-xs font-semibold">
                                    <p>{data.properties.position}</p>
                                </div>
                            </div>
                            <div className="w-full px-12">
                                <table className="my-3 w-full">
                                    <tbody>
                                    <tr>
                                        <td className="px-1 py-0 text-sm text-gray-400 font-semibold text-center">NFT
                                            Price
                                        </td>
                                        <td className="px-1 py-0 text-sm text-gray-400 font-semibold text-center">Assessment</td>
                                        <td className="px-1 py-0 text-sm text-gray-400 font-semibold text-center">CP</td>
                                    </tr>
                                    <tr>
                                        <td className="px-1 py-0 text-sm text-gray-200 text-center">{price} ALGO</td>
                                        <td className="px-1 py-0 text-sm text-gray-200 text-center">{review}</td>
                                        <td className="px-1 py-0 text-sm text-gray-200 text-center">{challengePoints}</td>
                                    </tr>
                                    </tbody>
                                </table>
                                <p className="mt-3 text-xs text-gray-400 text-center">
                                    You will receive {challengePoints} challenge points (CP) for your assessment.
                                </p>
                            </div>
                            <hr className="text-gray-400 mt-5"/>
                            <div className="flex mt-5 mx-5 justify-between justify-items-center">
                                <Button
                                    className="text-xs py-0 px-4 rounded-full"
                                    onClick={() => handlePlayer(data.properties.player_id)}
                                >Make Assessment</Button>
                                <Button
                                    className="text-xs py-0 px-4 rounded-full"
                                    onClick={purchaseNft}
                                >Buy NFT</Button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}
