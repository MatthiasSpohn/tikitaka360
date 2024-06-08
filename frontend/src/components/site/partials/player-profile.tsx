import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";
import {Button} from "@/components/ui/button.tsx";
import {NftType} from "@/interfaces/tikitaka.ts";
import {useQuery} from "@tanstack/react-query";
import algodClient from "@/lib/algodClient.ts";
import {ipfsDecoderDecode} from "@/utils/ipfs-decoder.ts";
import {getGameConfigFromViteEnvironment} from "@/config/getGameConfigs.ts";

type Props = {
    id: number,
    amount: number,
    updateProfile: (arg0: number) => void
}

export default function PlayerProfile(props: Props) {
    const gameConfig = getGameConfigFromViteEnvironment()
    const baseUrl = gameConfig.gameBaseUrl;

    // JSON fetcher function
    const getContent = async (url: string ) => {
        const res = await fetch(url);
        return res.json();
    };

    // Asset fetcher function
    const getAssetInfo = async () => {
        if (!props.id) throw new Error('No player id set.')
        const assetInfo = await algodClient.getAssetByID(props.id).do();
        const url = assetInfo.params.url;
        const reserve = assetInfo.params.reserve;
        const name = assetInfo.params.name;
        if (!url || !reserve || !name) {
            throw new Error("Missing url or reserve field.");
        }
        const metaUrl = ipfsDecoderDecode(url, reserve);
        return await getContent(metaUrl)
    }

    const { data, error, isLoading } = useQuery({
        queryKey: ['id', props.id],
        queryFn: getAssetInfo,
    });

    // Error and Loading states
    if (error) return <div>Request Failed</div>;
    if (isLoading) return <div>Loading...</div>;
    if (data && props) {
        const nft = data as NftType;
        const handlePlayer = (player_id: number) => {
            props.updateProfile(player_id);
        }
        return (
            <div className="min-w-96 flex-none p-3 pl-4">
                <div className="rounded-2xl border-2 border-gray-800 py-3 bg-gradient-to-tr from-blue-950 to-slate-900">
                    <div className="bg-no-repeat bg-center bg-[url('/assets/player-card.svg')] relative"
                         style={{height: '485px'}}>
                        <div className="flex justify-between justify-items-center">
                            <div className="absolute left-8 top-1.5 w-16">
                                <p className="text-white text-2xl font-bold text-center">{props.amount}</p>
                            </div>
                            <div className="absolute right-8">
                                <img className="w-10 h-10"
                                     src={baseUrl + 'assets/teams/' + nft.properties.team_id + '.png'}
                                     alt={nft.properties.birthdate}
                                />
                                {nft.properties.number !== 0 && (
                                    <p className="text-white text-sm text-center">{nft.properties.number}</p>
                                )}
                            </div>
                        </div>

                        <div className="absolute top-16 w-full">
                            <Avatar>
                                <AvatarImage src={baseUrl + 'assets/players/' + nft.properties.player_id + '.png'}
                                             alt={nft.properties.firstname + ' ' + nft.properties.lastname}
                                             className="w-32 h-32 rounded-full mx-auto border-2 bg-gray-400"/>
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div className="p-2 mt-5">
                                <h3 className="text-white text-2xl font-bold text-center">{nft.properties.firstname + ' ' + nft.properties.lastname}</h3>
                                <div className="text-center text-gray-400 text-xs font-semibold">
                                    <p>{nft.properties.position}</p>
                                </div>
                            </div>
                            <div className="w-full px-12">
                                <table className="my-3 w-full">
                                    <tbody>
                                    <tr>
                                        <td className="px-1 py-0 text-sm text-gray-400 font-semibold text-center">Nationality</td>
                                        <td className="px-1 py-0 text-sm text-gray-400 font-semibold text-center">Birthdate</td>
                                        <td className="px-1 py-0 text-sm text-gray-400 font-semibold text-center">CP</td>
                                    </tr>
                                    <tr>
                                        <td className="px-1 py-0 text-sm text-gray-200 text-center">{nft.properties.nationality}</td>
                                        <td className="px-1 py-0 text-sm text-gray-200 text-center">{nft.properties.birthdate}</td>
                                        <td className="px-1 py-0 text-sm text-gray-200 text-center">{props.amount}</td>
                                    </tr>
                                    </tbody>
                                </table>
                                <p> You will receive {props.amount} challenge points (CP) for your review. </p>
                            </div>
                            <div className="mt-5 text-center">
                                <Button
                                    className="text-xs py-0 px-4 rounded-full"
                                    onClick={() => handlePlayer(nft.properties.player_id)}
                                >review</Button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )
    }

}
