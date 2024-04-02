import { ErrorCodes } from 'src/common/exceptions/error-codes';
import { ServiceException } from 'src/common/exceptions/service-exception';

export default class UserDuplicateNicknameException extends ServiceException {
  constructor() {
    super(ErrorCodes.USER_DUPLICATE_NICKNAME);
  }
}
