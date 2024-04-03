import { ErrorCodes } from 'src/common/exceptions/error-codes';
import { ServiceException } from 'src/common/exceptions/service-exception';

export default class MatchGenderMismatchException extends ServiceException {
  constructor() {
    super(ErrorCodes.MATCH_GENDER_MISMATCH);
  }
}
