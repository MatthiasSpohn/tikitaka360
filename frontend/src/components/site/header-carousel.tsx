import axios from "axios";
import {Avatar, AvatarImage} from "@radix-ui/react-avatar";
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

    const handlePlayer = (player: PlayerObject) => {
        props.updateProfile(player.player_id, undefined);
    }

    const fetchData = async () => {
        return await axios.get(
          `${baseUrl}api/players?season=${props.season}&teamId=${props.team_id}&offset=0&limit=99`,
          {
              headers: {
                  'Content-Type': 'application/json'
              }
          })
    }

    const {status, data, error} = useQuery({
        queryKey: [props.team_id, props.liga, props.season],
        queryFn: fetchData,
        staleTime: Infinity,
    });

    if (error) {
        return (
          <section>
              <div>
                  <p>An error has occurred: {error.message}</p>
              </div>
          </section>
        )
    }

    if (status && data) {
        const players = data.data.data.rows as PlayerObject[];
        if (players.length < 1) {
            return (
              <section><div><p> No Players found</p></div></section>
            )
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
                                              object.statistics && object.statistics[0] && object.statistics[0].rating &&
                                              <p className="text-white text-2xl font-bold text-center">{Math.round((object.statistics[0].rating) * 20)}</p>
                                            }
                                        </div>
                                        <div className="absolute right-8">
                                            <img className="w-10 h-10"
                                                 src={props.team_logo}
                                                 alt={props.team_name}
                                            />
                                            {
                                              object.statistics[0].number !== 0 &&
                                              <p className="text-white text-sm text-center">{object.statistics[0].number}</p>
                                            }
                                        </div>
                                    </div>
                                    <div className="absolute top-16 w-full">
                                        <Avatar>
                                            <AvatarImage src={object.photo}
                                                         alt={object.name}
                                                         title={object.firstname + ' ' + object.lastname}
                                                         className="w-32 h-32 rounded-full mx-auto border-2 border-gray-200"/>
                                        </Avatar>
                                        <div className="p-2 mt-5">
                                            <h3 className="text-white text-2xl font-bold text-center">{object.name}</h3>
                                            <div className="text-center text-gray-400 text-xs font-semibold">
                                                <p>{object.statistics[0].position}</p>
                                            </div>
                                        </div>
                                        <div className="w-full px-12">
                                            <table className="my-3 w-full">
                                                <tbody>
                                                <tr>
                                                    <td className="px-1 py-0 text-sm text-gray-400 font-semibold text-center">Age</td>
                                                    <td className="px-1 py-0 text-sm text-gray-400 font-semibold text-center">Size</td>
                                                    <td className="px-1 py-0 text-sm text-gray-400 font-semibold text-center">Weight</td>
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
                                                  object.statistics[0] &&
                                                  object.statistics[0].appearances &&
                                                  <span>{object.statistics[0].appearances} {object.statistics[0].appearances > 1 ? 'Appearances' : 'Appearance'}&nbsp;</span>
                                                }
                                                {
                                                  object.statistics[0].minutes !== 0 && <span>{object.statistics[0].minutes} Minutes</span>
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
