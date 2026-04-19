import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1776554656165 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryRunner.query(`CREATE TABLE "users" (
        id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true
    );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
  }
}
