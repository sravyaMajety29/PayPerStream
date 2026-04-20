import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { tapToStreamFactory } from "../artifacts/paypersec/tapToStreamClient";

// Below is a showcase of various deployment options you can use in TypeScript Client
export async function deploy() {
  console.log("=== Deploying tapToStream ===");

  const algorand = AlgorandClient.fromEnvironment();
  const deployer = await algorand.account.fromEnvironment("DEPLOYER");

  const factory = algorand.client.getTypedAppFactory(tapToStreamFactory, {
    defaultSender: deployer.addr,
  });

  const { appClient, result } = await factory.deploy({ onUpdate: "append", onSchemaBreak: "append" });

  // If app was just created fund the app account
  if (["create", "replace"].includes(result.operationPerformed)) {
    await algorand.send.payment({
      amount: (1).algo(),
      sender: deployer.addr,
      receiver: appClient.appAddress,
    });
  }

  // Initialize a sample stream
  console.log("Initializing sample stream...");

  const initResponse = await appClient.send.initializeStream({
    args: {
      title: "Sample Video Stream",
      duration: 60, // 1 minute
      pricePerSecond: 1000, // 1000 microAlgos per second
    },
  });
  console.log(`Stream initialized with transaction ID: ${initResponse.txIds[0]}`);

  // Update payment recipient to creator's address
  console.log("Setting payment recipient to creator's address...");
  const creatorRecipient = deployer.addr.toString();

  const updateResponse = await appClient.send.updatePaymentRecipient({
    args: {
      newRecipient: creatorRecipient,
    },
  });
  console.log(`Payment recipient updated with transaction ID: ${updateResponse.txIds[0]}`);

  // Get stream info
  const streamInfo = await appClient.send.getStreamInfo({
    args: [],
  });
  console.log(
    `Stream created: "${streamInfo.return?.title}" - ${streamInfo.return?.duration}s at ${streamInfo.return?.pricePerSecond} microAlgos/second`
  );
  console.log(`Payment recipient has been set to creator's address: ${creatorRecipient}`);
}
