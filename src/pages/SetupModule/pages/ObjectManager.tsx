import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { defaultObjects, loadObjects, saveObjects, type ObjectRow } from "./objectData";

const ObjectManager = () => {
    const navigate = useNavigate();
    const [objects, setObjects] = useState<ObjectRow[]>([]);

    useEffect(() => {
        const objectList = loadObjects();
        setObjects(objectList);
        if (!localStorage.getItem("setup_object_list")) {
            saveObjects(defaultObjects);
        }
    }, []);

    return (
        <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm h-100">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[17px] font-semibold text-black">Object Management</p>
                    <p className="text-[11px] text-black/70">
                        Create and maintain custom object definitions.
                    </p>
                </div>
                <button
                    className="text-[11px] px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition"
                    onClick={() => navigate("/setup/object/create")}
                >
                    <span className="inline-flex items-center gap-1">
                        <PlusCircle size={13} />
                        Create New Object
                    </span>
                </button>
            </div>

            <div className="mt-3 rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-[11px]">
                    <thead className="bg-slate-100/60 text-black/80">
                        <tr>
                            <th className="px-3 py-1.5 text-left font-semibold">Object Label</th>
                            <th className="px-3 py-1.5 text-left font-semibold">Object Name (API)</th>
                            <th className="px-3 py-1.5 text-left font-semibold">Plural Label</th>
                            <th className="px-3 py-1.5 text-left font-semibold">Tab Icon</th>
                            <th className="px-3 py-1.5 text-left font-semibold">Created On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {objects.map((item) => (
                            <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="px-3 py-1.5 text-black">{item.objectLabel}</td>
                                <td className="px-3 py-1.5 text-black/80">{item.objectName}</td>
                                <td className="px-3 py-1.5 text-black/80">{item.pluralLabel}</td>
                                <td className="px-3 py-1.5 text-black/80">{item.tabIcon}</td>
                                <td className="px-3 py-1.5 text-black/70">{item.createdOn}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ObjectManager;
