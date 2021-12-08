"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.agent = void 0;
var core_1 = require("@veramo/core");
// Core identity manager plugin
var did_manager_1 = require("@veramo/did-manager");
// Ethr did identity provider
var did_provider_ethr_1 = require("@veramo/did-provider-ethr");
// Web did identity provider
var did_provider_web_1 = require("@veramo/did-provider-web");
// Core key manager plugin
var key_manager_1 = require("@veramo/key-manager");
// Custom key management system for RN
var kms_local_1 = require("@veramo/kms-local");
// Custom resolvers
var did_resolver_1 = require("@veramo/did-resolver");
var did_resolver_2 = require("did-resolver");
var ethr_did_resolver_1 = require("ethr-did-resolver");
var web_did_resolver_1 = require("web-did-resolver");
// Storage plugin using TypeOrm
var data_store_1 = require("@veramo/data-store");
// TypeORM is installed with `@veramo/data-store`
var typeorm_1 = require("typeorm");
// This will be the name for the local sqlite database for demo purposes
var DATABASE_FILE = 'database.sqlite';
// You will need to get a project ID from infura https://www.infura.io
var INFURA_PROJECT_ID = '9273e0d250174b83ad248e75d54375cc';
// This will be the secret key for the KMS 
var KMS_SECRET_KEY = "0137e6e6097942aba780c1afd48910b9";
var dbConnection = (0, typeorm_1.createConnection)({
    type: 'sqlite',
    database: DATABASE_FILE,
    synchronize: false,
    migrations: data_store_1.migrations,
    migrationsRun: true,
    logging: ['error', 'info', 'warn'],
    entities: data_store_1.Entities
});
exports.agent = (0, core_1.createAgent)({
    plugins: [
        new key_manager_1.KeyManager({
            store: new data_store_1.KeyStore(dbConnection),
            kms: {
                local: new kms_local_1.KeyManagementSystem(new data_store_1.PrivateKeyStore(dbConnection, new kms_local_1.SecretBox(KMS_SECRET_KEY)))
            }
        }),
        new did_manager_1.DIDManager({
            store: new data_store_1.DIDStore(dbConnection),
            defaultProvider: 'did:ethr:rinkeby',
            providers: {
                'did:ethr:rinkeby': new did_provider_ethr_1.EthrDIDProvider({
                    defaultKms: 'local',
                    network: 'rinkeby',
                    rpcUrl: 'https://rinkeby.infura.io/v3/' + INFURA_PROJECT_ID
                }),
                'did:web': new did_provider_web_1.WebDIDProvider({
                    defaultKms: 'local'
                })
            }
        }),
        new did_resolver_1.DIDResolverPlugin({
            resolver: new did_resolver_2.Resolver(__assign(__assign({}, (0, ethr_did_resolver_1.getResolver)({ infuraProjectId: INFURA_PROJECT_ID })), (0, web_did_resolver_1.getResolver)()))
        }),
    ]
});
