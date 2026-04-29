const Home = () => {
    const approvals = [
        {
            priority: "High",
            type: "Discount",
            reference: "PROJ-0110",
            details: "10% off – Reliance DOOH – ₹2.0L",
            raisedBy: "Rahul Kumar",
            date: "17-Mar",
        },
        {
            priority: "High",
            type: "KYC",
            reference: "ACC-Ogilvy",
            details: "Ogilvy & Mather Agency – ₹1L credit",
            raisedBy: "Admin",
            date: "16-Mar",
        },
        {
            priority: "Med",
            type: "New Project",
            reference: "PROJ-0107",
            details: "Samsung Galaxy S25 – 6 sites – ₹8.0L",
            raisedBy: "Sneha Joshi",
            date: "15-Mar",
        },
        {
            priority: "Med",
            type: "Vendor PO",
            reference: "PO-0234",
            details: "Disha Ads – ₹1.20L purchase order",
            raisedBy: "Dev Patil",
            date: "14-Mar",
        },
        {
            priority: "Low",
            type: "Extension",
            reference: "PROJ-0108",
            details: "Tanishq campaign extension +30 days",
            raisedBy: "Ravi Kumar",
            date: "14-Mar",
        },
    ];

    return (
        <>
            {/* Header */}
            <div>
                <p className="text-[18px] font-semibold text-[#0070D2]">
                    Home — Administrator
                </p>

                <p className="text-[12px] text-gray-600">
                    Welcome back, Rahul Kumar · Administrator · Management
                </p>

                <hr className="mt-1 border-gray-300 border-t-[1px]" />
            </div>

            {/* Pending approvals */}
            <div className="mt-4  rounded-md">
                <div className="flex justify-between items-center px-3 py-2 bg-gray-50 ">

                    <div className="flex items-center gap-2">
                        <span className="text-green-600">✔</span>

                        <p className="font-semibold text-[14px]">
                            Pending Approvals
                        </p>

                        <span className="bg-blue-500 text-white text-[11px] px-2 rounded-full">
                            {approvals.length}
                        </span>
                    </div>

                    <p className="text-[11px] text-gray-500 italic">
                        Sorted by Priority • Admin only
                    </p>

                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-[12px]">

                        <thead className="bg-gray-100 text-gray-700">
                            <tr className="text-left">
                                <th className="p-2 border">Priority</th>
                                <th className="p-2 border">Type</th>
                                <th className="p-2 border">Reference</th>
                                <th className="p-2 border">Details</th>
                                <th className="p-2 border">Raised By</th>
                                <th className="p-2 border">Date</th>
                                <th className="p-2 border">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {approvals.map((item, i) => (

                                <tr key={i} className="border-t hover:bg-gray-50 text-[11px] leading-tight">

                                    {/* Priority */}
                                    <td className="px-2 py-[2px] border leading-tight">
                                        <span
                                            className={`px-2 py-[2px] rounded text-[11px] font-medium
                                                   ${item.priority === "High"
                                                    ? "bg-red-100 text-red-600"
                                                    : item.priority === "Med"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }
                      `}
                                        >
                                            {item.priority}
                                        </span>
                                    </td>

                                    {/* Type */}
                                    <td className="p-2 border">
                                        <span className="bg-purple-100 text-purple-700 px-2 py-[2px] rounded text-[11px]">
                                            {item.type}
                                        </span>
                                    </td>

                                    <td className="p-2 border">{item.reference}</td>

                                    <td className="p-2 border">{item.details}</td>

                                    <td className="p-2 border">{item.raisedBy}</td>

                                    <td className="p-2 border">{item.date}</td>

                                    <td className="p-2 border">

                                        <div className="flex gap-2">

                                            <button className="border border-green-500 text-green-600 px-2 py-[2px] rounded text-[11px] hover:bg-green-50">
                                                Approve
                                            </button>

                                            <button className="border border-red-500 text-red-600 px-2 py-[2px] rounded text-[11px] hover:bg-red-50">
                                                Reject
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}
                        </tbody>

                    </table>
                </div>
            </div>
        </>
    );
};

export default Home;
