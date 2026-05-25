import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearCredentials } from "../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectAuthUser, selectCanAccessSetup } from "../../store/permissionSelectors";

function initialsFromDisplayName(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) {
        return "?";
    }
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
        const single = parts[0];
        if (single.includes("@")) {
            return single.slice(0, 2).toUpperCase();
        }
        return single.slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const Header = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const storedUser = useAppSelector(selectAuthUser);
    const canSetup = useAppSelector(selectCanAccessSetup);
    const displayName = storedUser?.displayName ?? "User";
    const roleBadge = storedUser?.role?.trim() ?? "";
    const avatarInitials = initialsFromDisplayName(displayName);

    useEffect(() => {
        if (!dropdownOpen) {
            return;
        }

        const closeIfOutside = (event: MouseEvent) => {
            const node = userMenuRef.current;
            if (node && !node.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        const onEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setDropdownOpen(false);
            }
        };

        const timerId = window.setTimeout(() => {
            document.addEventListener("mousedown", closeIfOutside);
            document.addEventListener("keydown", onEscape);
        }, 0);

        return () => {
            window.clearTimeout(timerId);
            document.removeEventListener("mousedown", closeIfOutside);
            document.removeEventListener("keydown", onEscape);
        };
    }, [dropdownOpen]);

    const handleLogout = () => {
        dispatch(clearCredentials());
        setDropdownOpen(false);
        navigate("/login", { replace: true });
    };

    const goMyProfile = () => {
        setDropdownOpen(false);
        navigate("/me/profile");
    };

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
                        <button
                            type="button"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 h-6 rounded-r font-medium transition-colors"
                        >
                            Go!
                        </button>
                    </div>
                </div>

                {/* ── RIGHT: Setup + User ── */}
                <div className="flex items-center gap-3">
                    {canSetup ? (
                        <>
                            <NavLink
                                to="/setup"
                                className={({ isActive }) =>
                                    `flex items-center gap-1 text-[11px] font-medium transition-colors ${
                                        isActive
                                            ? "text-blue-600"
                                            : "text-gray-600 hover:text-blue-600"
                                    }`
                                }
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                Setup
                            </NavLink>
                            <div className="h-6 w-px bg-gray-300" />
                        </>
                    ) : null}

                    <div ref={userMenuRef} className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setDropdownOpen((open) => !open)}
                                aria-expanded={dropdownOpen}
                                aria-haspopup="menu"
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
                                <span className="text-[11px] max-w-[140px] truncate">{displayName}</span>
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

                            {dropdownOpen ? (
                                <div
                                    className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg z-50 py-1"
                                    role="menu"
                                >
                                    <button
                                        type="button"
                                        role="menuitem"
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        onClick={goMyProfile}
                                    >
                                        My Profile
                                    </button>
                                    <div className="border-t border-gray-100 my-1" />
                                    <button
                                        type="button"
                                        role="menuitem"
                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        <div className="w-px h-6 bg-gray-300" />

                        <button
                            type="button"
                            onClick={() => setDropdownOpen((open) => !open)}
                            aria-expanded={dropdownOpen}
                            aria-haspopup="menu"
                            className="flex items-center gap-2 rounded-md px-1 py-0.5 text-left hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                {avatarInitials}
                            </div>
                            <div className="flex flex-col items-start gap-0.5 min-w-0">
                                <span className="max-w-[120px] truncate text-[11px] font-semibold text-blue-700">{displayName}</span>
                                {roleBadge ? (
                                    <span className="max-w-[100px] truncate text-[10px] text-gray-500 border border-gray-300 rounded px-1.5 py-0.5">
                                        {roleBadge}
                                    </span>
                                ) : null}
                            </div>
                        </button>
                    </div>

                </div>
            </div>
        </header>
    );
};

export default Header;
