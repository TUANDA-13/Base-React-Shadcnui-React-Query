// null: dont need login
// []: need login
// admin: need login and admin role
// user: need login and user role

export const PATH = {
    LOGIN: { path: "/login" },
    HOME: { path: "/home", roles: [] },
    REGISTER: { path: "/register" },
    NOT_FOUND: { path: "*" },
}