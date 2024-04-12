import { ErrorCodes } from 'src/common/exceptions/error-codes';
import { ServiceException } from 'src/common/exceptions/service-exception';

export class UserLatestMatchNotFoundException extends ServiceException {
  constructor() {
    super(ErrorCodes.USER_LATEST_MATCH_NOT_FOUND);
  }
}
