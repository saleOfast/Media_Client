
import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "../components/Layout/MainLayout"
import Header from "../components/Layout/Header"
import HomeLayout from "../pages/HomeModulePage/HomeLayout"
import AccountLayout from "../pages/AccountModule/AccountLayout"
import Account from "../pages/AccountModule/pages/Account"
import Home from "../pages/HomeModulePage/pages/Home"
import SetupLayout from "../pages/SetupModule/SetupLayout"
import UserManagement from "../pages/SetupModule/pages/UserManagement"
import CreateUser from "../pages/SetupModule/pages/CreateUser"
import ProfileSetting from "../pages/SetupModule/pages/ProfileSetting"
import CreateProfile from "../pages/SetupModule/pages/CreateProfile"
import RoleManagement from "../pages/SetupModule/pages/RoleManagement"
import CreateRole from "../pages/SetupModule/pages/CreateRole"
import ObjectManager from "../pages/SetupModule/pages/ObjectManager"
import CreateObject from "../pages/SetupModule/pages/CreateObject"
const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                {/* Top navbar layout */}
                <Route path="/" element={<MainLayout />}>
                    {/* Home  */}
                    <Route path="home" element={<HomeLayout />}>
                        <Route index element={<Home />} />


                    </Route>
                    <Route path="accounts" element={<AccountLayout />}>
                        <Route index element={<Account />} />


                    </Route>

                    <Route path="setup" element={<SetupLayout />}>
                        <Route index element={<UserManagement />} />
                        <Route path="user/create" element={<CreateUser />} />
                        <Route path="profile" element={<ProfileSetting />} />
                        <Route path="profile/create" element={<CreateProfile />} />
                        <Route path="role" element={<RoleManagement />} />
                        <Route path="role/create" element={<CreateRole />} />
                        <Route path="object" element={<ObjectManager />} />
                        <Route path="object/create" element={<CreateObject />} />
                        {/* <Route path="permissions" element={<SetupPermissions />} /> */}
                    </Route>


                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes