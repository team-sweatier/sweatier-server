import { ErrorCodes } from 'src/common/exceptions/error-codes';
import { ServiceException } from 'src/common/exceptions/service-exception';

export default class UserInvalidCredentialException extends ServiceException {
  constructor() {
    super(ErrorCodes.USER_INVALID_CREDENTIAL);
  }
}
