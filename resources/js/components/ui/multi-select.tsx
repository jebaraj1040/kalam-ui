import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Option = {
  label: string
  value: string
}

type CreatedByDropdownProps = {
  values: Option[]
}

export function CreatedByDropdown({ values }: CreatedByDropdownProps) {
  const [selectedValues, setSelectedValues] = React.useState<string[]>([])
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [triggerWidth, setTriggerWidth] = React.useState<number>(0)

  React.useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth)
    }
  }, [selectedValues])

  const toggleSelection = (value: string) => {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  return (
    <DropdownMenuPrimitive.Root modal>
      <p className="font-tree-medium mb-3 block text-sm text-font-secondary">
        Add Preferred Languages
        
      </p>
      
        <DropdownMenuPrimitive.Trigger asChild>
            <button
                ref={triggerRef}
                className="relative flex w-full min-h-[48px] items-center flex-wrap gap-2 rounded-xl bg-white px-4 py-3 pr-[40px] border-1 border-[#e1e1e1] font-tree-semibold focus:!border-orange-500"
                aria-label="Select Language"
            >
                {selectedValues.length === 0 ? (
                <span className="text-gray-400">Choose language</span>
                ) : (
                <div className="flex flex-wrap gap-2">
                    {selectedValues.map((val) => {
                    const item = values.find((o) => o.value === val)
                    return (
                        <div
                        key={val}
                        className="flex items-center bg-gray-200 text-gray-800 px-2 py-1 rounded-md text-xs !z-[999999999]"
                        onClick={(e) => e.stopPropagation()}
                        >
                        {item?.label}
                        <XIcon
                            className="ml-1 w-3 h-3 cursor-pointer"
                            onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            toggleSelection(val)            
                            }}
                        />
                        </div>
                    )
                    })}
                </div>
                )}

                {/* Chevron Icon */}
                <span className="absolute right-[12px] top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDownIcon className="w-[18px] h-[18px] text-gray-500" />
                </span>
            </button>
        </DropdownMenuPrimitive.Trigger>


      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          style={{ width: triggerWidth }}
          className="z-50 mt-2 rounded-xl border bg-[#1c1c1c] text-white p-2 shadow-lg"
          sideOffset={4}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <p className="text-xs text-gray-400 mb-2 px-2">Choose language</p>
          {values.map((option) => {
            const isChecked = selectedValues.includes(option.value)
            return (
              <DropdownMenuPrimitive.CheckboxItem
                key={option.value}
                checked={isChecked}
                onCheckedChange={() => toggleSelection(option.value)}
                className={cn(
                  "relative flex w-full items-center gap-4 px-3 py-2 text-sm cursor-pointer rounded-md",
                  isChecked ? "bg-yellowd-500 text-white" : "hover:bg-gray-800 text-white"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 border rounded-sm flex items-center justify-center",
                    isChecked ? "bg-white text-yellow-500" : "border-white"
                  )}
                >
                  {isChecked && (
                    <CheckIcon
                      className="!w-4 h-4 bg-yellow-500 text-white rounded-sm"
                    />
                  )}
                </div>
                {option.label}
              </DropdownMenuPrimitive.CheckboxItem>
            )
          })}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}





