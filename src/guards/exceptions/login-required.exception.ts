import { ErrorCodes } from 'src/common/exceptions/error-codes';
import { ServiceException } from 'src/common/exceptions/service-exception';

export class LoginRequiredException extends ServiceException {
  constructor() {
    super(ErrorCodes.LOGIN_REQUIRED);
  }
}
