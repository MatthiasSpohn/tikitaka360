import useWalletBalance from "@/components/wallet/useWalletBalance.ts";
import {useWallet} from "@txnlab/use-wallet";
import * as algokit from "@algorandfoundation/algokit-utils";
import {getAlgodConfigFromViteEnvironment} from "@/utils/network/getAlgoClientConfigs.ts";
import algosdk from "algosdk";
import {PlayerCardClient} from "@/components/contracts/PlayerCardClient.ts";
import {microAlgos} from "@algorandfoundation/algokit-utils";
import indexerClient from "@/lib/indexerClient.ts";
import {TealKeyValue} from "algosdk/dist/types/client/v2/algod/models/types";

export default function useTxnHandler() {
    const {activeAddress, signer} = useWallet()
    const {optedAssets} = useWalletBalance()

    const sender = {signer, addr: activeAddress!}

    algokit.Config.configure({populateAppCallResources: true});

    const algodConfig = getAlgodConfigFromViteEnvironment()
    const algodClient = new algosdk.Algodv2(
        algodConfig.token as string,
        algodConfig.server,
        algodConfig.port
    );

    const getPlayerCardClient = (appId: number) => {
        return new PlayerCardClient(
            {
                sender: sender,
                resolveBy: 'id',
                id: appId,
            },
            algodClient
        );
    }

    const optInToAsset = async (assetId: number|bigint, playerCardClient: PlayerCardClient) => {
        if (!assetId) {
            return
        }
        if (optedAssets?.find((asset) => (asset["asset-id"] === assetId))) {
            return;
        }
        const suggestedParams = await algodClient.getTransactionParams().do();

        const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
            amount: 0,
            assetIndex: Number(assetId),
            from: sender.addr,
            suggestedParams,
            to: sender.addr
        });

        return await playerCardClient.tokenOptIn(
            {txn: assetTransferTxn},
            {
                sender: sender,
                sendParams: {
                    fee: microAlgos(1_000),
                },
            }
        );
    }

    const setNewReview = async (potential: number, playerCardClient: PlayerCardClient) => {
        return await playerCardClient.setNewReview(
            {newUserReview: potential},
            {
                sender: sender,
                sendParams: {
                    fee: microAlgos(2_000),
                    maxRoundsToWaitForConfirmation: 4,
                },
            }
        );
    }

    const optIn = async (playerCardClient: PlayerCardClient) => {
        const response = await indexerClient.lookupAccountAppLocalStates(activeAddress!).do();
        const appsLocalStates = response["apps-local-states"];
        const {appId} = await playerCardClient.appClient.getAppReference();

        if (appsLocalStates?.find((state: { id: number | bigint; }) => (state.id === appId))) {
            return;
        }

        return await playerCardClient.optIn.optInToApplication(
            {},
            {
                sender: sender,
                sendParams: {
                    fee: microAlgos(1_000),
                    maxRoundsToWaitForConfirmation: 4,
                }
            });
    }

    const purchaseAsset = async (appId: number, playerCardClient: PlayerCardClient) => {
        const suggestedParams = await algodClient.getTransactionParams().do();
        const application = await algodClient.getApplicationByID(appId as number).do();
        const creatorAppAddress = application.params.creator;
        const globals = application.params['global-state'];
        const nftPrice = globals.find((tealKeyValue: TealKeyValue) => Buffer.from(tealKeyValue.key, 'base64').toString() === "p")?.value.uint;

        const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            from: sender.addr,
            to: creatorAppAddress,
            amount: BigInt(nftPrice),
            suggestedParams,
        });

        return await playerCardClient.purchaseNft(
            { payment: paymentTxn },
            {
                sender: sender,
                sendParams: {
                    fee: microAlgos(2_000),
                    maxRoundsToWaitForConfirmation: 4,
                },
            }
        );
    }

    return {
        getPlayerCardClient,
        optIn,
        optInToAsset,
        setNewReview,
        purchaseAsset
    };
}
