import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import RequireAuth from "../components/RequireAuth";
import MainLayout from "../components/Layout/MainLayout";
import HomeLayout from "../pages/HomeModulePage/HomeLayout";
import AccountLayout from "../pages/AccountModule/AccountLayout";
import Account from "../pages/AccountModule/pages/Account";
import MyProfile from "../pages/AccountModule/pages/MyProfile";
import Home from "../pages/HomeModulePage/pages/Home";
import Login from "../pages/Auth/Login";
import SetupLayout from "../pages/SetupModule/SetupLayout";
import UserManagement from "../pages/SetupModule/pages/UserManagement";
import CreateUser from "../pages/SetupModule/pages/CreateUser";
import ProfileSetting from "../pages/SetupModule/pages/ProfileSetting";
import CreateProfile from "../pages/SetupModule/pages/CreateProfile";
import RoleManagement from "../pages/SetupModule/pages/RoleManagement";
import CreateRole from "../pages/SetupModule/pages/CreateRole";
import ObjectManager from "../pages/SetupModule/pages/ObjectManager";
import CreateObject from "../pages/SetupModule/pages/CreateObject";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<RequireAuth />}>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Navigate to="/home" replace />} />

                        <Route path="home" element={<HomeLayout />}>
                            <Route index element={<Home />} />
                        </Route>

                        <Route path="accounts" element={<AccountLayout />}>
                            <Route index element={<Account />} />
                        </Route>

                        <Route path="me/profile" element={<MyProfile />} />

                        <Route path="setup" element={<SetupLayout />}>
                            <Route index element={<UserManagement />} />
                            <Route path="user/create" element={<CreateUser />} />
                            <Route path="profile" element={<ProfileSetting />} />
                            <Route path="profile/create" element={<CreateProfile />} />
                            <Route path="role" element={<RoleManagement />} />
                            <Route path="role/create" element={<CreateRole />} />
                            <Route path="object" element={<ObjectManager />} />
                            <Route path="object/create" element={<CreateObject />} />
                        </Route>
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
