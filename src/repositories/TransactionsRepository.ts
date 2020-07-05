import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transations = await this.find();

    const { income, outcome } = transations.reduce(
      (accummulator: Balance, transation: Transaction) => {
        if (transation.type === 'income') {
          accummulator.income += Number(transation.value);
        } else if (transation.type === 'outcome') {
          accummulator.outcome += Number(transation.value);
        }
        return accummulator;
      },
      { income: 0, outcome: 0, total: 0 },
    );

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }
}

export default TransactionsRepository;
