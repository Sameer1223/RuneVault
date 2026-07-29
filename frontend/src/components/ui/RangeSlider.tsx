"use client"

import * as React from "react"
import { Slider } from "@/components/ui/slider"

interface RangeSliderProps {
  label: string
  min?: number
  max?: number
  step?: number
  defaultValue?: [number, number]
  onChange?: (value: [number, number]) => void
}

export default function RangeSlider({
  label,
  min = 0,
  max = 12,
  step = 1,
  defaultValue = [min, max],
  onChange,
}: RangeSliderProps) {
  const [range, setRange] = React.useState<[number, number]>(defaultValue)

  const handleValueChange = (val: number[]) => {
    const newRange: [number, number] = [val[0], val[1]]
    setRange(newRange)
    onChange?.(newRange)
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Label */}
      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</label>

      {/* Slider */}
      <Slider
        value={range}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={step}
        className="w-full [&_[role=slider]]:bg-[#1a1a1a] [&_[role=slider]]:border-[#caa368] [&_[role=slider]]:ring-[#caa368]/30 [&_[data-orientation=horizontal]]:bg-zinc-700 [&_[data-orientation=horizontal]>.bg-primary]:bg-[#caa368]"
      />

      {/* Scale Display */}
      <div className="flex justify-between text-xs text-zinc-400 mt-1">
        <span>{range[0]}</span>
        <span>{range[1]}</span>
      </div>
    </div>
  )
}
