import { ServiceException } from 'src/common/exceptions/service-exception';
import { ErrorCodes } from '../../common/exceptions/error-codes';

export class JwtExpiredException extends ServiceException {
  constructor() {
    super(ErrorCodes.JWT_EXPIRED);
  }
}
