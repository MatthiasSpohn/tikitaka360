import { useWallet } from "@txnlab/use-wallet";
import TeamsCarousel from "@/components/site/teams-carousel.tsx";
import HeaderCarousel from "@/components/site/header-carousel.tsx";
import Profile from "@/components/pages/profile.tsx";
import { useState } from "react";
import PlayerCardsCarousel from "@/components/site/player-cards-carousel.tsx";
import {getGameConfigFromViteEnvironment} from "@/config/getGameConfigs.ts";

type TeamData = {
    team_id: number
    team_name: string
    team_logo: string
}

function App() {
    const gameConfig = getGameConfigFromViteEnvironment()
    const defaultSeason = gameConfig.defaultSeason;
    const defaultLeague = gameConfig.defaultLeague;

    const { activeAddress } = useWallet()
    const [season, setSeason] = useState<number>(defaultSeason)
    const [league, setLeague] = useState<number>(defaultLeague)
    const [teamId, setTeamId] = useState<number|undefined>(undefined)
    const [teamName, setTeamName] = useState<string|undefined>(undefined)
    const [teamLogo, setTeamLogo] = useState<string|undefined>(undefined)
    const [playerId, setPlayerId] = useState<number|undefined>(undefined)
    const [appId, setAppId] = useState<number|undefined>(undefined)
    const [reload, setReload] = useState<number|undefined>(undefined)

    const handleTeamData = (teamData: TeamData) => {
        setSeason(defaultSeason);
        setLeague(defaultLeague);
        setTeamId(teamData.team_id);
        setTeamLogo(teamData.team_logo);
        setTeamName(teamData.team_name);
    };

    const handleProfile = (playerId: number, appId: number | undefined) => {
        setPlayerId(playerId);
        if (appId) {
            setAppId(appId);
        }
    };

    const handleReload = (appId: number | undefined) => {
        if (appId) {
            setReload(appId);
        }
    };

    const handleUnset = (value: boolean) => {
        if (value) {
            setPlayerId(undefined);
        }
    };

    return (
        <>
            {activeAddress && <PlayerCardsCarousel updateProfile={handleProfile} reload={reload} />}

            <TeamsCarousel updateTeamData={handleTeamData} />

            {teamId && <HeaderCarousel team_id={teamId} team_logo={teamLogo!} team_name={teamName!} liga={league} season={season} updateProfile={handleProfile}  />}

            {playerId && <Profile profile={playerId} onUnset={handleUnset} app={appId} reload={handleReload}/>}
        </>
    )
}


export default App
