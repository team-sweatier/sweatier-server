import { User } from '@prisma/client';

export type AccountType = 'user';

export type AccountEntity = Pick<User, 'id' | 'email'> & {
  accountType: 'user';
};
