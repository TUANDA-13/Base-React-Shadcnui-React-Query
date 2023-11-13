import { Routes, Route } from 'react-router-dom';
import ProtectedRoutes from './ProctedRoutes';
import { ROLES } from '@/constants';
// import { PATH } from '@/constants/path';

export const Router = () => {
    <Routes>
        <Route
            element={
                <ProtectedRoutes roles={[ROLES.ADMIN, ROLES.USER]} />
            }
        >
            {/* <Route
                path={PATH.HOME.path}
                element={<Navigate to={PATH.EVENTS.path} replace />}
            />
            <Route path={PATH.EVENTS.path} element={<Events />} />

            <Route
                path={PATH.LEADERBOARD.path}
                element={<Leaderboard />}
            />
            <Route
                path={PATH.PROFILE.path}
                element={<Profile />}
            />
            <Route
                path={PATH.UNAUTHORIZED.path}
                element={<Unauthorized />}
            /> */}
            {/* <Route path={PATH.PRIZES.path} element={<Prizes />} /> */}
        </Route>
    </Routes>
}