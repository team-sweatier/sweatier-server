import { ErrorCodes } from 'src/common/exceptions/error-codes';
import { ServiceException } from 'src/common/exceptions/service-exception';

export default class MatchParticipationReachedLimitException extends ServiceException {
  constructor() {
    super(ErrorCodes.MATCH_PARTICIPATION_REACHED_LIMIT);
  }
}
