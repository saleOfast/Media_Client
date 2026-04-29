import { NavLink, Outlet } from "react-router-dom"

const AccountLayout = () => {
    return (
        <div className="flex">

            {/* sidebar */}
            <div className="w-60 border-r p-4 bg-amber-700">

                <div>Accounts Menu</div>

                <NavLink to="/accounts">All Accounts</NavLink>

                <br />

                <NavLink to="/accounts/create">Create Account</NavLink>

            </div>


            {/* content */}
            <div className="flex-1 p-4">

                <Outlet />

            </div>

        </div>
    )
}

export default AccountLayout
