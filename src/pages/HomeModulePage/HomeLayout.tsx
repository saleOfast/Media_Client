import { NavLink, Outlet } from "react-router-dom"

const HomeLayout = () => {
    return (
        <div className="flex h-full min-h-0 flex-1">

            {/* sidebar */}
            <aside className="flex h-full w-52 shrink-0 flex-col border-r">

                <div
                    className="shrink-0 pl-3 h-5 text-[11px] text-white"
                    style={{ backgroundColor: "#3E6B9A" }}
                >
                    HOME
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-1 pl-4 text-[11px] bg-blue-100 text-black">
                    <NavLink to="/accounts/create">Dashboard</NavLink>
                    <NavLink to="/accounts/create">My Approvals</NavLink>
                    <NavLink to="/accounts/create">Dashboard</NavLink>
                    <NavLink to="/accounts/create">My Approvals</NavLink>
                </div>
            </aside>

            {/* content */}
            <div className="min-h-0 flex-1 overflow-y-auto p-1 pl-2">
                <Outlet />
            </div>
        </div>

    )
}

export default HomeLayout
