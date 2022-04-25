"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.factory = void 0;
const express_1 = __importDefault(require("express"));
const redis_1 = require("redis");
const p = __importStar(require("./permis"));
async function factory(penv = process.env) {
    const server = (0, express_1.default)();
    const redis = (0, redis_1.createClient)({
        url: penv.REDIS_URL ?? 'redis://localhost:6379',
    });
    await redis.connect();
    const scopeRepo = new p.RepoWithRedis('oauth2_scopes', redis);
    const consumerRepo = new p.RepoWithRedis('oauth2_consumers', redis);
    const clientRepo = new p.RepoWithRedis('oauth2_clients', redis);
    const identityRepo = new p.RepoWithRedis('oauth2_users', redis);
    const consentRepo = new p.RepoWithRedis('oauth2_consents', redis);
    const authCodeRepo = new p.RepoWithRedis('oauth2_authorization_codes', redis);
    const tokenRepo = new p.RepoWithRedis('oauth2_tokens', redis);
    const securityService = new p.SecurityServiceDefault();
    const conf = {
        options: {
            logLevel: 'debug',
        },
        securityService,
        scopeService: new p.ScopeServiceWithRedis(scopeRepo),
        consumerService: new p.ConsumerServiceWithRedis(consumerRepo),
        clientService: new p.ClientServiceWithRedis(clientRepo, securityService),
        identitySerice: new p.IdentityServiceWithRedis(clientRepo, securityService),
        consentService: new p.ConsentServiceWithRedis(authCodeRepo),
        authCodeService: new p.AuthCodeServiceWithRedis(authCodeRepo),
        tokenService: new p.TokenServiceWithRedis(authCodeRepo),
    };
    const permis = new p.PermisService(conf);
    return { server };
}
exports.factory = factory;
