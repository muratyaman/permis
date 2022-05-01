import { makeServer } from './server';

main();

async function main() {
  const server = await makeServer(process.env);
  server.listen(3001, () => console.log('IdP service is ready at http://localhost:3001'));
}
