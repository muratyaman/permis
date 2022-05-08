import 'dotenv/config';
import { factory } from './factory';

main();

async function main() {
  const { server } = await factory(process.env);
  server.listen(8000, () => console.log('OAuth2 service is ready at http://localhost:8000'));
}
