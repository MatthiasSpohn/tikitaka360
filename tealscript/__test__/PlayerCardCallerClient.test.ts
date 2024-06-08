import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';
import { PlayerCardCallerClient } from '../contracts/clients/PlayerCardCallerClient';

const fixture = algorandFixture();
algokit.Config.configure({ populateAppCallResources: true });

let playerCardCaller: PlayerCardCallerClient;
let algod: algosdk.Algodv2;
let playerCardId: number | bigint;

describe('PlayerCardCallerFactory', () => {
  beforeEach(fixture.beforeEach);

  beforeAll(async () => {
    await fixture.beforeEach();
    algod = fixture.context.algod;
    const { testAccount } = fixture.context;

    playerCardCaller = new PlayerCardCallerClient(
      {
        sender: testAccount,
        resolveBy: 'id',
        id: 0,
      },
      algod
    );
  });

  test.skip('create the caller application', async () => {
    await playerCardCaller.create.createApplication({});
    await playerCardCaller.appClient.fundAppAccount(algokit.microAlgos(5_000_000));
  }, 15_000);

  test.skip('', async () => {
    const tokenID = Number(
      (
        await playerCardCaller.bootstrap(
          {},
          {
            sendParams: { fee: algokit.microAlgos(2_000) },
          }
        )
      ).return?.valueOf()
    );
    expect(tokenID).toBeGreaterThan(0);
  });

  test.skip('create player card and the NFT (asset-id)', async () => {
    const { appAddress } = await playerCardCaller.appClient.getAppReference();
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
        await playerCardCaller.mintAndGetApp(args, {
          sendParams: { fee: algokit.microAlgos(8_000) },
        })
      ).return?.valueOf()
    );

    expect(playerCardId).toBeGreaterThan(0);
  });

  test.skip('fund player card app (asset-id)', async () => {
    const appAddress = algosdk.getApplicationAddress(playerCardId);
    const amount: number | bigint = 50_050_000;

    expect(playerCardId).toBeDefined();

    await playerCardCaller.fundFactoryApp(
      { address: appAddress, appid: playerCardId, amount },
      {
        sendParams: { fee: algokit.microAlgos(4_000) },
      }
    );
  });
});
