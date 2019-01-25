import * as mongoose from 'mongoose';
import { config } from '../config/config';

const pool = {

};

export function makeConnection(tenantId: string = 'Default') {
    if (pool[tenantId]) {
        return pool[tenantId];
    }
    // if (tenantId === 'Default') {
    //     pool[tenantId] = mongoose.connection;
    //     return pool[tenantId];
    // }
    pool[tenantId] = mongoose.createConnection(config.mongo[`host${tenantId}`], { server: { socketOptions: { keepAlive: 5 } } });

    pool[tenantId].on('error', () => {
        throw new Error(`unable to connect to database: ${config.mongo[`host${tenantId}`]}`);
    }).on('connected', () => {
        console.log('Mongodb connected');
    });

    return pool[tenantId];
}

export default pool;
