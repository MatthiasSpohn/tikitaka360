import { Contract } from '@algorandfoundation/tealscript';
import { PlayerCard } from './PlayerCard.algo';

// uint64 = 8 byte
// Address = 32 byte
type Scores = { scoutingPoints: uint64; challengePoints: uint64 }; // 16 byte
type Specification = { given: uint64; end: uint64; creator: Address }; // 48 byte

const challengeBoxMbr = 2_500 + 56 * 400; // 24900 MicoAlgo
const scoreBoxMbr = 2_500 + 48 * 400; // 21700 MicoAlgo
const extraFee = 75_100; // 75_100 MicoAlgo participation fee

// eslint-disable-next-line no-unused-vars
class TikiTaka360 extends Contract {
  // Box where the challenger stores the challenge-specs (24 byte)
  challengeBox = BoxMap<uint64, Specification>({ prefix: 'cb' });

  // Box where the participant collects the scores (48 byte)
  scoreBox = BoxMap<Address, Scores>({ prefix: 'sb' });

  // Number of active challenges
  challengeIndex = GlobalStateKey<uint64>();

  // Utility Token ID of the App
  tokenID = GlobalStateKey<AssetID>();

  // Function to create a new/empty scoreBox
  private createScoreBox(sender: Address) {
    this.scoreBox(sender).value = {
      scoutingPoints: 0,
      challengePoints: 0,
    };
  }

  bootstrap(): AssetID {
    verifyTxn(this.txn, { sender: this.app.creator });
    assert(!this.tokenID.exists);
    const registeredAsa = sendAssetCreation({
      configAssetName: 'TikiTaka360-Token',
      configAssetUnitName: 'TT360',
      configAssetTotal: 10_000_000_000,
      configAssetDecimals: 2,
      configAssetManager: this.app.address,
      configAssetFreeze: this.app.address,
      configAssetClawback: this.app.address,
      configAssetReserve: this.app.address,
    });
    this.tokenID.value = registeredAsa;
    return registeredAsa;
  }

  mintAndGetApp(
    name: string,
    unitName: string,
    url: string,
    manager: Address,
    reserve: Address,
    total: uint64
  ): uint64 {
    sendMethodCall<typeof PlayerCard.prototype.createApplication>({
      clearStateProgram: PlayerCard.clearProgram(),
      approvalProgram: PlayerCard.approvalProgram(),
      globalNumUint: 5,
      localNumUint: 1,
    });

    const factoryApp: AppID = this.itxn.createdApplicationID;

    sendPayment({
      amount: 500_000,
      receiver: factoryApp.address,
    });

    sendMethodCall<typeof PlayerCard.prototype.createNFT>({
      applicationID: factoryApp,
      methodArgs: [name, unitName, url, manager, reserve, total],
    });

    return factoryApp.id;
  }

  fundFactoryApp(address: Address, appid: uint64, amount: uint64): void {
    sendMethodCall<typeof PlayerCard.prototype.optInToToken>({
      applicationID: AppID.fromUint64(appid),
      methodArgs: [this.tokenID.value],
    });

    // base amount: 50_050_000
    sendAssetTransfer({
      xferAsset: this.tokenID.value,
      assetAmount: amount,
      assetReceiver: address,
    });
  }

  // the scouting- and challenge-points are saved in a box for each participant

  updateScoreBox(address: Address, sp: uint64, cp: uint64) {
    assert(this.scoreBox(address).exists);

    const currentScoutingPoints = this.scoreBox(address).value.scoutingPoints;
    const currentChallengePoints = this.scoreBox(address).value.challengePoints;

    this.scoreBox(address).value = {
      scoutingPoints: currentScoutingPoints + sp,
      challengePoints: currentChallengePoints + cp,
    };
  }

  createChallenge(payment: PayTxn, length: uint64, given: uint64, playerId: uint64) {
    // Ensure that there are no duplicate challenges
    assert(!this.challengeBox(playerId).exists);

    // Define maximum number of active challenges
    assert(this.challengeIndex.value < 5);

    // Verify payment transaction
    verifyPayTxn(payment, {
      sender: this.txn.sender,
      receiver: this.app.address,
      amount: challengeBoxMbr + extraFee,
    });

    /*
     * Create challenge box with the playerId as key and the given value
     * by the football celebrity and the end of challenge, calculated as timestamp.
     * length == days
     */
    this.challengeBox(playerId).value = {
      creator: this.txn.sender,
      given: given,
      end: 86_400 * length + globals.latestTimestamp,
    };

    // increment activeChallengesIndex
    this.challengeIndex.value = 1 + this.challengeIndex.value;
  }

  participate(payment: PayTxn, playerId: uint64, prediction: uint64): void {
    // Ensure that the challenge exists
    assert(this.challengeBox(playerId).exists);

    // Create scorebox for participant if not available
    if (!this.scoreBox(this.txn.sender).exists) {
      this.createScoreBox(this.txn.sender);
    }

    // Verify payment transaction
    verifyPayTxn(payment, {
      sender: this.txn.sender,
      receiver: this.app.address,
      amount: 2 * scoreBoxMbr,
    });

    // Compare given value with user prediction
    if (this.challengeBox(playerId).value.given === prediction) {
      this.updateScoreBox(this.txn.sender, 0, 100);
    }
  }

  collectScorePoints(payment: PayTxn) {
    // Create scorebox for participant if not available
    if (!this.scoreBox(this.txn.sender).exists) {
      this.createScoreBox(this.txn.sender);
    }
    // Verify payment transaction
    verifyPayTxn(payment, {
      sender: this.txn.sender,
      receiver: this.app.address,
      amount: 2 * scoreBoxMbr,
    });

    this.updateScoreBox(this.txn.sender, 100, 0);
  }

  readScoreBox(address: Address): { sp: uint64; cp: uint64 } {
    assert(this.scoreBox(address).exists);
    const sp = this.scoreBox(address).value.scoutingPoints;
    const cp = this.scoreBox(address).value.challengePoints;
    return { sp: sp, cp: cp };
  }

  removeChallengeBox(playerId: uint64) {
    sendPayment({
      receiver: this.challengeBox(playerId).value.creator,
      amount: challengeBoxMbr,
      fee: 1_000,
    });

    this.challengeBox(playerId).delete();
    this.challengeIndex.value = this.challengeIndex.value - 1;
  }

  removeScoreBox(address: Address) {
    sendPayment({
      receiver: address,
      amount: scoreBoxMbr,
      fee: 1_000,
    });

    this.scoreBox(address).delete();
  }
}
