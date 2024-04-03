import { ErrorCodes } from 'src/common/exceptions/error-codes';
import { ServiceException } from 'src/common/exceptions/service-exception';

export default class MatchSportTypeNotFoundException extends ServiceException {
  constructor() {
    super(ErrorCodes.SPORT_TYPE_NOT_FOUND);
  }
}
