import { ErrorCodes } from 'src/common/exceptions/error-codes';
import { ServiceException } from 'src/common/exceptions/service-exception';

export default class UserDuplicatePhoneNumberException extends ServiceException {
  constructor() {
    super(ErrorCodes.USER_DUPLICATE_PHONE_NUMBER);
  }
}
