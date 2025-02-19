import { fork } from "child_process";

function roundRobin(array: any, index = 0) {
  return function () {
    if (index >= array.length) index = 0;
    return array[index++];
  };
}

//@ts-ignore
function initializeCluster({ backgroundTaskFile, clusterSize, onMessage }) {
  const processes = new Map();
  const getNextProcess = roundRobin([]);

  for (let i = 0; i < clusterSize; i++) {
    const child = fork(backgroundTaskFile);
    processes.set(child.pid, child);

    child.on("exit", () => {
      processes.delete(child.pid);
    });

    child.on("error", (error) => {
      console.error(`Erro no processo ${child.pid}: `, error);
      process.exit(1);
    });

    child.on("message", (message) => {
      onMessage(message);
    });
  }
}
