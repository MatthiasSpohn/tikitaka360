import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { useEffect, useState } from "react";
import axios from "axios";
import { axiosHeaders, baseURL } from "@/utils/common-axios.ts";
import { PlayerFormSheet } from "@/components/partials/player-form-sheet.tsx";
import { PinataResponse, PlayerImportPayload, PlayerPayload } from "@/interfaces/LeaguePayload.ts";
import * as algokit from '@algorandfoundation/algokit-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer.tsx";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { MintForm } from "@/components/partials/mint-form.tsx";
import { CID } from "multiformats/cid";
import algosdk from "algosdk";
import { useWallet } from "@txnlab/use-wallet";
import { getAlgodConfigFromViteEnvironment } from "@/utils/network/getAlgoClientConfigs.ts";
import { PlayerCardCallerClient } from "@/components/contracts/PlayerCardCallerClient.ts";

type MintResponse = {
  data: never;
  status: boolean;
};

algokit.Config.configure({ populateAppCallResources: true });

export function PlayerComponent() {
  const firstIndex = 0;
  const [players, setPlayers] = useState<PlayerPayload[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [lastIndex, setLastIndex] = useState(0);

  const [open, setOpen] = useState(false)
  const [mint, setMint] = useState<number>(0);
  const itemsPerPage = 10;

  const { activeAddress, signer } = useWallet()
  const sender = { signer, addr: activeAddress! }
  const algodConfig = getAlgodConfigFromViteEnvironment()
  const playerCardCallerAppID: number = 676428457;

  const algodClient = new algosdk.Algodv2(
    algodConfig.token as string,
    algodConfig.server,
    algodConfig.port
  );

  const playerCardCaller = new PlayerCardCallerClient(
    {
      resolveBy: 'id',
      id: playerCardCallerAppID,
    },
    algodClient,
  );

  const headers = axiosHeaders;
  const baseUrl = baseURL;

  const submitAndSign = async (reserveAddress: string, pinataResponse: PinataResponse) => {
    if (!signer || !activeAddress) {
      toast.warning('Please connect wallet first')
      return
    }
    const { appAddress } = await playerCardCaller.appClient.getAppReference();

    const assetArgs = {
      name: pinataResponse.assetName,
      unitName: pinataResponse.unitName,
      url: pinataResponse.url,
      manager: appAddress, // It's important to set the manager to the creator so that the NFT metadata can be updated
      reserve: reserveAddress,
      total: pinataResponse.total,
    }

    const newCardId = Number(
      (
        await playerCardCaller.mintAndGetApp(
          assetArgs,
          {
            sender,
            sendParams: {
              fee: algokit.microAlgos(10_000),
              maxRoundsToWaitForConfirmation: 4
            }
          })
      ).return?.valueOf()
    );

    toast.info(`Successfully created PlayerCard with AppID ${newCardId}`);
    await fundPlayerCard(BigInt(newCardId), 50_050_000);
  }

  const fundPlayerCard = async (appid: number | bigint, amount: number | bigint) => {

    if (!appid) {
      toast.info(`Failed to funded PlayerCard.`)
      return
    }

    const address = algosdk.getApplicationAddress(appid);
    const args = { address: address, appid: appid, amount: amount };

    await playerCardCaller.fundFactoryApp(args, {
      sender,
      sendParams: {
        fee: algokit.microAlgos(4_000),
        maxRoundsToWaitForConfirmation: 4
      }
    });
    toast.info(`Successfully funded PlayerCard with ${amount}.`)
  }

  // FETCH DATA
  const fetchData = async () => {
    const offset = currentPage * itemsPerPage;
    try {
      const response = await axios.get(`${baseUrl}/player?offset=${offset}`, { headers });
      if (response.status === 200 && response.data) {
        if (!response.data.status) {
          toast.error(response.data.error.message);
        } else {
          console.log(response.data.data);
          setLastIndex(Math.ceil(response.data.data.count / itemsPerPage));
          const playerPayload: PlayerPayload[] = response.data.data.rows;
          setPlayers(playerPayload);
        }
      }
    } catch (error) {
      toast.error('Error during data fetching');
    }
  };

  useEffect(() => {
    fetchData().then(() => null);
  },[]);

  const changePage = (value: number) => {
    setCurrentPage(value);
    fetchData().then(() => null);
  };
  const submit = (val: PlayerImportPayload) => {
    axios.post(`${baseUrl}/player`, val, {headers})
      .then((res) => {
        if (res.status === 200 && res.data) {
          if (!res.data.status) {
            toast.error(res.data.error.message);
          } else {
            const playerPayload: PlayerPayload[] = res.data.data;
            setPlayers(playerPayload);
          }
        }
      })
      .catch(error => {
        toast.error(error.message);
      });
  }

  const handleMint = (res: MintResponse) => {
    setOpen(false);
    if (!res.status) {
      toast.error('Error pinning metadata to IPFS');
    } else {
      toast.info('Minting ...')
      const pinataResponse: PinataResponse = res.data;
      // Decode the metadata CID to derive the Reserve Address and URL
      const decodedCID = CID.parse(pinataResponse.meta_cid);
      // Derive the Reserve Address
      const reserveAddress = algosdk.encodeAddress(
        Uint8Array.from(Buffer.from(decodedCID.multihash.digest))
      );

      submitAndSign(reserveAddress, pinataResponse).then(() => null)
    }
  }

  return(
    <div className="h-full py-6">
      <Drawer open={open} onOpenChange={setOpen}>
        <PlayerFormSheet onSubmit={submit}/>
        <Table>
          <TableCaption>
            <h2>Players</h2>
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden md:table-cell">ID</TableHead>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Photo</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Height</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead className="hidden md:table-cell">Nationality</TableHead>
              <TableHead className="hidden md:table-cell">Birthdate</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((pp, index) => (
              <TableRow key={index}>
                <TableCell className="hidden sm:table-cell font-medium">
                  {pp.player_id}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <img
                    alt={pp.name}
                    title={pp.name}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={pp.photo}
                    width="64"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">{pp.firstname} {pp.lastname}</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">Statistics</h4>
                        </div>
                        <div className="grid gap-2">
                          <div className="grid grid-cols-2 gap-4">
                            <p className={"text-sm text-muted-foreground"}>Position:</p>
                            <p className={"text-sm text-muted-foreground"}>{pp.statistics[0].position}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <p className={"text-sm text-muted-foreground"}>Number:</p>
                            <p className={"text-sm text-muted-foreground"}>{pp.statistics[0].number}</p>
                          </div>
                          <div className="grid grid-cols-4 gap-4">
                            <p className={"text-sm text-muted-foreground"}>Appearances:</p>
                            <p className={"text-sm text-muted-foreground"}>{pp.statistics[0].appearances}</p>
                          </div>
                          <div className="grid grid-cols-1 space-y-2">
                            <p className={"text-sm text-muted-foreground text-center"}>-- Cards --</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <p className={"text-sm text-muted-foreground"}>Yellow:</p>
                            <p className={"text-sm text-muted-foreground"}>{pp.statistics[0].cardsyellow}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <p className={"text-sm text-muted-foreground"}>Yellow/Red:</p>
                            <p className={"text-sm text-muted-foreground"}>{pp.statistics[0].cardsyellowred}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <p className={"text-sm text-muted-foreground"}>Red:</p>
                            <p className={"text-sm text-muted-foreground"}>{pp.statistics[0].cardsred}</p>
                          </div>
                          <div className="grid grid-cols-1 space-y-2">
                            <p className={"text-sm text-muted-foreground text-center"}>-- Goals --</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <p className={"text-sm text-muted-foreground"}>Goals:</p>
                            <p className={"text-sm text-muted-foreground"}>{pp.statistics[0].goalstotal}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <p className={"text-sm text-muted-foreground"}>Assists:</p>
                            <p className={"text-sm text-muted-foreground"}>{pp.statistics[0].goalsassists}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <p className={"text-sm text-muted-foreground"}>Goal Saves:</p>
                            <p className={"text-sm text-muted-foreground"}>{pp.statistics[0].goalssaves}</p>
                          </div>
                          <div className="grid grid-cols-1 space-y-2">
                            <p className={"text-sm text-muted-foreground text-center"}>-- Duels & Dribbles --</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <p className={"text-sm text-muted-foreground"}>Won:</p>
                            <p className={"text-sm text-muted-foreground"}>{pp.statistics[0].duelswon}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <p className={"text-sm text-muted-foreground"}>Attempts:</p>
                            <p className={"text-sm text-muted-foreground"}>{pp.statistics[0].dribblesattempts}</p>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell className="hidden sm:table-cell font-medium">
                {pp.age}
                </TableCell>
                <TableCell className="hidden sm:table-cell font-medium">
                  {pp.height}
                </TableCell>
                <TableCell className="hidden sm:table-cell font-medium">
                  {pp.weight}
                </TableCell>
                <TableCell className="hidden sm:table-cell font-medium">
                  {pp.nationality}
                </TableCell>
                <TableCell className="hidden sm:table-cell font-medium">
                  {pp.birthdate}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-haspopup="true"
                        size="icon"
                        variant="ghost"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <DrawerTrigger onClick={() => setMint(pp.player_id)}>Mint NFT</DrawerTrigger>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Pagination>

          <PaginationContent>
            {currentPage !== firstIndex && (
              <PaginationItem>
              <PaginationPrevious onClick={() => changePage(currentPage - 1)} />
            </PaginationItem>
            )}

            {currentPage !== firstIndex && (
              <PaginationItem>
                <PaginationLink onClick={() => changePage(currentPage - 1)}>
                  {currentPage}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationLink isActive>
                {currentPage + 1}
              </PaginationLink>
            </PaginationItem>

            {currentPage < lastIndex - 1 && (
              <PaginationItem>
                <PaginationLink onClick={() => changePage(currentPage + 1)}>
                  {currentPage + 2}
                </PaginationLink>
              </PaginationItem>
            )}

            {currentPage < lastIndex - 1 && (
              <PaginationItem>
                <PaginationNext onClick={() => changePage(currentPage + 1)}/>
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Mint NFT on Algorand</DrawerTitle>
            <DrawerDescription>This action will mint a NFT (ARC-19) for this player.</DrawerDescription>
          </DrawerHeader>
          <MintForm playerId={mint} onSubmit={handleMint} />
        </DrawerContent>
      </Drawer>
    </div>
  )
}
