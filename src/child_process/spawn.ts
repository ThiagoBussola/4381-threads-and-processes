import { spawn } from "child_process";
import { createReadStream, createWriteStream } from "fs";
import readline from "readline";

const inputFilePath = "./data/users.ndjson";
const outputFilePath = "./data/validate-users.ndjson";

async function processWithPython() {
  const pythonProcess = spawn("python3", [
    "./src/scripts/validate_passwords.py",
  ]);

  const inputStream = createReadStream(inputFilePath);
  const outputStream = createWriteStream(outputFilePath);
  const rl = readline.createInterface({
    input: inputStream,
  });

  rl.on("line", (line) => {
    pythonProcess.stdin.write(line + "\n");
  });

  rl.on("close", () => {
    pythonProcess.stdin.end();
  });

  pythonProcess.stdout.on("data", (data) => {
    outputStream.write(data.toString());
  });

  pythonProcess.on("close", (code) => {
    outputStream.end();
    if (code === 0) {
      console.log(
        "Processamento concluido com sucesso, saida salva no arquivo: ",
        outputFilePath
      );
    } else {
      console.error("Python script finalizado com o erro:", code);
    }
  });
}

processWithPython();
