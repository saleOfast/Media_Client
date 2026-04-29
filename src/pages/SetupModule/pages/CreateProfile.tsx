import { X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateProfile = () => {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({
        profileName: '',
        description: ''
    })
    const handleChange = (e: any) => {
        const { name, value } = e.target
        setProfileData(prev => ({
            ...prev, [name]: value
        }))
    }
    const handleSubmit = (e: any) => {
        e.preventDefault()
        console.log("cccc", profileData)
    }


    return (
        <div className="w-full min-h-[calc(100vh-180px)] rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[17px] font-semibold text-black">🛡 Create New Profile</p>
                </div>
                <button
                    className="text-slate-500 hover:text-slate-800"
                    onClick={() => navigate("/setup/profile")}
                    aria-label="Close create profile page"
                >
                    <X size={16} />
                </button>
            </div>

            <form onClick={handleSubmit} className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[12px] font-semibold text-black">Profile Details</p>

                <div className="mt-3 gap-3">
                    <div>
                        <label className="block text-[11px] font-medium text-black mb-1">* Profile Name</label>
                        <input
                            type="text"
                            value={profileData.profileName}
                            name="profileName"
                            onChange={handleChange}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                            placeholder="e.g. Regional Sales Manager"

                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-[11px] font-medium text-black mb-1">Description</label>
                        <textarea
                            value={profileData.description}
                            name="description"
                            onChange={handleChange}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500 min-h-[90px]"
                            placeholder="Describe this profile's purpose..."

                        />
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <button

                        type="submit"
                        className="text-[11px] px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition"
                    >
                        Create Profile
                    </button>
                    <button
                        type="button"
                        className="text-[11px] px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition"
                        onClick={() => navigate("/setup/profile")}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProfile;
