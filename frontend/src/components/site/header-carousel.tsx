import axios from "axios";
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";
import {Button} from "@/components/ui/button";
import {PlayerObject} from 'src/interfaces/tikitaka';
import {getGameConfigFromViteEnvironment} from "@/config/getGameConfigs.ts";
import {useQuery} from "@tanstack/react-query";

type Props = {
    liga: number
    season: number
    team_id: number
    team_name: string
    team_logo: string
    updateProfile: (arg0: number, arg1: number | undefined) => void
}

export default function HeaderCarousel(props: Props) {
    const gameConfig = getGameConfigFromViteEnvironment()
    const baseUrl = gameConfig.gameBaseUrl;

    let players: PlayerObject[] = [];

    const fetchData = async () => {
        return await axios.get(
            `${baseUrl}api.php?action=players&season=${props.season}&liga=${props.liga}&team=${props.team_id}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
    }

    const {status, data: axiosResponse, error} = useQuery({
        queryKey: [props.team_id, props.liga, props.season],
        queryFn: fetchData,
        staleTime: Infinity,
    });

    if (status === 'error') {
        console.error(error)
    }

    const handlePlayer = (player: PlayerObject) => {
        props.updateProfile(player.player_id, undefined);
    }


    if (status === 'success' && axiosResponse) {
        if (axiosResponse.data.length > 0) {
            players = axiosResponse.data as PlayerObject[];
        }

        return (
            <section>
                <div className="overflow-x-auto flex snap-mandatory snap-x">
                    {players.map((object) =>
                        <div key={object.player_id} className="snap-start">
                            <div className="min-w-96 flex-none p-3 pl-4">
                                <div
                                    className="rounded-2xl border-2 border-gray-200 py-3 bg-gradient-to-r from-[rgb(6,6,75)] via-[rgb(16,37,161)] to-[rgb(6,6,75)]">
                                    <div className="bg-no-repeat bg-center bg-[url('/assets/player-card.svg')] relative"
                                         style={{height: '485px'}}>
                                        <div className="flex justify-between justify-items-center">
                                            <div className="absolute left-8 top-1.5 w-16">
                                                {
                                                    object.rating &&
                                                    object.rating > 0.0 &&
                                                    <p className="text-white text-2xl font-bold text-center">{Math.round((object.rating ?? 0) * 20)}</p>
                                                }
                                            </div>
                                            <div className="absolute right-8">
                                                <img className="w-10 h-10"
                                                     src={baseUrl + 'assets' + props.team_logo}
                                                     alt={props.team_name}
                                                />
                                                {
                                                    object.number !== 0 &&
                                                    <p className="text-white text-sm text-center">{object.number}</p>
                                                }
                                            </div>
                                        </div>
                                        <div className="absolute top-16 w-full">
                                            <Avatar>
                                                <AvatarImage src={baseUrl + 'assets' + object.photo}
                                                             alt={object.name}
                                                             title={object.firstname + ' ' + object.lastname}
                                                             className="w-32 h-32 rounded-full mx-auto border-2 border-gray-200"/>
                                                <AvatarFallback>CN</AvatarFallback>
                                            </Avatar>
                                            <div className="p-2 mt-5">
                                                <h3 className="text-white text-2xl font-bold text-center">{object.name}</h3>
                                                <div className="text-center text-gray-400 text-xs font-semibold">
                                                    <p>{object.position}</p>
                                                </div>
                                            </div>
                                            <div className="w-full px-12">
                                                <table className="my-3 w-full">
                                                    <tbody>
                                                    <tr>
                                                        <td className="px-1 py-0 text-sm text-gray-400 font-semibold text-center">Alter</td>
                                                        <td className="px-1 py-0 text-sm text-gray-400 font-semibold text-center">Größe</td>
                                                        <td className="px-1 py-0 text-sm text-gray-400 font-semibold text-center">Gewicht</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-1 py-0 text-sm text-gray-200 text-center">{object.age}</td>
                                                        <td className="px-1 py-0 text-sm text-gray-200 text-center">{object.height}</td>
                                                        <td className="px-1 py-0 text-sm text-gray-200 text-center">{object.weight}</td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                                <hr className="text-gray-400"/>
                                                <p className="mt-3 text-sm text-gray-400 text-center">&nbsp;
                                                    {
                                                        object.appearences &&
                                                        object.appearences !== 0 &&
                                                        <span>{object.appearences} {object.appearences > 1 ? 'Einsätze' : 'Einsatz'}&nbsp;</span>
                                                    }
                                                    {
                                                        object.minutes !== 0 && <span>| {object.minutes} Minuten</span>
                                                    }
                                                </p>
                                            </div>
                                            <div className="mt-5 text-center">
                                                <Button
                                                    className="text-xs py-0 px-4 rounded-full"
                                                    onClick={() => handlePlayer(object)}
                                                >Earn Scouting Points</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        )
    }
}
