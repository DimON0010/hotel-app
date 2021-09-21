import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { OgmaService } from '@ogma/nestjs-module';
import { Pool } from 'pg';
import { DATABASE_FEATURE, DATABASE_POOL } from './database.constants';
import { DatabaseService } from './database.service';

interface MockResult {
    id: number;
    field1: string;
    field2: string;
    field3: number;
    field4: boolean;
}

const returnResult: MockResult[] = [
    {
        id: 1,
        field1: 'value1',
        field2: 'value2',
        field3: 20,
        field4: false,
    },
    {
        id: 2,
        field1: 'value1',
        field2: 'value2',
        field3: 30,
        field4: true,
    },
    {
        id: 3,
        field1: 'value1',
        field2: 'value2',
        field3: 30,
        field4: true,
    },
];

describe('DatabaseService', () => {
    let module: TestingModule;
    let service: DatabaseService;
    let pool: DeepMocked<Pool>;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            providers: [
                DatabaseService,
                {
                    provide: DATABASE_POOL,
                    useValue: createMock<Pool>({
                        query: jest.fn().mockImplementation(() => {
                            return Promise.resolve({
                                command: 'SELECT * FROM test.base',
                                rowCount: 0,
                                oid: 'something, I guess',
                                fields: ['id', 'name'],
                                rows: returnResult,
                            });
                        }),
                    }),
                },
                {
                    provide: DATABASE_FEATURE,
                    useValue: { tableName: 'Testing' },
                },
                {
                    provide: OgmaService,
                    useValue: createMock<OgmaService>(),
                },
            ],
        }).compile();

        service = await module.resolve<DatabaseService>(
            DatabaseService,
        );
        pool = module.get<DeepMocked<Pool>>(DATABASE_POOL);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('queries', () => {
        it('should run the query and return correct response of SELECT *', async () => {
            const result = await service.executeQuery(`
            SELECT * FROM Testing
            `);

            expect(result).toBe(returnResult);
        });
    });
});