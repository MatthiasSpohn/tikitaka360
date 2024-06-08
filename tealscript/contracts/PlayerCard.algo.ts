import { Contract } from '@algorandfoundation/tealscript';

class PlayerCard extends Contract {
  globalReview = GlobalStateKey<uint64>({ key: 'r' });

  reviewCount = GlobalStateKey<uint64>({ key: 'c' });

  assetId = GlobalStateKey<AssetID>({ key: 'n' });

  assetPrice = GlobalStateKey<uint64>({ key: 'p' });

  tokenId = GlobalStateKey<AssetID>({ key: 't' });

  localReview = LocalStateKey<uint64>({ key: 'l' });

  private doAxfer(receiver: Address, asset: AssetID, amount: uint64): void {
    sendAssetTransfer({
      assetReceiver: receiver,
      xferAsset: asset,
      assetAmount: amount,
    });
  }

  private doOptIn(asset: AssetID): void {
    this.doAxfer(this.app.address, asset, 0);
  }

  // Factory create App
  createApplication(): void {
    this.globalReview.value = 0;
    this.reviewCount.value = 0;
    this.assetPrice.value = 0;
    this.assetId.value = AssetID.zeroIndex;
    this.tokenId.value = AssetID.zeroIndex;
  }

  // Factory OptIn to Utility Token
  optInToToken(asset: AssetID): void {
    this.tokenId.value = asset;
    this.doOptIn(asset);
  }

  @allow.call('OptIn') // Allow anyone to OptIn to the contract so they can use local state
  @allow.call('NoOp') // Allow anyone to call the app again with a NoOp call (can only OptIn once)
  optInToApplication(): void {
    this.localReview(this.txn.sender).value = 0;
  }

  // Factory create NFT
  createNFT(name: string, unitName: string, url: string, manager: Address, reserve: Address, total: uint64): AssetID {
    const createdAsset = sendAssetCreation({
      configAssetName: name,
      configAssetUnitName: unitName,
      configAssetURL: url,
      configAssetManager: manager,
      configAssetReserve: reserve,
      configAssetDecimals: 0,
      configAssetTotal: total,
      configAssetDefaultFrozen: 0,
    });
    this.assetId.value = createdAsset;
    return createdAsset;
  }

  // This method will increment a counter in local state
  setNewReview(newUserReview: uint64): uint64 {
    assert(this.txn.sender.isOptedInToApp(this.app.id));
    assert(this.txn.sender.isOptedInToAsset(this.tokenId.value));

    const globalReview = this.globalReview.value;
    let reviewCount = this.reviewCount.value;
    const localReview = this.localReview(this.txn.sender).value;

    if (localReview === 0) {
      this.doAxfer(this.txn.sender, this.tokenId.value, 10 * (1_000 - this.reviewCount.value));
    }

    if (localReview > 0) {
      // The user has already set a review value for this contract. We do not count again!
      // We subtract the previous review and decremented the counter by 1.
      reviewCount = reviewCount - 1;
      if (reviewCount === 0) {
        this.globalReview.value = 0;
      } else {
        this.globalReview.value = (globalReview * reviewCount - localReview) / reviewCount;
      }
    }

    // We start (again) and increment the counter
    this.reviewCount.value = reviewCount + 1;

    this.localReview(this.txn.sender).value = newUserReview;

    this.globalReview.value = (globalReview * reviewCount + newUserReview) / this.reviewCount.value;

    // The more reviews, the higher the base price of the asset.
    this.assetPrice.value = 250_000 * this.reviewCount.value;

    return this.globalReview.value;
  }

  // App User OptIn to NFT
  assetOptIn(txn: AssetTransferTxn): void {
    verifyAssetTransferTxn(txn, {
      assetReceiver: this.txn.sender,
      assetAmount: { lessThanEqualTo: 0 },
    });
  }

  // App User OptIn to Utility Token
  tokenOptIn(txn: AssetTransferTxn): void {
    verifyAssetTransferTxn(txn, {
      assetReceiver: this.txn.sender,
      assetAmount: { lessThanEqualTo: 0 },
    });
  }

  // App User purchase NFT
  purchaseNft(payment: PayTxn): void {
    verifyTxn(payment, {
      receiver: this.app.creator,
      amount: { greaterThanEqualTo: this.assetPrice.value },
    });

    sendAssetTransfer({
      xferAsset: this.assetId.value,
      assetAmount: 1,
      assetReceiver: this.txn.sender,
    });
  }
}

// const spBoxMbr = 2_500 + 40 * 400; // 18500 MicoAlgo
// uint64 = 8 byte
// Address = 32 byte array
type Points = { scoutingPoints: uint64; challengePoints: uint64 };

// eslint-disable-next-line no-unused-vars
export class PlayerCardCaller extends Contract {
  scoreBox = BoxMap<Address, Points>({ prefix: 'sb' });

  tokenID = GlobalStateKey<AssetID>();

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
  createScoreBox() {
    assert(this.txn.sender === this.app.address);
    assert(!this.scoreBox(this.txn.sender).exists);

    this.scoreBox(this.txn.sender).value = {
      scoutingPoints: 0,
      challengePoints: 0,
    };
  }

  updateScoreBox(address: Address, sp: uint64, cp: uint64) {
    assert(this.txn.sender === this.app.address);
    assert(this.scoreBox(address).exists);

    const currentScoutingPoints = this.scoreBox(address).value.scoutingPoints;
    const currentChallengePoints = this.scoreBox(address).value.challengePoints;

    this.scoreBox(address).value = {
      scoutingPoints: currentScoutingPoints + sp,
      challengePoints: currentChallengePoints + cp,
    };
  }
}
