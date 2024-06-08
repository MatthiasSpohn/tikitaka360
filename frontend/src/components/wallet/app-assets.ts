import indexerClient from "@/lib/indexerClient.ts";
import {ipfsDecoderDecode} from "@/utils/ipfs-decoder.ts";
import {AssetLookupResult} from "@algorandfoundation/algokit-utils/types/indexer";

export default function AppAssets() {

    // JSON fetcher function
    const getContent = async (url: string ) => {
        const res = await fetch(url);
        return res.json();
    };

    const getAssetInfo = async (assetId: number | bigint) => {
        const assetLookupResult = await indexerClient.lookupAssetByID(assetId as number).do() as AssetLookupResult;
        const assetParams = assetLookupResult.asset.params;
        const url = assetParams.url;
        const reserve = assetParams.reserve;
        const name = assetParams.name;
        if (!url || !reserve || !name) {
            throw new Error("Missing url or reserve field.");
        }
        const metaUrl = ipfsDecoderDecode(url, reserve);
        return await getContent(metaUrl)
    }

    return {
        getAssetInfo
    };
}
