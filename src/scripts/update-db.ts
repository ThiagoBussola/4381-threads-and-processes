import { connectDB, closeDB } from "../db/connection";
import User from "../db/user.model";
import { existsSync, mkdirSync } from "node:fs";
import { createReadStream } from "fs";
import readline from "readline";

const dataDir = "./data";
if (!existsSync(dataDir)) {
  mkdirSync(dataDir);
}

console.time("update-database");

async function processUpdates() {
  const batchSize = 100;
  let batch = [];

  const updateBatch = async (batch: any) => {
    const updatePromises = batch.map((item: any) => {
      return User.update(
        { password: item.password },
        { where: { id: item.id } }
      );
    });

    await Promise.all(updatePromises);
  };

  const readStream = createReadStream(`${dataDir}/encrypted_users.ndjson`);
  const rl = readline.createInterface({ input: readStream });

  for await (const line of rl) {
    const user = JSON.parse(line);
    batch.push(user);

    if (batch.length >= batchSize) {
      await updateBatch(batch);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await updateBatch(batch);
  }
}

(async () => {
  await connectDB();
  try {
    console.time("update-database");
    await processUpdates();
    console.log("Database updated successfully!");
  } catch (error) {
    console.error("Error updating database:", error);
  } finally {
    await closeDB();
    console.timeEnd("update-database");
  }
})();
