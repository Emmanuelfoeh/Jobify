
import { unauthenticated } from '../errors/index.js';

const checkPermission =(requestUser,resourceUserId) => {
    if (requestUser.userId === resourceUserId.toString()) return;

    throw new unauthenticated('Not Authorized to access this route');
}

export default checkPermission
