// seed-validated-users.ts
import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import * as readline from 'readline';

const uri = 'mongodb://localhost:27017'; // Substitua pelo URI do seu MongoDB
const dbName = 'users'; // Substitua pelo nome do seu banco de dados
const collectionName = 'validatedUsers'; // Nome da coleção

async function seedDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Limpa a coleção antes de inserir novos dados
    await collection.deleteMany({});
    console.log('Coleção limpa');

    // Lê o arquivo NDJSON
    const fileStream = fs.createReadStream('./validate-users.ndjson');
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const batchSize = 1000;
    let batch: any[] = [];

    for await (const line of rl) {
      const user = JSON.parse(line);
      batch.push(user);

      if (batch.length >= batchSize) {
        await collection.insertMany(batch);
        batch = [];
      }
    }

    // Insere qualquer dado restante
    if (batch.length > 0) {
      await collection.insertMany(batch);
    }

    console.log('Dados inseridos com sucesso!');
  } catch (error) {
    console.error('Erro ao inserir dados:', error);
  } finally {
    await client.close();
    console.log('Conexão com o MongoDB fechada');
  }
}

seedDatabase().catch(console.error);
