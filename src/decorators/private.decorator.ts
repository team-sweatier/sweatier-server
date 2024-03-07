import { SetMetadata } from '@nestjs/common';
import { AccountType } from 'src/domains/users/user.type';

export const Private = (accountType: AccountType) =>
  SetMetadata('accountType', accountType);
