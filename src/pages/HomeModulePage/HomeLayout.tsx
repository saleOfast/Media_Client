import { NavLink, Outlet } from "react-router-dom"

const HomeLayout = () => {
    return (
        <div className="flex">

            {/* sidebar */}
            <div className="w-50 border-r p-0">

                <div className=" pl-3 h-5 text-[11px] text-white" style={{ backgroundColor: "#3E6B9A" }}>HOME </div>

                <div className="flex flex-col p-1 pl-4 text-[11px] bg-blue-100 text-black">
                    <NavLink to="/accounts/create" >Dashboard</NavLink>
                    <NavLink to="/accounts/create">My Approvals</NavLink>
                    <NavLink to="/accounts/create">Dashboard</NavLink>
                    <NavLink to="/accounts/create">My Approvals</NavLink>
                </div>


            </div>


            {/* content */}
            <div className="flex-1 p-1 pl-2">

                <Outlet />

            </div>

        </div>

    )
}

export default HomeLayout
