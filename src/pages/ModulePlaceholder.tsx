type ModulePlaceholderProps = {
    title: string;
};

const ModulePlaceholder = ({ title }: ModulePlaceholderProps) => (
    <div className="h-full min-h-0 overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-[16px] font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-[12px] text-slate-500">Module content coming soon.</p>
    </div>
);

export default ModulePlaceholder;
