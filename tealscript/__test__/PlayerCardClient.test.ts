import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import * as algokit from '@algorandfoundation/algokit-utils';
import { algos, microAlgos, getOrCreateKmdWalletAccount } from '@algorandfoundation/algokit-utils';
import algosdk, { SuggestedParams } from 'algosdk';
import { PlayerCardClient } from '../contracts/clients/PlayerCardClient';

const fixture = algorandFixture();
algokit.Config.configure({ populateAppCallResources: true });
let algod: algosdk.Algodv2;
let user: algosdk.Account;
let playerCardClient: PlayerCardClient;
let suggestedParams: SuggestedParams;

const tokenID: number = 1007; // this is the Utility Token
const playerCardAppID: number = 1010; // this is the App
const assetID: number = 1013; // this is the NFT
const creatorAppAddress: string = 'FPKJ7KD37AEIB3MJ6WXEXJIZH4DACLBNCR5PNUQREUWMC2YLIWFH2NHX24';

describe('PlayerCard', () => {
  beforeEach(fixture.beforeEach);

  beforeAll(async () => {
    await fixture.beforeEach();
    algod = fixture.context.algod;
    const { testAccount, kmd } = fixture.context;
    suggestedParams = await algod.getTransactionParams().do();
    // secretKey = testAccount.sk;

    /// App User startet mit ca. 5,-€  (25 ALGO)
    user = await getOrCreateKmdWalletAccount(
      {
        name: 'user_account',
        fundWith: algos(25),
      },
      algod,
      kmd
    );

    playerCardClient = new PlayerCardClient(
      {
        sender: testAccount,
        resolveBy: 'id',
        id: playerCardAppID,
      },
      algod
    );
  }, 15_000);

  test.skip('OptIn to Application', async () => {
    const optinResult = await playerCardClient.optIn.optInToApplication(
      {},
      {
        sender: user,
        sendParams: {
          fee: microAlgos(1_000),
          maxRoundsToWaitForConfirmation: 4,
        },
      }
    );
    expect(optinResult).toHaveProperty('confirmation');
  }, 15_000);

  test.skip('OptIn to Asset (Utility Token)', async () => {
    const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: user.addr,
      to: user.addr,
      amount: 0,
      assetIndex: tokenID,
      suggestedParams,
    });

    const transferResult = await playerCardClient.tokenOptIn(
      { txn: assetTransferTxn },
      {
        sender: user,
        sendParams: {
          fee: microAlgos(1_000),
        },
      }
    );
    expect(transferResult).toHaveProperty('confirmation');
  }, 15_000);

  test.skip('set new review value', async () => {
    const rw = Number(
      (
        await playerCardClient.setNewReview(
          { newUserReview: 113 },
          {
            sender: user,
            sendParams: {
              fee: microAlgos(2_000),
              maxRoundsToWaitForConfirmation: 4,
            },
          }
        )
      ).return?.valueOf()
    );
    expect(rw).toBeGreaterThan(0);
  }, 15_000);

  test.skip('OptIn NFT (asset-id)', async () => {
    const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: user.addr,
      to: user.addr,
      amount: 0,
      assetIndex: assetID,
      suggestedParams,
    });

    const transferResult = await playerCardClient.assetOptIn(
      { txn: assetTransferTxn },
      {
        sender: user,
        sendParams: {
          fee: microAlgos(1_000),
        },
      }
    );
    expect(transferResult).toHaveProperty('confirmation');
  });

  test.skip('pay app creator and transfer asset-id', async () => {
    const amount = 250_000; // 0.25 ALGO

    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: user.addr,
      to: creatorAppAddress,
      amount,
      suggestedParams,
    });

    const transferResult = await playerCardClient.purchaseNft(
      { payment: paymentTxn },
      {
        sender: user,
        sendParams: {
          fee: microAlgos(2_000),
        },
      }
    );
    expect(transferResult).toHaveProperty('confirmation');
  });
});
