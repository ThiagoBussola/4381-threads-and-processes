import { closeDB, connectDB } from "../db/connection";
import User from "../db/user.model";
import { faker } from "@faker-js/faker";
function generateUser() {
  return {
    name: faker.internet.username(),
    company: faker.company.name(),
    dateBirth: faker.date.past(),
    password: faker.internet.username() + faker.company.name(),
    createdAt: faker.date.past({
      years: 10,
      refDate: new Date(),
    }),
    updatedAt: faker.date.past({
      years: 9,
      refDate: new Date(),
    }),
    lastPasswordUpdateAt: faker.date.past({
      years: 8,
      refDate: new Date(),
    }),
  };
}
async function seedUsers() {
  try {
    for (let i = 0; i < 200_000; i++) {
      const user = generateUser();
      await User.create(user);
    }
  } catch (error) {
    console.error("Erro ao cadastrar usuários", error);
  }
}
(async () => {
  await connectDB();
  console.time("seed-db");
  await seedUsers();
  console.timeEnd("seed-db");
  await closeDB();
})();
