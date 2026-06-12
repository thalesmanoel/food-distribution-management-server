import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStockMovements1781211600000 implements MigrationInterface {
  name = 'CreateStockMovements1781211600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "stock_quantity" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "CHK_products_stock_quantity_non_negative" CHECK ("stock_quantity" >= 0)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."stock_movements_type_enum" AS ENUM('entry', 'exit', 'adjustment', 'reservation', 'separation', 'cancellation', 'return', 'write_off', 'other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."stock_movements_direction_enum" AS ENUM('in', 'out')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."stock_movements_origin_enum" AS ENUM('order', 'purchase', 'manual_adjustment', 'return', 'cancellation', 'inventory', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "stock_movements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "product_id" uuid NOT NULL, "quantity" integer NOT NULL, "type" "public"."stock_movements_type_enum" NOT NULL, "direction" "public"."stock_movements_direction_enum" NOT NULL, "origin" "public"."stock_movements_origin_enum" NOT NULL, "previous_balance" integer NOT NULL, "resulting_balance" integer NOT NULL, "order_id" uuid, "order_item_id" uuid, "responsible_user_id" uuid, "source_reference_id" character varying(255), "operation_key" character varying(255), "notes" text, "metadata" jsonb, "occurred_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_stock_movements_operation_key" UNIQUE ("operation_key"), CONSTRAINT "CHK_stock_movements_quantity_positive" CHECK ("quantity" > 0), CONSTRAINT "CHK_stock_movements_previous_balance_non_negative" CHECK ("previous_balance" >= 0), CONSTRAINT "CHK_stock_movements_resulting_balance_non_negative" CHECK ("resulting_balance" >= 0), CONSTRAINT "CHK_stock_movements_balance_calculation" CHECK (("direction" = 'in' AND "resulting_balance" = "previous_balance" + "quantity") OR ("direction" = 'out' AND "resulting_balance" = "previous_balance" - "quantity")), CONSTRAINT "PK_stock_movements" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_stock_movements_product_occurred_at" ON "stock_movements" ("product_id", "occurred_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_stock_movements_order_id" ON "stock_movements" ("order_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_stock_movements_responsible_user_id" ON "stock_movements" ("responsible_user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_stock_movements_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_stock_movements_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_stock_movements_order_item" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_stock_movements_responsible_user" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_stock_movements_responsible_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_stock_movements_order_item"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_stock_movements_order"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_stock_movements_product"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_stock_movements_responsible_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_stock_movements_order_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_stock_movements_product_occurred_at"`,
    );
    await queryRunner.query(`DROP TABLE "stock_movements"`);
    await queryRunner.query(`DROP TYPE "public"."stock_movements_origin_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."stock_movements_direction_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."stock_movements_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "CHK_products_stock_quantity_non_negative"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "stock_quantity"`,
    );
  }
}
