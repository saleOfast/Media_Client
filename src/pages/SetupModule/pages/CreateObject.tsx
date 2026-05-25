import { Clipboard, Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const iconOptions = ["Clipboard", "Building", "Users", "Folder", "Briefcase"];

const toApiName = (label: string) => {
    const cleaned = label
        .trim()
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(" ")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join("");
    return cleaned ? `${cleaned}__c` : "";
};

const CreateObject = () => {
    const navigate = useNavigate();
    const [objectLabel, setObjectLabel] = useState("");
    const [pluralLabel, setPluralLabel] = useState("");
    const [description, setDescription] = useState("");
    const [tabIcon, setTabIcon] = useState("Clipboard");

    const objectName = useMemo(() => toApiName(objectLabel), [objectLabel]);

    return (
        <div className="h-full min-h-0 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[17px] font-semibold text-black">Create</p>
                    <p className="text-[11px] text-black/70 mt-0.5">
                        Define a new custom object. Standard system fields will be added automatically. The object will
                        appear in all Profile Settings permissions.
                    </p>
                </div>
                <button
                    className="text-slate-500 hover:text-slate-800"
                    onClick={() => navigate("/setup/object")}
                    aria-label="Close create object page"
                >
                    <X size={16} />
                </button>
            </div>

            <form className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[12px] font-semibold text-black">📋 Object Definition</p>

                <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[11px] font-medium text-black mb-1">* Object Label</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                            placeholder="e.g. Campaign, Vendor, Lead"
                            value={objectLabel}
                            onChange={(event) => setObjectLabel(event.target.value)}
                        />
                        <p className="mt-1 text-[10px] text-black/60">Display name shown in UI and navigation</p>
                    </div>

                    <div>
                        <label className="block text-[11px] font-medium text-black mb-1">Object Name (API)</label>
                        <div className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] bg-white">
                            {objectName || "Campaign__c"}
                        </div>
                        <p className="mt-1 text-[10px] text-black/60">Auto-generated API name</p>
                    </div>

                    <div>
                        <label className="block text-[11px] font-medium text-black mb-1">Plural Label</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                            placeholder="e.g. Campaigns"
                            value={pluralLabel}
                            onChange={(event) => setPluralLabel(event.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-medium text-black mb-1">Tab Icon</label>
                        <select
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                            value={tabIcon}
                            onChange={(event) => setTabIcon(event.target.value)}
                        >
                            {iconOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option === "Clipboard" ? "📋 Clipboard (default)" : option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-[11px] font-medium text-black mb-1">Description</label>
                        <textarea
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500 min-h-[90px]"
                            placeholder="What is this object used for?"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                        />
                    </div>
                </div>

                <p className="mt-2 text-[10px] text-black/60 inline-flex items-center gap-1">
                    <Clipboard size={11} />
                    Standard audit fields and ownership fields will be added automatically.
                </p>

                <div className="mt-4 flex items-center gap-2">
                    <button
                        type="button"
                        className="text-[11px] px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition"
                    >
                        <span className="inline-flex items-center gap-1">
                            <Save size={13} />
                            Save Object
                        </span>
                    </button>
                    <button
                        type="button"
                        className="text-[11px] px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition"
                        onClick={() => navigate("/setup/object")}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateObject;
