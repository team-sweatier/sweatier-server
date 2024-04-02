import { ErrorCodes } from 'src/common/exceptions/error-codes';
import { ServiceException } from 'src/common/exceptions/service-exception';

export default class MatchAlreadyRatedException extends ServiceException {
  constructor() {
    super(ErrorCodes.MATCH_ALREADY_RATED);
  }
}
