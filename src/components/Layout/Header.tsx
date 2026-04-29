import { useState } from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
    const [search, setSearch] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <header className="w-full bg-white border-b border-gray-200 shadow-sm ">
            <div className="flex items-center justify-between px-3 py-1.5 h-11">

                {/* ── LEFT: Logo + Brand + Search ── */}
                <div className="flex items-center gap-3">

                    {/* Logo badge */}
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-600 text-white text-xs font-bold shrink-0">
                        EO
                    </div>

                    {/* Brand name */}
                    <span className="text-gray-800 font-semibold text-[11px] whitespace-nowrap">
                        Engage Outdoor Media
                    </span>

                    {/* Divider */}
                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    {/* Search bar */}
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Engage Outdoor CRM..."
                            className="border border-gray-300 rounded-l text-[11px] px-3 py-1 w-56 focus:outline-none focus:border-blue-500 h-6"
                        />
                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 h-6 rounded-r font-medium transition-colors">
                            Go!
                        </button>
                    </div>
                </div>

                {/* ── RIGHT: Setup + User dropdown + Avatar ── */}
                <div className="flex items-center gap-4">

                    {/* Setup link */}
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                        <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <NavLink to="/setup"><span className="text-[11px] font-bold">Setup</span></NavLink>
                    </button>

                    {/* Divider */}
                    <div className="w-px h-6 bg-gray-300" />

                    {/* User icon dropdown (left side) */}
                    <div className="relative ">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            <svg
                                className="w-4 h-4 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.8}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            <span className="text-[11px]">Rahul Kumar</span>
                            <svg
                                className={`w-3 h-3 text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg z-50">
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                    My Profile
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                    Settings
                                </button>
                                <div className="border-t border-gray-100" />
                                <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50">
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-6 bg-gray-300" />

                    {/* Avatar + Name + Role (right side) */}
                    <div className="flex items-center gap-2">
                        {/* Avatar circle */}
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-500 text-white text-xs font-bold shrink-0">
                            RK
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-blue-700">Rahul Kumar</span>
                            <span className="text-xs text-gray-500 border border-gray-300 rounded px-1.5 py-0.5">
                                System Admin
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </header>
    );
};

export default Header;