import {
  Contract,
  abimethod,
  GlobalState,
  LocalState,
  Txn,
  itxn,
  assert,
  type uint64,
  gtxn,
  Global,
  type Account,
} from "@algorandfoundation/algorand-typescript";

// Tap-to-Stream: Pay-per-second streaming platform with 10-second intervals
export class TapToStream extends Contract {
  // Hardcoded payment recipient address stored in global state
  public paymentRecipient = GlobalState<Account>();

  // Stream metadata stored in global state
  public streamOwner = GlobalState<Account>();
  public streamTitle = GlobalState<string>();
  public streamDuration = GlobalState<uint64>(); // in seconds
  public pricePerSecond = GlobalState<uint64>(); // in microAlgos
  public streamActive = GlobalState<boolean>();

  // Payment tracking
  public totalEarnings = GlobalState<uint64>();

  // User streaming session state
  public userHeldAmount = LocalState<uint64>(); // Amount held for current 10-second interval
  public userLastPaymentTime = LocalState<uint64>(); // Last payment timestamp
  public userTotalPaid = LocalState<uint64>(); // Total amount paid by user
  public userWatchStartTime = LocalState<uint64>(); // When user started watching

  /**
   * Initialize a new stream with hardcoded payment recipient
   */
  @abimethod()
  public initializeStream(title: string, duration: uint64, pricePerSecond: uint64): void {
    this.streamOwner.value = Txn.sender;
    this.streamTitle.value = title;
    this.streamDuration.value = duration;
    this.pricePerSecond.value = pricePerSecond;
    this.streamActive.value = true;
    this.totalEarnings.value = 0;

    // Set hardcoded payment recipient
    // We'll use a temporary workaround - set it to the contract creator initially
    // and then update with the hardcoded address in deployment
    this.paymentRecipient.value = Txn.sender;
  }

  /**
   * Start streaming session - user deposits for 10-second interval
   */
  @abimethod()
  public startStreaming(payment: gtxn.PaymentTxn): void {
    assert(this.streamActive.value, "Stream not active");

    // Calculate cost for 10 seconds
    const tenSecondCost = (this.pricePerSecond.value * 10) as uint64;

    // Verify payment transaction
    assert(payment.receiver === Global.currentApplicationAddress, "Payment must be to app");
    assert(payment.amount >= tenSecondCost, "Insufficient payment for 10-second interval");

    // Store held amount and start time
    this.userHeldAmount(Txn.sender).value = tenSecondCost;
    this.userWatchStartTime(Txn.sender).value = Global.latestTimestamp;
    this.userLastPaymentTime(Txn.sender).value = Global.latestTimestamp;
  }

  /**
   * Process 10-second interval payment
   */
  @abimethod()
  public processInterval(): void {
    assert(this.streamActive.value, "Stream not active");

    const heldAmount = this.userHeldAmount(Txn.sender).value;
    const lastPaymentTime = this.userLastPaymentTime(Txn.sender).value;

    assert(heldAmount > 0, "No held amount to process");
    assert(Global.latestTimestamp >= lastPaymentTime + 10, "Interval not complete yet");

    // Transfer held amount to payment recipient
    itxn
      .payment({
        receiver: this.paymentRecipient.value,
        amount: heldAmount,
        fee: 0,
      })
      .submit();

    // Update tracking
    this.totalEarnings.value = (this.totalEarnings.value + heldAmount) as uint64;
    this.userTotalPaid(Txn.sender).value = (this.userTotalPaid(Txn.sender).value + heldAmount) as uint64;
    this.userLastPaymentTime(Txn.sender).value = Global.latestTimestamp;

    // Reset held amount (user needs to deposit again for next interval)
    this.userHeldAmount(Txn.sender).value = 0;
  }

  /**
   * Continue streaming - deposit for next 10-second interval
   */
  @abimethod()
  public continueStreaming(payment: gtxn.PaymentTxn): void {
    assert(this.streamActive.value, "Stream not active");
    assert(this.userWatchStartTime(Txn.sender).value > 0, "Must start streaming first");

    // Calculate cost for 10 seconds
    const tenSecondCost = (this.pricePerSecond.value * 10) as uint64;

    // Verify payment transaction
    assert(payment.receiver === Global.currentApplicationAddress, "Payment must be to app");
    assert(payment.amount >= tenSecondCost, "Insufficient payment for 10-second interval");

    // Store held amount for next interval
    this.userHeldAmount(Txn.sender).value = tenSecondCost;
  }

  /**
   * Stop streaming and refund any remaining held amount
   */
  @abimethod()
  public stopStreaming(): void {
    const heldAmount = this.userHeldAmount(Txn.sender).value;

    if (heldAmount > 0) {
      // Refund held amount to user
      itxn
        .payment({
          receiver: Txn.sender,
          amount: heldAmount,
          fee: 0,
        })
        .submit();
    }

    // Reset user state
    this.userHeldAmount(Txn.sender).value = 0;
    this.userWatchStartTime(Txn.sender).value = 0;
  }

  /**
   * Update payment recipient (only owner can call)
   */
  @abimethod()
  public updatePaymentRecipient(newRecipient: Account): void {
    assert(Txn.sender === this.streamOwner.value, "Only owner can update recipient");
    this.paymentRecipient.value = newRecipient;
  }

  /**
   * Emergency stop - only stream owner can call
   */
  @abimethod()
  public emergencyStop(): void {
    assert(Txn.sender === this.streamOwner.value, "Only owner can emergency stop");
    this.streamActive.value = false;
  }

  /**
   * Get stream info
   */
  @abimethod({ readonly: true })
  public getStreamInfo(): {
    title: string;
    duration: uint64;
    pricePerSecond: uint64;
    tenSecondCost: uint64;
    totalEarnings: uint64;
    active: boolean;
  } {
    return {
      title: this.streamTitle.value,
      duration: this.streamDuration.value,
      pricePerSecond: this.pricePerSecond.value,
      tenSecondCost: (this.pricePerSecond.value * 10) as uint64,
      totalEarnings: this.totalEarnings.value,
      active: this.streamActive.value,
    };
  }

  /**
   * Get user streaming session info
   */
  @abimethod({ readonly: true })
  public getUserStreamingInfo(): {
    heldAmount: uint64;
    lastPaymentTime: uint64;
    totalPaid: uint64;
    watchStartTime: uint64;
    canProcessInterval: boolean;
  } {
    const lastPaymentTime = this.userLastPaymentTime(Txn.sender).value;
    const canProcess = lastPaymentTime > 0 && Global.latestTimestamp >= lastPaymentTime + 10;

    return {
      heldAmount: this.userHeldAmount(Txn.sender).value,
      lastPaymentTime: lastPaymentTime,
      totalPaid: this.userTotalPaid(Txn.sender).value,
      watchStartTime: this.userWatchStartTime(Txn.sender).value,
      canProcessInterval: canProcess,
    };
  }
}
