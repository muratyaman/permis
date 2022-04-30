import { factory } from './factory';

main();

async function main() {
  const { server } = await factory(process.env);
  server.listen(8000, () => console.log('Ready at http://localhost:8000'));
}
