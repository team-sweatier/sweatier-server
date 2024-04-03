import { ErrorCodes } from 'src/common/exceptions/error-codes';
import { ServiceException } from 'src/common/exceptions/service-exception';

export default class UserProfileNotFoundException extends ServiceException {
  constructor() {
    super(ErrorCodes.USER_PROFILE_NOT_FOUND);
  }
}
