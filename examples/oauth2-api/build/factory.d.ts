/// <reference types="node" />
export declare function factory(penv?: NodeJS.ProcessEnv): Promise<{
    server: import("express-serve-static-core").Express;
}>;
