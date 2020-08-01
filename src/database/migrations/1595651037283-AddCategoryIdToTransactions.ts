import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class AddCategoryIdToTransactions1595651037283 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
          'transactions',
          new TableColumn({
            name: 'category_id',
            type: 'uuid',
            isNullable: true,
          }),
        );
        await queryRunner.addColumn(
            'categories',
            new TableColumn({
              name: 'transation_id',
              type: 'uuid',
              isNullable: true,
            }),
          );
        await queryRunner.createForeignKey(
          'transactions',
          new TableForeignKey({
            name: 'TransactionCategory',
            columnNames: ['category_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'categories',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
          }),
        );
        await queryRunner.createForeignKey(
            'categories',
            new TableForeignKey({
              name: 'TransactionCategory',
              columnNames: ['transation_id'],
              referencedColumnNames: ['id'],
              referencedTableName: 'transactions',
              onDelete: 'SET NULL',
              onUpdate: 'CASCADE',
            }),
          );
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('transactions', 'TransactionsCategory');
        await queryRunner.dropColumn('transactions', 'category_id');
        await queryRunner.dropForeignKey('categories', 'TransactionsCategory');
        await queryRunner.dropColumn('categories','transation_id');
      }

}
