import { config } from "./config";
import * as Redis from "ioredis";

let client: Redis.Redis;

export let getInstance = () => {
    if (!client) {
        client = createInstance();
    }
    return client;
};

export let createInstance = () => {
    const instance = new Redis(config.redis.uri);
    instance.on("error", msg => console.log("Redis Client: " + msg));
    instance.on("connect", () => console.log("Redis Client: Connected"));
    return instance;
};