import 'dotenv/config';
import { factory } from './factory';
import { IEnvSettings } from './types';

main();

async function main() {
  const penv: IEnvSettings = process.env;
  const port = Number.parseInt(penv.HTT_PORT ?? '8000');
  const { server } = await factory(penv);
  server.listen(port, () => console.log(`Auth service is ready at http://localhost:${port}`));
}
