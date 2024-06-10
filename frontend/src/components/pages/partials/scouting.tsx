import {useState} from "react";
import ReactStars from 'react-rating-star-with-type'
import {PlayerObject} from 'src/interfaces/tikitaka';

type Ratings = {
    dribbling: number
    passing: number
    tackling: number
    fairplay: number
    agility: number
    acceleration: number
    concentration: number
}

type Props = {
    playerObject: PlayerObject,
    doRating: (ratings: Ratings) => void
}

export default function Scouting(props: Props) {
    const [dribbling, setDribbling] = useState(0);
    const [passing, setPassing] = useState(0);
    const [tackling, setTackling] = useState(0);
    const [fairplay, setFairplay] = useState(0);
    const [agility, setAgility] = useState(0);
    const [acceleration, setAcceleration] = useState(0);
    const [concentration, setConcentration] = useState(0);

    const position = props.playerObject.statistics[0].position;

    const ratings: Ratings = {
        dribbling: 0,
        passing: 0,
        tackling: 0,
        fairplay: 0,
        agility: 0,
        acceleration: 0,
        concentration: 0,
    };

    const rate = (key: string, value: number) => {
        ratings.dribbling = dribbling;
        ratings.passing = passing;
        ratings.tackling = tackling;
        ratings.fairplay = fairplay;
        ratings.agility = agility;
        ratings.acceleration = acceleration;
        ratings.concentration = concentration;

        switch (key) {
            case 'dribbling':
                setDribbling(value);
                ratings.dribbling = value;
                break;
            case 'passing':
                setPassing(value);
                ratings.passing = value;
                break;
            case 'tackling':
                setTackling(value);
                ratings.tackling = value;
                break;
            case 'agility':
                setAgility(value);
                ratings.agility = value;
                break;
            case 'acceleration':
                setAcceleration(value);
                ratings.acceleration = value;
                break;
            case 'concentration':
                setConcentration(value);
                ratings.concentration = value;
                break;
            case 'fairplay':
                setFairplay(value);
                ratings.fairplay = value;
                break;
        }
        props.doRating(ratings)
    };

    return (
        <section>
            {position && position !== 'Goalkeeper' && (
                <div className="flex content-between justify-between my-6">
                    <p className="text-sm text-gray-200">Dribbling</p>
                    <ReactStars
                        onChange={(val: number) => {
                            rate('dribbling',val)
                        }}
                        value={dribbling}
                        size={"1.5rem"}
                        isEdit={true}
                        activeColors={["red", "orange", "orange", "orange", "yellow",]}
                    />
                </div>
            )}

            {position && position !== 'Goalkeeper' && (
                <div className="flex content-between justify-between my-6">
                    <p className="text-sm text-gray-200">Passing</p>
                    <ReactStars
                        onChange={(val: number) => {
                            rate('passing',val)
                        }}
                        value={passing}
                        size={"1.5rem"}
                        isEdit={true}
                        activeColors={["red", "orange", "orange", "orange", "yellow",]}
                    />
                </div>
            )}

            {position && position !== 'Goalkeeper' && (
                <div className="flex content-between justify-between my-6">
                    <p className="text-sm text-gray-200">Tackling</p>
                    <ReactStars
                        onChange={(val: number) => {
                            rate('tackling',val)
                        }}
                        value={tackling}
                        size={"1.5rem"}
                        isEdit={true}
                        activeColors={["red", "orange", "orange", "orange", "yellow",]}
                    />
                </div>
            )}

            {position && position === 'Goalkeeper' && (
                <div className="flex content-between justify-between my-6">
                    <p className="text-sm text-gray-200">Agility</p>
                    <ReactStars
                        onChange={(val: number) => {
                            rate('agility',val)
                        }}
                        value={agility}
                        size={"1.5rem"}
                        isEdit={true}
                        activeColors={["red", "orange", "orange", "orange", "yellow",]}
                    />
                </div>
            )}

            {position && position === 'Goalkeeper' && (
                <div className="flex content-between justify-between my-6">
                    <p className="text-sm text-gray-200">Acceleration</p>
                    <ReactStars
                        onChange={(val: number) => {
                            rate('acceleration',val)
                        }}
                        value={acceleration}
                        size={"1.5rem"}
                        isEdit={true}
                        activeColors={["red", "orange", "orange", "orange", "yellow",]}
                    />
                </div>
            )}

            {position && position === 'Goalkeeper' && (
                <div className="flex content-between justify-between my-6">
                    <p className="text-sm text-gray-200">Concentration</p>
                    <ReactStars
                        onChange={(val: number) => {
                            rate('concentration',val)
                        }}
                        value={concentration}
                        size={"1.5rem"}
                        isEdit={true}
                        activeColors={["red", "orange", "orange", "orange", "yellow",]}
                    />
                </div>
            )}

            <div className="flex content-between justify-between my-6">
                <p className="text-sm text-gray-200">Fairplay</p>
                <ReactStars
                    onChange={(val: number) => {
                        rate('fairplay',val)
                    }}
                    value={fairplay}
                    size={"1.5rem"}
                    isEdit={true}
                    activeColors={["red", "orange", "orange", "orange", "yellow",]}
                />
            </div>

        </section>
    );
}
