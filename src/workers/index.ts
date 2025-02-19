import { createReadStream, createWriteStream } from "fs";
import { Worker } from "worker_threads";
import readline from "readline";

const inputFilePath = "./data/legacy_users.ndjson";
const outputFilePath = "./data/encrypted_users.ndjson";

const numWorkers = 4;
const workers = Array.from(
  { length: numWorkers },
  () => new Worker("./src/workers/encrypt-worker.ts")
);

function encryptWithWorker(item: any) {
  return new Promise((resolve, reject) => {
    const worker = workers.find((w) => w.threadId !== null);

    if (!worker) {
      reject(new Error("Nenhum Worker Disponivel"));
      return;
    }

    const cleanup = () => {
      worker.off("message", onMessage);
      worker.off("error", onError);
    };

    const onMessage = (encryptedItem: any) => {
      resolve(JSON.stringify(encryptedItem).concat("\n"));
      cleanup();
    };

    const onError = (err: any) => {
      console.error("Worker Error: ", err);
      reject(err);
      cleanup();
    };

    worker.once("message", onMessage);
    worker.once("error", onError);

    worker.postMessage(item);
  });
}

async function processFile() {
  const readStream = createReadStream(inputFilePath);
  const writeStream = createWriteStream(outputFilePath);

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const item = JSON.parse(line);
    const encryptedLine = await encryptWithWorker(item);
    writeStream.write(encryptedLine);
  }

  writeStream.end();
}

(async () => {
  console.time("password-encrypt");
  await processFile();
  workers.forEach((worker) => worker.terminate());
  console.timeEnd("password-encrypt");
  console.log("Encryption process completed");
})();
