import { PlayerCardCaller } from './PlayerCard.algo';

// Address = 32 byte
// uint64 = 8 byte
type Prediction = { address: Address; prediction: uint64 }; // 40 byte
type Specification = { assetId: AssetID; given: uint64 }; // 16 byte
const oppBoxMbr = 2_500 + 48 * 400; // 21700 MicoAlgo
const participationFee = 18_300; // 18300 MicoAlgo

/* Challenge: Predict the assessment of our football celebrity.
 * The first 10 opponents with the correct prediction,
 * will win 100 challenge points.
 */
// eslint-disable-next-line no-unused-vars
class Challenge extends PlayerCardCaller {
  // Single box where the challenger stores its challenge specification (24 byte)
  challengeBox = BoxMap<Address, Specification>({ prefix: 'cb' });

  // The boxes that contain the keys of the winners, indexed by uint64
  winnerBoxes = BoxMap<uint64, Prediction>({ prefix: 'wnr' });

  // Days the challenge active
  challengeEnd: GlobalStateValue<uint64> = GlobalStateKey<uint64>();

  // The index of the next winnerBox to be created
  winnerIndex: GlobalStateValue<uint64> = GlobalStateKey<uint64>();

  // Local state for each user's assessment
  assessment = LocalStateKey<uint64>({ key: 'ua' });

  private withdraw(key: uint64, receiver: Address) {
    this.winnerBoxes(key).delete();

    sendPayment({
      receiver: receiver,
      amount: oppBoxMbr,
    });
  }

  // Factory create App
  createApplication(): void {
    this.winnerIndex.value = 0;
    this.challengeEnd.value = 0;
  }

  @allow.call('OptIn') // Allow anyone to OptIn to the contract so they can use local state
  @allow.call('NoOp') // Allow anyone to call the app again with a NoOp call (can only OptIn once)
  optInToApplication(): void {}

  startChallenge(length: uint64, given: uint64, assetId: AssetID): void {
    verifyAppCallTxn(this.txn, { sender: globals.creatorAddress });

    // Ensure the challenge hasn't already been started
    assert(this.challengeEnd.value === 0);

    // End of challenge calculation as timestamp. length == days
    this.challengeEnd.value = 86_400 * length + globals.latestTimestamp;

    // Create challenge box with the asset and the given value of the football celebrity
    this.challengeBox(globals.creatorAddress).value = { assetId: assetId, given: given };
  }

  participate(payment: PayTxn, prediction: uint64): void {
    // Ensure challenge hasn't ended
    assert(globals.latestTimestamp < this.challengeEnd.value);

    // Verify payment transaction
    verifyPayTxn(payment, {
      sender: this.txn.sender,
      receiver: globals.creatorAddress,
      amount: participationFee + oppBoxMbr,
    });

    // Set prediction as value for assessment local state
    this.assessment(this.txn.sender).value = prediction;

    // Set prediction as value for assessment local state
    if (prediction === this.challengeBox(globals.creatorAddress).value.given) {
      this.winnerBoxes(this.winnerIndex.value).value = { address: this.txn.sender, prediction: prediction };

      this.winnerIndex.value = this.winnerIndex.value + 1;
    }
  }

  endChallenge(): uint64 {
    verifyAppCallTxn(this.txn, { sender: globals.creatorAddress });

    // Ensure the challenge has ended to delete the box and repay
    // assert(this.challengeEnd.value < globals.latestTimestamp);

    // Loop over winners
    for (let i: uint64 = 0; i < this.winnerIndex.value; i = i + 1) {
      const winner = this.winnerBoxes(i).value.address;

      if (this.scoreBox(winner).exists) {
        const sp = this.scoreBox(winner).value.scoutingPoints;
        const cp = this.scoreBox(winner).value.challengePoints;
        this.updateScoreBox(winner, sp, 100 + cp);
      }

      if (!this.scoreBox(winner).exists) {
        this.scoreBox(winner).value = {
          scoutingPoints: 0,
          challengePoints: 100,
        };
      }

      // this.withdraw(i, winner);
    }
    return this.winnerIndex.value;
  }
}
