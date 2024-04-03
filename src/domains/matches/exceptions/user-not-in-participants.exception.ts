import { ErrorCodes } from 'src/common/exceptions/error-codes';
import { ServiceException } from 'src/common/exceptions/service-exception';

export default class UserNotInParticipantsException extends ServiceException {
  constructor() {
    super(ErrorCodes.USER_NOT_IN_PARTICIPANTS);
  }
}
