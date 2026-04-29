import { NavLink, Outlet } from "react-router-dom";

const SetupLayout = () => {
    const baseLink =
        "px-2 py-1 rounded text-[11px] text-gray-700 leading-tight transition";
    const activeLink =
        "bg-blue-100 text-[#0070D2]   font-medium";

    return (
        <div className="flex h-full bg-gray-50">

            {/* Sidebar */}
            <div className="w-52 border-r bg-white">

                {/* Header */}
                <div className="px-2 py-1 text-[10px] font-semibold text-white bg-[#3E6B9A] tracking-wide">
                    SETUP
                </div>

                {/* Menu */}
                <div className="flex flex-col gap-[2px] p-1">

                    <NavLink
                        to="/setup"
                        className={({ isActive }) =>
                            `${baseLink} ${isActive ? activeLink : "hover:bg-gray-100"}`
                        }
                    >
                        User Management
                    </NavLink>

                    <NavLink
                        to="/setup/profile"
                        className={({ isActive }) =>
                            `${baseLink} ${isActive ? activeLink : "hover:bg-gray-100"}`
                        }
                    >
                        Profile Setting
                    </NavLink>

                    <NavLink
                        to="/setup/role"
                        className={({ isActive }) =>
                            `${baseLink} ${isActive ? activeLink : "hover:bg-gray-100"}`
                        }
                    >
                        Role Setting
                    </NavLink>

                    <NavLink
                        to="/setup/object"
                        className={({ isActive }) =>
                            `${baseLink} ${isActive ? activeLink : "hover:bg-gray-100"}`
                        }
                    >
                        Object Manager
                    </NavLink>

                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-2">
                <Outlet />
            </div>
        </div>
    );
};

export default SetupLayout;