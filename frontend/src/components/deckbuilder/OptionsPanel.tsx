import { Button } from '../ui/button';

export default function OptionsPanel() {
    const stats = [
        { label: "Avg Energy", value: 3.5 },
        { label: "Avg Power", value: 0.78 },
        { label: "Power Breakdown", value: "33% / 67%" },
        { label: "2-Drop Probability", value: "86%" },
    ]

    return (
        <div className="flex gap-20 items-center">
            <div className="flex gap-5">
                <Button>Save</Button>
                <Button>Clear</Button>
                <Button>Import</Button>
                <Button>Export</Button>
            </div>

            <div className="flex gap-10">
                {stats.map((stat) => (
                    <div key={stat.label} className="flex gap-4">
                        <span className="text-base font-medium text-gray-800">{stat.label}</span>
                        <span className="text-base font-semibold text-gray-900">{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}