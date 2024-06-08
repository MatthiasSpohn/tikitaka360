import {useQuery} from "@tanstack/react-query";
import {NftType} from "@/interfaces/tikitaka.ts";
import AppAssets from "@/components/wallet/app-assets.ts";
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";
import {useState} from "react";
import {getGameConfigFromViteEnvironment} from "@/config/getGameConfigs.ts";

type AppData = {
    appId: number
    assetId: number
    reviewValue: number
    assetPrice: number
}

type Props = {
    appData: AppData,
    amount: number,
}

function NftViewer(props: Props) {
    const gameConfig = getGameConfigFromViteEnvironment()
    const [flip, setFlip] = useState<boolean>(false);
    const baseUrl = gameConfig.gameBaseUrl;
    const appAssets = AppAssets();

    const fetchNftFromIpfs = async () => {
        if ( !props.appData ) {
            throw new Error('Error in ApplicationData.');
        }
        return await appAssets.getAssetInfo(props.appData.assetId) as NftType | undefined;
    }

    const { data, error, isLoading } = useQuery({
        queryKey: [props.appData.assetId],
        queryFn: fetchNftFromIpfs,
        enabled: !!props.appData.assetId,
    });

    if (error) return <div>Request Failed</div>;
    if (isLoading) return <div>Loading...</div>;
    if (data) {
        return (
            <div className="flex-none w-[390px] h-[490px] px-1 lg:px-8 relative" onClick={() => setFlip(!flip)}>
                <div className={`bg-gradient-to-r from-[rgb(6,6,75)] via-[rgb(16,37,161)] to-[rgb(6,6,75)] transform-style-3d transition-transform w-[355px] absolute top-0 backface-hidden ${flip ? 'rotate-y-180' : 'rotate-y-0'}`}>
                    <div
                        className={`h-[480px] w-full py-3 rounded-2xl border-2 border-amber-400`}>
                        <div className="w-full">
                            <Avatar>
                                <AvatarImage
                                    src={baseUrl + 'assets/players/' + data.properties.player_id + '.png'}
                                    alt={data.properties.firstname + ' ' + data.properties.lastname}
                                    className="w-32 h-32 rounded-full mx-auto border-2 bg-gray-400"/>
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div className="p-2 mt-5">
                                <h3 className="text-white text-2xl font-bold text-center">{data.properties.firstname + ' ' + data.properties.lastname}</h3>
                                <div className="text-center text-gray-400 text-xs font-semibold">
                                    <p>{data.properties.position}</p>
                                </div>
                            </div>
                            <div className="w-full px-12">
                                <table className="my-3 w-full">
                                    <tbody>
                                    <tr>
                                        <td className="px-1 py-0 text-sm text-gray-400 font-semibold">Your
                                            Assessment
                                        </td>
                                        <td className="px-1 py-0 text-sm text-gray-200 ">{props.appData.reviewValue}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-1 py-0 text-sm text-gray-400 font-semibold ">Global
                                            Assessment
                                        </td>
                                        <td className="px-1 py-0 text-sm text-gray-200 ">{props.appData.reviewValue}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-1 py-0 text-sm text-gray-400 font-semibold">NFT
                                            Price
                                        </td>
                                        <td className="px-1 py-0 text-sm text-gray-200">{props.appData.assetPrice / 1_000_000} ALGO</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className={`bg-gradient-to-r from-[rgb(6,6,75)] via-[rgb(16,37,161)] to-[rgb(6,6,75)] transform-style-3d transition-transform w-[380px] absolute top-0 backface-hidden ${flip ? 'rotate-y-0' : 'rotate-y-180'}`}>
                    <div
                        className={`h-[480px] w-full py-3 rounded-2xl border-2 border-amber-400`}>
                        <div className="flex justify-between justify-items-center">
                            <div className="absolute left-8 top-1.5 w-16">
                                <img className="w-10 h-10"
                                     src={'/assets/lilo/80_3_liga.png'}
                                     alt="3. Liga (Germany)"
                                />
                                <p className="text-white text-xs">3. Liga</p>
                            </div>
                            <div className="absolute right-8">
                                <img className="w-10 h-10"
                                     src={baseUrl + 'assets/teams/' + data.properties.team_id + '.png'}
                                     alt=""
                                />
                            </div>
                        </div>
                        {data.properties.season !== 0 && (
                            <p className="text-white text-sm text-center">{data.properties.season}</p>
                        )}
                        {data.properties.firstname !== '' && (
                            <p className="text-white text-sm text-center">{data.properties.firstname}</p>
                        )}
                        {data.properties.lastname !== '' && (
                            <p className="text-white text-sm text-center">{data.properties.lastname}</p>
                        )}
                        {data.properties.nationality !== '' && (
                            <p className="text-white text-sm text-center">{data.properties.nationality}</p>
                        )}
                        {data.properties.position !== '' && (
                            <p className="text-white text-sm text-center">{data.properties.position}</p>
                        )}
                        {data.properties.number !== 0 && (
                            <p className="text-white text-sm text-center">{data.properties.number}</p>
                        )}
                        {data.properties.birthdate !== '' && (
                            <p className="text-white text-sm text-center">{data.properties.birthdate}</p>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

export default NftViewer
