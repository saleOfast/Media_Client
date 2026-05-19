import DynamicTable from "../../../components/DynamicTable";
import type { Column } from "../../../Types/Table";

type ApprovalRow = {
    id: number;
    priority: "High" | "Med" | "Low";
    type: string;
    reference: string;
    details: string;
    raisedBy: string;
    date: string;
};

const approvalColumns: Column<ApprovalRow>[] = [
    {
        title: "Priority",
        dataIndex: "priority",
        render: (value) => (
            <span
                className={`px-2 py-[2px] rounded text-[11px] font-medium ${value === "High"
                    ? "bg-red-100 text-red-600"
                    : value === "Med"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
            >
                {String(value)}
            </span>
        ),
    },
    {
        title: "Type",
        dataIndex: "type",
        render: (value) => (
            <span className="bg-purple-100 text-purple-700 px-2 py-[2px] rounded text-[11px]">
                {String(value)}
            </span>
        ),
    },
    { title: "Reference", dataIndex: "reference" },
    { title: "Details", dataIndex: "details" },
    { title: "Raised By", dataIndex: "raisedBy" },
    { title: "Date", dataIndex: "date" },
    {
        title: "Action",
        render: () => (
            <div className="flex gap-2">
                <button className="border border-green-500 text-green-600 px-2 py-[2px] rounded text-[11px] hover:bg-green-50">
                    Approve
                </button>
                <button className="border border-red-500 text-red-600 px-2 py-[2px] rounded text-[11px] hover:bg-red-50">
                    Reject
                </button>
            </div>
        ),
    },
];

const Home = () => {
    const approvals: ApprovalRow[] = [
        {
            id: 1,
            priority: "High",
            type: "Discount",
            reference: "PROJ-0110",
            details: "10% off – Reliance DOOH – ₹2.0L",
            raisedBy: "Rahul Kumar",
            date: "17-Mar",
        },
        {
            id: 2,
            priority: "High",
            type: "KYC",
            reference: "ACC-Ogilvy",
            details: "Ogilvy & Mather Agency – ₹1L credit",
            raisedBy: "Admin",
            date: "16-Mar",
        },
        {
            id: 3,
            priority: "Med",
            type: "New Project",
            reference: "PROJ-0107",
            details: "Samsung Galaxy S25 – 6 sites – ₹8.0L",
            raisedBy: "Sneha Joshi",
            date: "15-Mar",
        },
        {
            id: 4,
            priority: "Med",
            type: "Vendor PO",
            reference: "PO-0234",
            details: "Disha Ads – ₹1.20L purchase order",
            raisedBy: "Dev Patil",
            date: "14-Mar",
        },
        {
            id: 5,
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
                <p className="text-[18px] font-semibold text-[black]">
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

                        <span className=" text-black text-[13px] px-2 rounded-full">
                            {approvals.length}
                        </span>
                    </div>

                    <p className="text-[11px] text-gray-500 italic">
                        Sorted by Priority • Admin only
                    </p>

                </div>

                <div className="px-3 pb-3">
                    <DynamicTable<ApprovalRow>
                        columns={approvalColumns}
                        data={approvals}
                        rowKey="id"
                        emptyText="No pending approvals"
                    />
                </div>
            </div>
        </>
    );
};

export default Home;
