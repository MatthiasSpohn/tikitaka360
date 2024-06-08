import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import * as algokit from '@algorandfoundation/algokit-utils';
import { algos, microAlgos, getOrCreateKmdWalletAccount } from '@algorandfoundation/algokit-utils';
import algosdk, { decodeAddress, decodeUint64, SuggestedParams } from "algosdk";
import { ChallengeClient } from '../contracts/clients/ChallengeClient';

const fixture = algorandFixture();
algokit.Config.configure({ populateAppCallResources: true });
let algod: algosdk.Algodv2;
let challenger: algosdk.Account;
let user: algosdk.Account;
let challengeClient: ChallengeClient;
let suggestedParams: SuggestedParams;

const assetID: number = 1013; // this is the NFT

describe('PlayerCard', () => {
  beforeEach(fixture.beforeEach);

  beforeAll(async () => {
    await fixture.beforeEach();
    algod = fixture.context.algod;
    const { testAccount, kmd } = fixture.context;
    suggestedParams = await algod.getTransactionParams().do();

    /// App creator / challenger starts with 25 ALGO
    challenger = await getOrCreateKmdWalletAccount(
      {
        name: 'challenger_account',
        fundWith: algos(25),
      },
      algod,
      kmd
    );

    /// App User starts with 2 ALGO
    user = await getOrCreateKmdWalletAccount(
      {
        name: 'user_account',
        fundWith: algos(2),
      },
      algod,
      kmd
    );

    challengeClient = new ChallengeClient(
      {
        sender: testAccount,
        resolveBy: 'id',
        id: 0,
      },
      algod
    );
  });

  test('create the challenge application', async () => {
    await challengeClient.create.createApplication(
      {},
      {
        sender: challenger,
        sendParams: {
          fee: microAlgos(1_000),
        },
      }
    );
    await challengeClient.appClient.fundAppAccount(algokit.microAlgos(5_000_000));
  }, 15_000);

  test('Setup and start a new challenge', async () => {
    const transferResult = await challengeClient.startChallenge(
      {
        length: 1,
        given: 125,
        assetId: assetID,
      },
      {
        sender: challenger,
        sendParams: {
          fee: microAlgos(1_000),
        },
      }
    );
    expect(transferResult.confirmation).toBeDefined();
  });

  test('User opt-in to challenge and participate', async () => {
    const amount = 40_000;

    const optinResult = await challengeClient.optIn.optInToApplication(
      {},
      {
        sender: user,
        sendParams: {
          fee: microAlgos(1_000),
          maxRoundsToWaitForConfirmation: 4,
        },
      }
    );
    expect(optinResult.confirmation).toBeDefined();

    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: user.addr,
      to: challenger.addr,
      amount,
      suggestedParams,
    });

    const transferResult = await challengeClient.participate(
      {
        payment: paymentTxn,
        prediction: 125,
      },
      {
        sender: user,
        sendParams: {
          fee: microAlgos(1_000),
        },
      }
    );
    expect(transferResult.confirmation).toBeDefined();
  });

  test('Challenge end', async () => {
    const result = await challengeClient.endChallenge(
      {},
      {
        sender: challenger,
        sendParams: {
          fee: microAlgos(2_000),
        },
      }
    );
    expect(result.return).toBeGreaterThan(0);
    const boxnames = await challengeClient.appClient.getBoxNames();
    // const uintArrayCodec = algosdk.ABIType.from('uint64[]');

    const boxValuePromises = boxnames.map(async (boxname) => {
      const byteArray = await challengeClient.appClient.getBoxValue(boxname);
      if (boxname.name.startsWith('sb')) {
        const sp = decodeUint64(byteArray.slice(0, 8), 'safe');
        const cp = decodeUint64(byteArray.slice(8, 16), 'safe');
        const slice = boxname.nameRaw.slice(2, 34);
        const addr = algosdk.encodeAddress(slice);
        return { sp, cp, addr };
      }
      return Buffer.from(byteArray).toString('hex');

      // return Buffer.from(byteArray).toString('hex');
      // return uintArrayCodec.decode(byteArray);
    });
    const boxValues = await Promise.all(boxValuePromises);
    boxValues.forEach((base64, i) => {
      console.log(base64, i);
    });
  }, 15_000);
});
