import { ErrorCodes } from 'src/common/exceptions/error-codes';
import { ServiceException } from 'src/common/exceptions/service-exception';

export default class RaterNotInMatchException extends ServiceException {
  constructor() {
    super(ErrorCodes.RATER_NOT_IN_MATCH);
  }
}
