import { ErrorCodes } from 'src/common/exceptions/error-codes';
import { ServiceException } from 'src/common/exceptions/service-exception';

export default class UserNoMatchesFoundException extends ServiceException {
  constructor() {
    super(ErrorCodes.USER_NO_MATCHES_FOUND);
  }
}
