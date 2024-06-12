import { Button } from "@/components/ui/button"
import {OraclePayload, PlayerObject, Ratings} from 'src/interfaces/tikitaka';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import axios from "axios";
import {Avatar, AvatarImage} from "@radix-ui/react-avatar";
import {Slider} from "@/components/ui/slider";
import {Label} from "@/components/ui/label.tsx";
import {useWallet} from "@txnlab/use-wallet";
import useTxnHandler from "@/components/wallet/txn-handler.ts";
import {useQuery} from "@tanstack/react-query";
import {useCallback, useState} from "react";
import {getGameConfigFromViteEnvironment} from "@/config/getGameConfigs.ts";
import Scouting from "@/components/pages/partials/scouting.tsx";
import { TikiTaka360Client } from "@/components/contracts/TikiTaka360Client.ts";
import algosdk, { SuggestedParams } from "algosdk";
import * as algokit from '@algorandfoundation/algokit-utils';
import { getAlgodConfigFromViteEnvironment } from "@/utils/network/getAlgoClientConfigs.ts";
import { microAlgos } from "@algorandfoundation/algokit-utils";
algokit.Config.configure({ populateAppCallResources: true });

type Props = {
    profile: number
    app: number | undefined
    onUnset: (arg0: boolean) => void
    reload: (arg0: number) => void
}

/*
<iframe
    className="w-full mt-4"
    src="https://tv.dfb.de/player_frame.php?view=40989&startplaying=false&embed=true&title=borussia-dortmund-ii-sc-verl-highlights&redirect=1">
</iframe>
*/

