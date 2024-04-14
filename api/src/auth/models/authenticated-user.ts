import { UserTo } from '../../user/models/userTo';

export interface AuthenticatedUser extends UserTo {
  accessToken: string;
}
