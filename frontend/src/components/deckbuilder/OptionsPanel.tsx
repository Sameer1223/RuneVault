import { Button } from '../ui/button';

interface OptionsPanelProps {
    onSave: () => void;
    onClear?: () => void;
}
    
export default function OptionsPanel({ onSave, onClear }: OptionsPanelProps) {
    const stats = [
        { label: "Avg Energy", value: 3.5 },
        { label: "Avg Power", value: 0.78 },
        { label: "Power Breakdown", value: "33% / 67%" },
        { label: "2-Drop Probability", value: "86%" },
    ]

    return (
        <div className="flex gap-20 items-center">
            <div className="flex gap-5">
                <Button onClick={onSave}>Save</Button>
                <Button onClick={onClear}>Clear</Button>
                <Button>Import</Button>
                <Button>Export</Button>
            </div>

            <div className="flex gap-10">
                {stats.map((stat) => (
                    <div key={stat.label} className="flex gap-4">
                        <span className="text-base font-medium text-[#caa368]">{stat.label}</span>
                        <span className="text-base font-semibold text-white">{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}