function Profile(props: Props) {
    const gameConfig = getGameConfigFromViteEnvironment()
    const { activeAddress, signer } = useWallet();
    const sender = { signer, addr: activeAddress! };
    const {getPlayerCardClient, optIn, optInToAsset, setNewReview} = useTxnHandler();
    const [potential, setPotential] = useState(0);
    const [forecast, setForecast] = useState('Move the slider for your assessment')
    const [ratings, setRatings] = useState<Ratings|undefined>(undefined)

    let playerObject: PlayerObject|undefined;
    let open: boolean = false;

    const baseUrl = gameConfig.gameBaseUrl;
    const assetId = gameConfig.gameAssetId;

    const algodConfig = getAlgodConfigFromViteEnvironment();
    const algodClient = new algosdk.Algodv2(
      algodConfig.token as string,
      algodConfig.server,
      algodConfig.port
    );

    const tikiTaka360Client = new TikiTaka360Client(
      {
          resolveBy: 'id',
          id: Number(gameConfig.gameAppId),
      },
      algodClient,
    );

    const optinAndReview = async () => {
        if (!playerObject) { return }

        /* Write to Oracle */
        const oraclePayload: OraclePayload = {
            player_id: playerObject.player_id,
            potential: potential,
            ratings: ratings,
            weight: 0.1,
        }
        await saveToOracleServer(oraclePayload);

        if (!activeAddress) {
            return;
        }
        console.log(playerObject);
        const { appAddress } = await tikiTaka360Client.appClient.getAppReference();
        const suggestedParams: SuggestedParams = await algodClient.getTransactionParams().do();
        const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            from: activeAddress,
            to: appAddress,
            amount: 43_400,
            suggestedParams,
        });
        await tikiTaka360Client.collectScorePoints(
          {
              payment: paymentTxn,
          },
          {
              sender,
              sendParams: {
                  fee: microAlgos(1_000),
              },
          }
        );

        if (!props.app) {
            return;
        }

        const playerCardClient = getPlayerCardClient(props.app);
        await optIn(playerCardClient);
        await optInToAsset(assetId, playerCardClient)
        const resp = await setNewReview(potential, playerCardClient);

        props.reload(resp.transaction.appIndex);
    }

    const updateRating = (val: Ratings) => {
        setRatings(val);
    }

    const handlePotential = useCallback((value: number[]) => {
        value.map((val )=> {
            setPotential(val);
            switch (true)
            {
                case (val < 50):
                    setForecast('No potential for higher leagues');
                    break;
                case (val>=50 && val < 70):
                    setForecast('Europe 3rd Leagues');
                    break;
                case (val>=70 && val < 90):
                    setForecast('Europe 2nd Leagues');
                    break;
                case (val>=90 && val < 110):
                    setForecast('Europe 1st Leagues');
                    break;
                case (val>=110 && val < 140):
                    setForecast('Europe top Leagues');
                    break;
                case (val>=140 && val < 160):
                    setForecast('Will be seen in Champions League matches');
                    break;
                case (val>=160):
                    setForecast('World-Class exceptional talent');
                    break;
                default:
                    setForecast('');
                    break;
            }
        })
    }, []);

    const handleOpenClose = (value: boolean) => {
        if (!value) {
            props.onUnset(true)
        }
        open = value;
    }

    const submitData = () => {
        optinAndReview().then(() => null);
        playerObject = undefined;
        props.onUnset(true);
        open = false;
    }

    const saveToOracleServer = async (oraclePayload: OraclePayload)=> {
        return await axios.put(
          `${baseUrl}api/player/${props.profile}`,
            oraclePayload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    }

    const fetchPlayerData = async () => {
        return await axios.get(
          `${baseUrl}api/player/${props.profile}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    }

    const { status, data, error } = useQuery({
        queryKey: [props],
        queryFn: fetchPlayerData,
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
        playerObject = data.data.data as PlayerObject;
        open = true;

        return (
            <Sheet open={open} onOpenChange={handleOpenClose}>
                <SheetContent className="bg-gray-950 w-fit">
                    <SheetHeader>
                        <Avatar>
                            <AvatarImage
                                src={baseUrl + 'assets' + playerObject?.photo}
                                alt={playerObject?.name}
                                className="w-32 h-32 rounded-full mx-auto border-2 bg-gray-400"/>
                        </Avatar>
                        <SheetTitle
                            className="text-center">{playerObject?.firstname} {playerObject?.lastname}</SheetTitle>
                        <SheetDescription className="text-center">
                            Position: {playerObject?.statistics[0].position}
                        </SheetDescription>
                    </SheetHeader>
                    <hr className="my-4"/>
                    <div className="grid gap-4 py-">
                        <div className="grid grid-cols-12 items-center gap-3 text-xs">
                            {playerObject?.age &&
                                <><p className="text-right col-span-3">age</p><p
                                    className="col-span-3">{playerObject?.age}</p></>
                            }
                            {playerObject?.height &&
                                <><p className="text-right col-span-3">size</p><p
                                    className="col-span-3">{playerObject?.height}</p></>
                            }
                            {playerObject?.weight &&
                                <><p className="text-right col-span-3">weight</p><p
                                    className="col-span-3">{playerObject?.weight}</p></>
                            }
                            {playerObject?.nationality &&
                                <><p className="text-right col-span-3">nationality</p><p
                                    className="col-span-3">{playerObject?.nationality}</p></>
                            }
                            {playerObject?.statistics[0].goalstotal !== 0 &&
                                <><p className="text-right col-span-3">goals</p><p
                                    className="col-span-3">{playerObject?.statistics[0].goalstotal}</p></>
                            }
                            {playerObject?.statistics[0].goalssaves !== 0 &&
                                <><p className="text-right col-span-3">goal saves</p><p
                                    className="col-span-3">{playerObject?.statistics[0].goalssaves}</p></>
                            }
                            {playerObject?.statistics[0].penaltysaved !== 0 &&
                                <><p className="text-right col-span-3">penalty saved</p>
                                    <p className="col-span-3">{playerObject?.statistics[0].penaltysaved}</p></>
                            }
                            {playerObject?.statistics[0].foulscommitted !== 0 &&
                                <><p className="text-right col-span-3">fouls committed</p><p
                                    className="col-span-3">{playerObject?.statistics[0].foulscommitted}</p></>
                            }
                            {playerObject?.statistics[0].cardsyellow !== 0 &&
                                <><p className="text-right col-span-3">yellow</p><p
                                    className="col-span-3">{playerObject?.statistics[0].cardsyellow}</p></>
                            }
                            {playerObject?.statistics[0].cardsyellowred !== 0 &&
                                <><p className="text-right col-span-3">yellow/red</p><p
                                    className="col-span-3">{playerObject?.statistics[0].cardsyellowred}</p></>
                            }
                            {playerObject?.statistics[0].cardsred !== 0 &&
                                <><p className="text-right col-span-3">red</p><p
                                    className="col-span-3">{playerObject?.statistics[0].cardsred}</p></>
                            }
                        </div>
                    </div>
                    <hr className="my-4"/>
                    <p className="text-sm text-gray-200 font-bold">
                        Your rating for {playerObject?.name}
                    </p>
                    {playerObject && <Scouting playerObject={playerObject}  doRating={updateRating}/>}
                    <div className="grid gap-2 pt-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="potential" className="leading-5">Your assessment of talent:&nbsp;
                                {potential > 0 && <span className="font-bold text-green-400">{potential}</span>}
                                <br/>{forecast}
                            </Label>
                        </div>
                        <Slider
                            className="my-3"
                            id="potential"
                            min={0}
                            max={200}
                            step={1}
                            defaultValue={[0]}
                            onValueChange={handlePotential}
                        />
                    </div>
                    <p className="text-xs text-gray-400">
                        The assessment of talent is from 0 - 200 and in no way reflects the current performance
                        level of the player, but describes an assessment of the theoretically maximum achievable
                        potential under excellent circumstances.
                    </p>
                    <SheetFooter className="mt-4">
                        <SheetClose asChild>
                            <Button
                                type="button"
                                onClick={submitData}
                                autoFocus={true}
                            >save</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        );
    }
}

export default Profile
