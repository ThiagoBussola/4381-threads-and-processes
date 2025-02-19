import { createReadStream } from "fs";
import { cpus } from "node:os";
import readline from "readline";
import { initialize } from "./cluster";
import { sequelize, validateOrCreateTable } from "../db/connection";
import ValidatedUser from "../db/validated-users.model";

const inputFilePath = "./data/validate-users.ndjson";
const CLUSTER_SIZE = 8;
const INIT_TIMEOUT = 8000;

async function main() {
  try {
    await validateOrCreateTable(sequelize, ValidatedUser);

    let totalLines = 0;
    let processedLines = 0;

    const cp = initialize({
      backgroundTaskFile: "./src/child_process/background-task.ts",
      clusterSize: CLUSTER_SIZE,
      onMessage: () => {
        processedLines++;
        if (processedLines >= totalLines) {
          cp.killAll();
          console.log(`Total de registros processados: ${processedLines}`);
        }
      },
    });

    console.log(
      `Esperando ${INIT_TIMEOUT / 1000} segundos para iniciar os clusters`
    );

    await new Promise((resolve) => setTimeout(resolve, INIT_TIMEOUT));
  } catch (error) {}
}
