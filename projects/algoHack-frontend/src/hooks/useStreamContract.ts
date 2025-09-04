import { useState, useEffect, useCallback, useMemo } from "react";
import { useWallet } from "../context/WalletContext";
import { TapToStreamClient, TapToStreamFactory, GetStreamInfoResult } from "../contracts/TapToStream";
import { AlgorandClient, microAlgo } from "@algorandfoundation/algokit-utils";
import algosdk from "algosdk";
import { toast } from "sonner";
import { getAlgodConfigFromViteEnvironment } from "../utils/getAlgorandConfigs";

// Use the deployed App ID from environment or fallback to deployed ID
const DEMO_APP_ID = parseInt(import.meta.env.VITE_APP_ID || import.meta.env.VITE_STREAM_APP_ID || "1015");

export function useStreamContract() {
  const { transactionSigner, activeAddress } = useWallet();
  const stableSigner = useMemo(() => transactionSigner, [activeAddress]);

  const [streamClient, setStreamClient] = useState<TapToStreamClient | null>(null);
  const [streamInfo, setStreamInfo] = useState<GetStreamInfoResult | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [totalPaid, setTotalPaid] = useState(0);

  // Initialize client when wallet connects
  useEffect(() => {
    if (!activeAddress || !stableSigner) {
      setStreamClient(null);
      setStreamInfo(null);
      return;
    }

    try {
      // Create Algorand client
      const algodConfig = getAlgodConfigFromViteEnvironment();
      const algorand = AlgorandClient.fromConfig({ algodConfig });

      // Create the TapToStream client using factory pattern
      const factory = new TapToStreamFactory({
        defaultSender: activeAddress,
        algorand,
      });

      const client = factory.getAppClientById({
        appId: BigInt(DEMO_APP_ID),
        defaultSender: activeAddress,
        defaultSigner: stableSigner,
      });

      // Set default signer for algorand client
      client.algorand.setDefaultSigner(stableSigner);

      setStreamClient(client);

      // Load stream info
      client.send
        .getStreamInfo()
        .then((result) => {
          setStreamInfo(result.return!);
        })
        .catch((err: any) => {
          console.error("Failed to load stream info:", err);
        });
    } catch (error) {
      console.error("Failed to create stream client:", error);
      setStreamClient(null);
      setStreamInfo(null);
    }
  }, [activeAddress, stableSigner]);

  const startStreaming = useCallback(async () => {
    if (!streamClient || !streamInfo || !activeAddress) {
      toast.error("Wallet not connected or stream not loaded");
      return false;
    }

    try {
      console.log("🚀 Starting streaming session...");
      toast.loading("Starting streaming session...", { id: "start-stream" });

      // Check if user is opted into the app by checking account info directly
      let userOptedIn = false;
      try {
        const accountInfo = await streamClient.appClient.algorand.client.algod.accountInformation(activeAddress).do();
        const appLocalState = accountInfo.appsLocalState;
        userOptedIn = appLocalState ? appLocalState.some((app: any) => app.id === streamClient.appClient.appId) : false;
        console.log("📋 User opt-in status:", userOptedIn);
      } catch (err: any) {
        console.log("⚠️ Could not check opt-in status, assuming not opted in:", err.message);
        userOptedIn = false;
      }

      // Skip manual opt-in and let startStreaming handle it automatically
      console.log("🚀 Proceeding to startStreaming (with auto opt-in if needed)...");

      // Get stream info to calculate cost
      const streamInfo = await streamClient.send.getStreamInfo();
      if (!streamInfo.returns || streamInfo.returns.length === 0) {
        throw new Error("Failed to get stream info");
      }

      // Extract the actual return value from the ABI result
      const returnResult = streamInfo.returns[0];
      const [title, duration, pricePerSecond, totalEarnings, streamActiveValue, canProcessInterval] = returnResult.returnValue as [
        string,
        bigint,
        bigint,
        bigint,
        bigint,
        boolean
      ];

      console.log("🔍 Raw stream info returns:", streamInfo.returns);
      console.log("🔍 Return result:", returnResult);
      console.log("🔍 Return value:", returnResult.returnValue);
      console.log("🔍 Individual values:", {
        title,
        duration,
        pricePerSecond,
        totalEarnings,
        streamActiveValue,
        canProcessInterval,
      });

      // Convert to proper types (handle BigInt values)
      const titleStr = String(title);
      const durationNum = Number(duration);
      const pricePerSecondNum = Number(pricePerSecond);
      const totalEarningsNum = Number(totalEarnings);
      const streamActiveNum = Boolean(Number(streamActiveValue)); // streamActive is stored as uint64 (0/1)

      console.log("📺 Stream info parsed:", {
        title: titleStr,
        duration: durationNum,
        pricePerSecond: pricePerSecondNum,
        totalEarnings: totalEarningsNum,
        streamActive: streamActiveNum,
        canProcessInterval,
      });

      // Check if stream is active
      if (!streamActiveNum) {
        console.log("⚠️ Stream is not active, but proceeding with startStreaming anyway...");
        console.log("🔍 Current user:", activeAddress);
        console.log("🔍 This might be because the stream needs to be activated by starting it");

        // Instead of trying to reinitialize, let's proceed with startStreaming
        // The contract might activate the stream when the first user starts streaming
      }

      // Check if pricePerSecond matches expected value (1000 microAlgos from deploy config)
      const expectedPricePerSecond = 1000;
      if (pricePerSecondNum !== expectedPricePerSecond) {
        console.warn(`⚠️ Price per second mismatch. Expected: ${expectedPricePerSecond}, Got: ${pricePerSecondNum}`);
      }

      // Create payment amount for 10 seconds
      const tenSecondCost = pricePerSecondNum * 10;
      console.log("💰 Ten second cost:", tenSecondCost, "microAlgos");
      console.log("📍 App address:", streamClient.appClient.appAddress);
      console.log("🆔 App ID:", streamClient.appClient.appId);
      console.log("🔍 Expected app address: 2KOUANKJKMEZK4WG5RWKG75DNFVQPK774XDVKVDUEZKW7ERORGIYHLSGDU");

      console.log("💳 Payment amount:", tenSecondCost, "microAlgos");
      console.log("💳 Payment sender:", activeAddress);
      console.log("💳 Payment receiver:", streamClient.appClient.appAddress);

      // Create payment transaction with explicit parameters
      const paymentTxn = await streamClient.appClient.algorand.createTransaction.payment({
        sender: activeAddress,
        receiver: streamClient.appClient.appAddress,
        amount: microAlgo(tenSecondCost),
        note: new TextEncoder().encode("TapToStream payment"),
      });

      console.log("💳 Payment transaction created successfully");

      try {
        // Skip manual opt-in and let startStreaming handle it
        console.log("🎬 Starting streaming (will handle opt-in if needed)...");

        // Now call startStreaming - it should handle opt-in automatically if needed
        const result = await streamClient.send.startStreaming({
          args: {
            payment: paymentTxn,
          },
          sender: activeAddress,
        });
        console.log("✅ Start streaming result:", result);

        setIsStreaming(true);
        setSessionStartTime(new Date());
        setTotalPaid(tenSecondCost / 1000000); // Convert microAlgos to ALGOs

        toast.success(`Streaming started! Paid ${(tenSecondCost / 1000000).toFixed(3)} ALGO for first 10 seconds`, {
          id: "start-stream",
        });

        console.log("✅ Streaming started, transaction:", result.txIds[0]);
      } catch (startError: any) {
        console.error("❌ Start streaming failed:", startError);

        // Try to get more details about the app state
        try {
          const appState = await streamClient.appClient.getGlobalState();
          console.log("🔍 App global state:", appState);
        } catch (stateError) {
          console.error("❌ Failed to get app state:", stateError);
        }

        throw startError;
      }

      // Set up 10-second interval for payments
      const id = setInterval(async () => {
        try {
          console.log("⏰ Processing 10-second interval...");

          // First process the previous interval
          await streamClient.send.processInterval();
          console.log("✅ Previous interval processed");

          // Create payment transaction for next interval
          const nextPaymentTxn = await streamClient.appClient.algorand.createTransaction.payment({
            sender: activeAddress,
            amount: microAlgo(tenSecondCost),
            receiver: streamClient.appClient.appAddress,
          });

          // Then pay for the next interval
          await streamClient.send.continueStreaming({
            args: {
              payment: nextPaymentTxn,
            },
          });
          console.log("✅ Next interval payment made");

          setTotalPaid((prev) => prev + tenSecondCost / 1000000);

          toast.success(`10-second interval complete. Paid ${(tenSecondCost / 1000000).toFixed(3)} ALGO`, {
            duration: 2000,
          });
        } catch (error) {
          console.error("❌ Failed to process interval:", error);
          toast.error("Failed to process payment interval. Stopping stream.");
          stopStreaming();
        }
      }, 10000); // Every 10 seconds

      setIntervalId(id);
      return true;
    } catch (error) {
      console.error("❌ Failed to start streaming:", error);
      toast.error("Failed to start streaming session", { id: "start-stream" });
      return false;
    }
  }, [streamClient, streamInfo, activeAddress]);

  const stopStreaming = useCallback(async () => {
    if (!streamClient || !activeAddress) {
      return;
    }

    try {
      console.log("🛑 Stopping streaming session...");

      // Clear the interval
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }

      // Stop streaming contract and get refund for unused time
      await streamClient.send.stopStreaming();

      setIsStreaming(false);

      const sessionDuration = sessionStartTime ? (new Date().getTime() - sessionStartTime.getTime()) / 1000 : 0;

      toast.success(`Streaming stopped. Session: ${Math.round(sessionDuration)}s, Total paid: ${totalPaid.toFixed(3)} ALGO`);

      console.log("✅ Streaming session ended");
    } catch (error) {
      console.error("❌ Failed to stop streaming:", error);
      toast.error("Failed to stop streaming session");
    }
  }, [streamClient, activeAddress, intervalId, sessionStartTime, totalPaid]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return {
    streamClient,
    streamInfo,
    isStreaming,
    sessionStartTime,
    totalPaid,
    startStreaming,
    stopStreaming,
    isWalletConnected: !!activeAddress,
  };
}
