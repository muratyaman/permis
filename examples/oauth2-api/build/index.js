"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const factory_1 = require("./factory");
main();
async function main() {
    const { server } = await (0, factory_1.factory)(process.env);
    server.listen(8000, () => console.log('Ready at http://localhost:8000'));
}
