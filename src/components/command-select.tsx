import {ReactNode , useState} from "react"
import { ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import {
    CommandEmpty,
    CommandInput,
    CommandList,
    CommandItem,
    CommandResponsiveDialog,
}from "@/components/ui/command"

interface Props {
    options : Array<{
        id : string;
        value : string;
        children : React.ReactNode;
    }>;
    onSelect: (value : string )=>void;
    onSearch?: (value : string)=>void;
    value:string;
    placeholder?:string;
    isSearchable?:boolean;
    className?:string;
} 

export const CommandSelect = ({
    options,
    onSelect,
    onSearch,
    value,
    placeholder = "Select an option",
    className,
}:Props)=>{
    const [open , setOpen] = useState(false);
    const selectedOption = options.find((options)=>options.value === value);
    
    const handleOpenChange = (open: boolean) => {
        onSearch?.("")
        setOpen(open);
    }

    return(
        <>
            <Button
                onClick={()=>setOpen(true)}
                type="button"
                variant = "outline"
                className={cn(
                    "h-9 justify-center font-normal px-2",
                    !selectedOption && "text-muted-foreground",
                    className,
                )}
            >
                <div>
                    {selectedOption?.children ?? placeholder}
                </div>
            <ChevronsUpDown/>
            </Button>
            <CommandResponsiveDialog
                shouldFilter = {!onSearch}
                open = {open}
                onOpenChange={handleOpenChange}
            >
            <CommandInput placeholder="Search..." onValueChange={onSearch}/>
            <CommandList>
                <CommandEmpty className="text-muted-foreground text-sm">
                    <span>
                        No options found
                    </span>
                </CommandEmpty>
                {options.map((option)=>(
                    <CommandItem
                        key = {option.id}
                        onSelect={()=>{
                            onSelect(option.value)
                            setOpen(false);
                        }}
                    >
                        {option.children}
                    </CommandItem>
                ))}
            </CommandList>
            </CommandResponsiveDialog>
        
        </>
    )
}