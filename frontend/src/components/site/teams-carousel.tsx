import axios from "axios";
import {Avatar, AvatarImage} from "@radix-ui/react-avatar";
import {Button} from "@/components/ui/button.tsx";
import {TeamVenue} from 'src/interfaces/tikitaka';
import {getGameConfigFromViteEnvironment} from "@/config/getGameConfigs.ts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = {
    updateTeamData: (arg0: TeamData) => void
}

type TeamData = {
    team_id: number
    team_name: string
    team_logo: string
}

export default function TeamsCarousel(props: Props) {
    const [league, setLeague] = useState<number>(140)
    const gameConfig = getGameConfigFromViteEnvironment()
    const baseUrl = gameConfig.gameBaseUrl;
    const season = gameConfig.defaultSeason;
    const queryClient = useQueryClient();

    let teams: TeamVenue[] = [];

    const handleTeam = (value: TeamData) => {
        props.updateTeamData(value);
    }

    const fetchTeams = async () => {
        return await axios.get(
            `${baseUrl}api/teams?season=${season}&leagueId=${league}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
    }

    const {status, data, error} = useQuery({
        queryKey: [league],
        queryFn: fetchTeams,
        staleTime: Infinity,
    });

    const changeLeague = async (val: string) => {
        setLeague(parseInt(val));
        await queryClient.fetchQuery({
            queryKey: [league],
              queryFn: fetchTeams,
              staleTime: Infinity,
        });
    }

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
        teams = data.data.data;
        return (
            <section>
                <DropdownMenu>
                    <DropdownMenuTrigger>Select League</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>League</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={`${league}`} onValueChange={changeLeague}>
                            <DropdownMenuRadioItem value="80">3. Liga (Germany)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="140">La Liga (Spain)</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className="overflow-x-auto flex snap-mandatory snap-x">
                    {teams.map((object: TeamVenue) =>
                        <div key={object.team_id} className="snap-start">
                            <div className="min-w-96 flex-none p-3 pl-4">
                                <div
                                    className="rounded-2xl border-2 border-slate-500 py-3 bg-gradient-to-tr from-blue-950 to-slate-900">
                                    <div className="relative" style={{height: '340px'}}>
                                        <div className="flex justify-between justify-items-center">
                                            <div className="absolute left-8 top-1.5 w-16">
                                                <p className="text-white text-2xl font-bold text-center">{object.code}</p>
                                            </div>
                                            <div className="absolute right-8">
                                                <img className="w-auto h-10"
                                                     src={object.logo}
                                                     alt={object.team_name}
                                                />
                                                {
                                                    object.founded !== 0 &&
                                                    <p className="text-white text-sm text-center">{object.founded}</p>
                                                }
                                            </div>
                                        </div>
                                        <div className="absolute w-full">
                                            <Avatar>
                                                <AvatarImage src={object.venue.image}
                                                             alt={object.venue.venue_name}
                                                             className="w-32 h-32 rounded-full mx-auto border-2 bg-gray-400"/>
                                            </Avatar>
                                            <div className="p-2">
                                                <h3 className="text-white text-2xl font-bold text-center">{object.team_name}</h3>
                                                <div className="text-center text-gray-400 text-xs font-semibold">
                                                    <p>{object.venue.venue_name}</p>
                                                </div>
                                            </div>
                                            <div className="w-full px-12">
                                                <table className="my-1 w-full">
                                                    <tbody>
                                                    <tr>
                                                        <td className="px-1 py-0 text-sm text-gray-400 font-semibold text-center">Capacity</td>
                                                        <td className="px-1 py-0 text-sm text-gray-400 font-semibold text-center">Surface</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-1 py-0 text-sm text-gray-200 text-center">{object.venue.capacity}</td>
                                                        <td className="px-1 py-0 text-sm text-gray-200 text-center">{object.venue.surface}</td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                                <hr className="text-gray-400"/>
                                                <p className="mt-3 text-xs text-gray-400 text-center">{object.venue.address}<br/>{object.venue.city}
                                                </p>
                                            </div>
                                            <div className="text-center mt-3">
                                                <Button
                                                    onClick={() => handleTeam({
                                                        team_id: object.team_id,
                                                        team_name: object.team_name ?? 'No Name',
                                                        team_logo: object.logo ?? 'placeholder.png',
                                                    })}
                                                >Show Team</Button>
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
