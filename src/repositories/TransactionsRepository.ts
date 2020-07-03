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

    const income = transations
      .filter(item => {
        return item.type === 'income';
      })
      .map(item => {
        return item.value;
      })
      .reduce((prev, cur) => {
        return prev + cur;
      }, 0);

    const outcome = transations
      .filter(item => {
        return item.type === 'outcome';
      })
      .map(item => {
        return item.value;
      })
      .reduce((prev, cur) => {
        return prev + cur;
      }, 0);

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }
}

export default TransactionsRepository;
