import { ErrorCodes } from 'src/common/exceptions/error-codes';
import { ServiceException } from 'src/common/exceptions/service-exception';

export default class MatchNotFoundException extends ServiceException {
  constructor() {
    super(ErrorCodes.MATCH_NOT_FOUND);
  }
}
