import { BrowserRouter, Route, Routes } from "react-router-dom";
import CatchAllRedirect from "../components/CatchAllRedirect";
import RequireAuth from "../components/RequireAuth";
import RequireNavAccess from "../components/RequireNavAccess";
import RequireSetup from "../components/RequireSetup";
import DefaultHomeRedirect from "../components/DefaultHomeRedirect";
import MainLayout from "../components/Layout/MainLayout";
import ModulePlaceholder from "../pages/ModulePlaceholder";
import HomeLayout from "../pages/HomeModulePage/HomeLayout";
import AccountLayout from "../pages/AccountModule/AccountLayout";
import Account from "../pages/AccountModule/pages/Account";
import MyProfile from "../pages/AccountModule/pages/MyProfile";
import Home from "../pages/HomeModulePage/pages/Home";
import Login from "../pages/Auth/Login";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import SetupLayout from "../pages/SetupModule/SetupLayout";
import UserManagement from "../pages/SetupModule/pages/UserManagement";
import CreateUser from "../pages/SetupModule/pages/CreateUser";
import ViewUser from "../pages/SetupModule/pages/ViewUser";
import EditUser from "../pages/SetupModule/pages/EditUser";
import ProfileSetting from "../pages/SetupModule/pages/ProfileSetting";
import CreateProfile from "../pages/SetupModule/pages/CreateProfile";
import ViewProfile from "../pages/SetupModule/pages/ViewProfile";
import RoleManagement from "../pages/SetupModule/pages/RoleManagement";
import CreateRole from "../pages/SetupModule/pages/CreateRole";
import ObjectManager from "../pages/SetupModule/pages/ObjectManager";
import CreateObject from "../pages/SetupModule/pages/CreateObject";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route element={<RequireAuth />}>
                    <Route element={<RequireNavAccess />}>
                        <Route path="/" element={<MainLayout />}>
                            <Route index element={<DefaultHomeRedirect />} />

                            <Route path="home" element={<HomeLayout />}>
                                <Route index element={<Home />} />
                            </Route>

                            <Route path="accounts" element={<AccountLayout />}>
                                <Route index element={<Account />} />
                            </Route>

                            <Route path="contacts" element={<ModulePlaceholder title="Contacts" />} />
                            <Route path="projects" element={<ModulePlaceholder title="Projects" />} />
                            <Route path="inventory" element={<ModulePlaceholder title="Inventory" />} />
                            <Route path="product" element={<ModulePlaceholder title="Product" />} />

                            <Route path="me/profile" element={<MyProfile />} />

                            <Route path="setup" element={<RequireSetup />}>
                                <Route element={<SetupLayout />}>
                                    <Route index element={<UserManagement />} />
                                    <Route path="user/create" element={<CreateUser />} />
                                    <Route path="user/:userId" element={<ViewUser />} />
                                    <Route path="user/:userId/edit" element={<EditUser />} />
                                    <Route path="profile" element={<ProfileSetting />} />
                                    <Route path="profile/create" element={<CreateProfile />} />
                                    <Route path="profile/:profileId" element={<ViewProfile />} />
                                    <Route path="role" element={<RoleManagement />} />
                                    <Route path="role/create" element={<CreateRole />} />
                                    <Route path="object" element={<ObjectManager />} />
                                    <Route path="object/create" element={<CreateObject />} />
                                </Route>
                            </Route>
                        </Route>
                    </Route>
                </Route>

                <Route path="*" element={<CatchAllRedirect />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
