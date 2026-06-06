import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    type: 'expo',
    database: 'myapp.db',
    entities: [],
    synchronize: true, // Automatically creates tables based on entities (dev only)
    logging: true,
});