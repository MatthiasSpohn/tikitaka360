import { TableCell } from "@/components/ui/table.tsx";
import { modelsv2 } from "algosdk";
import { NftType } from "@/interfaces/tikitaka.ts";
import { useQuery } from "@tanstack/react-query";
import AppAssets from "@/components/wallet/app-assets.ts";

export function StatisticsRow(props: { appId: number, appGS: modelsv2.TealKeyValue[]}) {
  const appAssets = AppAssets();

  if (!props.appId || !props.appGS) throw new Error('Player not found.')

  const globals = props.appGS;
  const reviewValue = globals.find((tealKeyValue) => Buffer.from(tealKeyValue.key, 'base64').toString() === "r")?.value.uint;
  const reviewCount = globals.find((tealKeyValue) => Buffer.from(tealKeyValue.key, 'base64').toString() === "c")?.value.uint;
  const assetID = globals.find((tealKeyValue) => Buffer.from(tealKeyValue.key, 'base64').toString() === "n")?.value.uint;
  const nftPrice = globals.find((tealKeyValue) => Buffer.from(tealKeyValue.key, 'base64').toString() === "p")?.value.uint;

  const fetchNftFromIpfs = async () => {
    if ( !assetID ) {
      return <TableCell colSpan={6}>Request Failed</TableCell>;
    }
    return await appAssets.getAssetInfo(assetID) as NftType | undefined;
  }

  const { data, error, isLoading } = useQuery({
    queryKey: [assetID],
    queryFn: fetchNftFromIpfs,
    enabled: !!assetID,
  });

  // Error and Loading states
  if (error) return <TableCell colSpan={6}>Request Failed</TableCell>;
  if (isLoading) return <TableCell colSpan={6}>Loading ...</TableCell>;
  if (data) {
    const asset = data as NftType;
    return(
      <>
        <TableCell>{props.appId}</TableCell>
        <TableCell>{asset.properties.firstname} {asset.properties.lastname}</TableCell>
        <TableCell>{reviewCount as number}</TableCell>
        <TableCell>{reviewValue as number}</TableCell>
        <TableCell>{nftPrice as number / 1e6} ALGO</TableCell>
        <TableCell>{assetID as number}</TableCell>
      </>
    );
  }
  return <TableCell colSpan={6}>Request Failed</TableCell>;
}
/*
          <TableHead>AppId</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Reviews</TableHead>
          <TableHead>Review Score</TableHead>
          <TableHead>Asset Price</TableHead>
          <TableHead>AssetID</TableHead>

 */
