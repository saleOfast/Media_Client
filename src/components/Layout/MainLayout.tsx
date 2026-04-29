import { Outlet, NavLink } from "react-router-dom";

const MainLayout = () => {
    return (

        <div>

            {/* top navigation */}
            <div className="flex gap-6 p-3 border-b text-[11px] ">

                <NavLink to="/home">Home</NavLink>

                <NavLink to="/accounts">Accounts</NavLink>

                <NavLink to="/contacts">Contacts</NavLink>

                <NavLink to="/projects">Projects</NavLink>

                <NavLink to="/inventory">Inventory</NavLink>

                <NavLink to="/setup">Setup</NavLink>



            </div>


            {/* page content */}
            <Outlet />

        </div>

    );
};

export default MainLayout;