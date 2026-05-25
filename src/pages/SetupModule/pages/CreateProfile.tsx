import { X } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createProfile } from "../../../api/profiles";
import { useToast } from "../../../components/ToastProvider";

const CreateProfile = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [profileData, setProfileData] = useState({
        profileName: "",
        description: "",
        department: "",
        canSetup: false,
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = event.target;
        const checked = type === "checkbox" ? (event.target as HTMLInputElement).checked : undefined;
        setProfileData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? Boolean(checked) : value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitError(null);

        if (!profileData.profileName.trim() || !profileData.department.trim()) {
            setSubmitError("Profile name and department are required.");
            return;
        }

        setSubmitting(true);
        try {
            await createProfile({
                name: profileData.profileName.trim(),
                description: profileData.description.trim(),
                canSetup: profileData.canSetup,
                department: profileData.department.trim(),
            });
            showToast("Profile created successfully");
            navigate("/setup/profile");
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "Failed to create profile");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="h-full min-h-0 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[17px] font-semibold text-black">Create New Profile</p>
                </div>
                <button
                    type="button"
                    className="text-slate-500 hover:text-slate-800"
                    onClick={() => navigate("/setup/profile")}
                    aria-label="Close create profile page"
                >
                    <X size={16} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[12px] font-semibold text-black">Profile Details</p>

                <div className="mt-3 gap-3 space-y-3">
                    <div>
                        <label className="block text-[11px] font-medium text-black mb-1">Profile Name *</label>
                        <input
                            type="text"
                            value={profileData.profileName}
                            name="profileName"
                            onChange={handleChange}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                            placeholder="e.g. CEO"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-medium text-black mb-1">Department *</label>
                        <input
                            type="text"
                            value={profileData.department}
                            name="department"
                            onChange={handleChange}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                            placeholder="e.g. Sales"
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
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={profileData.canSetup}
                            name="canSetup"
                            onChange={handleChange}
                            id="canSetup"
                            className="rounded border border-slate-300"
                        />
                        <label htmlFor="canSetup" className="text-[11px] font-medium text-black">
                            Can Setup
                        </label>
                    </div>
                </div>

                {submitError ? <p className="mt-2 text-[11px] text-red-600">{submitError}</p> : null}

                <div className="mt-4 flex items-center gap-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="text-[11px] px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition disabled:opacity-60"
                    >
                        {submitting ? "Creating…" : "Create Profile"}
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
