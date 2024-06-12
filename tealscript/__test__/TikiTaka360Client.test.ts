import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk, { SuggestedParams } from 'algosdk';
import { algos, getOrCreateKmdWalletAccount, microAlgos } from '@algorandfoundation/algokit-utils';
import { TikiTaka360Client } from '../contracts/clients/TikiTaka360Client';

const fixture = algorandFixture();
algokit.Config.configure({ populateAppCallResources: true });

let tikiTaka360Client: TikiTaka360Client;
let algod: algosdk.Algodv2;
let playerCardId: number | bigint;
let challenger: algosdk.Account;
let user: algosdk.Account;
let suggestedParams: SuggestedParams;

describe('PlayerCardCallerFactory', () => {
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

    tikiTaka360Client = new TikiTaka360Client(
      {
        sender: testAccount,
        resolveBy: 'id',
        id: 0,
      },
      algod
    );
  });

  test('create the caller application', async () => {
    await tikiTaka360Client.create.createApplication({});
    await tikiTaka360Client.appClient.fundAppAccount(algokit.microAlgos(5_000_000));
  }, 15_000);

  test('', async () => {
    const tokenID = Number(
      (
        await tikiTaka360Client.bootstrap(
          {},
          {
            sendParams: { fee: algokit.microAlgos(2_000) },
          }
        )
      ).return?.valueOf()
    );
    expect(tokenID).toBeGreaterThan(0);
  });

  test('create player card and the NFT (asset-id)', async () => {
    const { appAddress } = await tikiTaka360Client.appClient.getAppReference();
    const reserve = '5VXAQEFREBQQXT6YILFQQD57P2DX4QZ3VTNIJQ2EAYRYTSDOLF4EDEFVGI';
    const total = 1000;

    const args = {
      name: 'T15425',
      unitName: 'T15425',
      url: 'https://ipfs.algonode.xyz/ipfs/bafkreihnnyebbmjamef47wcczmea7p36q57ego5m3kcmgrageoe4q3szpa/',
      manager: appAddress,
      reserve,
      total,
    };

    playerCardId = Number(
      (
        await tikiTaka360Client.mintAndGetApp(args, {
          sendParams: { fee: algokit.microAlgos(8_000) },
        })
      ).return?.valueOf()
    );

    expect(playerCardId).toBeGreaterThan(0);
  });

  test('fund player card app (asset-id)', async () => {
    const appAddress = algosdk.getApplicationAddress(playerCardId);
    const amount: number | bigint = 50_050_000;

    expect(playerCardId).toBeDefined();

    await tikiTaka360Client.fundFactoryApp(
      { address: appAddress, appid: playerCardId, amount },
      {
        sendParams: { fee: algokit.microAlgos(4_000) },
      }
    );
  });

  test('create new challenge', async () => {
    const amount = 100_000;
    const testPlayerId: number = 440267;
    const { appAddress } = await tikiTaka360Client.appClient.getAppReference();

    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: challenger.addr,
      to: appAddress,
      amount,
      suggestedParams,
    });

    const transferResult = await tikiTaka360Client.createChallenge(
      {
        payment: paymentTxn,
        length: 1,
        given: 125,
        playerId: testPlayerId,
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

  test('participate in challenge', async () => {
    const amount = 43_400;
    const testPlayerId: number = 440267;
    const { appAddress } = await tikiTaka360Client.appClient.getAppReference();

    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: user.addr,
      to: appAddress,
      amount,
      suggestedParams,
    });

    const transferResult = await tikiTaka360Client.participate(
      {
        payment: paymentTxn,
        playerId: testPlayerId,
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

  test('collect sore points', async () => {
    const amount = 43_400;
    const { appAddress } = await tikiTaka360Client.appClient.getAppReference();

    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: user.addr,
      to: appAddress,
      amount,
      suggestedParams,
    });

    const transferResult = await tikiTaka360Client.collectScorePoints(
      {
        payment: paymentTxn,
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

  test('read score box', async () => {
    const transferResult = await tikiTaka360Client.readScoreBox({ address: user.addr });
    expect(transferResult.return).toStrictEqual([BigInt(100), BigInt(100)]);
  });

  test('remove challenge box', async () => {
    const testPlayerId: number = 440267;
    const transferResult = await tikiTaka360Client.removeChallengeBox(
      {
        playerId: testPlayerId,
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

  test('remove score box', async () => {
    const transferResult = await tikiTaka360Client.removeScoreBox(
      {
        address: user.addr,
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
});
