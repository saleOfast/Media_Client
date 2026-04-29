const Navbar = () => {
    return (
        <>
            <div className="p-2 pl-4 bg-blue-50">
                <ul className="flex gap-3 text-xs font-medium cursor-pointer">
                    <li>Home</li>
                    <li>Accounts</li>
                    <li>Contacts</li>
                    <li>Projects</li>
                    <li>Inventory</li>
                </ul>
            </div>
            <hr className="mt-1 border border-blue-500 " />
        </>
    )
}
export default Navbar