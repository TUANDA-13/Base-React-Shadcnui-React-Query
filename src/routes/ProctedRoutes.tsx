import { PATH } from '@/constants/path';
import { ROLES } from '@/constants';
import { Outlet, Navigate } from 'react-router-dom';
import { LOCALSTORAGE_KEY_ENUM } from '@/enums/fetch.enum';

interface IProtectedRoutes {
    roles: ROLES[];
}

const ProtectedRoutes = ({ roles }: IProtectedRoutes) => {
    const token = localStorage.getItem(LOCALSTORAGE_KEY_ENUM.ACCESS_TOKEN);
    if (!token) {
        return <Navigate to={PATH.LOGIN.path} replace />
    }

    if (roles.length === 0) return <Outlet />;

    const role = localStorage.getItem(LOCALSTORAGE_KEY_ENUM.ROLE) as ROLES;


    /* 
      Check if user has logged in or not. (Authentication)
      If no, they have to do.
      If yes, check their role (Authorization)
      <Outlet/> return the child route's element that match the current page.
    */
    return !roles.includes(role) ? (
        <Navigate to={PATH.LOGIN.path} replace />
    ) : (
        <Outlet />
    );
};

export default ProtectedRoutes;