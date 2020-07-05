import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, getCustomRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface TransactionCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(path: string): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);
    const readCsvStream = fs.createReadStream(path);

    const parseStream = csvParse({
      from_line: 2,
    });

    const parseCSV = readCsvStream.pipe(parseStream);

    const transactions: TransactionCSV[] = [];
    const categories: string[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const checkCategoriesExists = await categoryRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentCategoriesTitles = checkCategoriesExists.map(
      (category: Category) => category.title,
    );

    const categoriesToAdd = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const addNewCategoriesToRepository = categoryRepository.create(
      categoriesToAdd.map(title => ({ title })),
    );

    await categoryRepository.save(addNewCategoriesToRepository);

    const totalCategories = [
      ...addNewCategoriesToRepository,
      ...checkCategoriesExists,
    ];

    const addNewTransactionsToRepository = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: totalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(addNewTransactionsToRepository);

    await fs.promises.unlink(path);

    return addNewTransactionsToRepository;
  }
}

export default ImportTransactionsService;
