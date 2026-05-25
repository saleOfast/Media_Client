import { NavLink, Outlet } from "react-router-dom"

const AccountLayout = () => {
    return (
        <div className="flex h-full min-h-0 flex-1">

            {/* sidebar */}
            <aside className="flex h-full w-60 shrink-0 flex-col border-r bg-amber-700 p-4">

                <div className="shrink-0">Accounts Menu</div>

                <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                    <NavLink to="/accounts">All Accounts</NavLink>
                    <NavLink to="/accounts/create">Create Account</NavLink>
                </div>
            </aside>

            {/* content */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <Outlet />
            </div>
        </div>
    )
}

export default AccountLayout
