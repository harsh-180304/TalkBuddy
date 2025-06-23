"use client" // if a pge is 

import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { NewAgentDialog } from "./new-agent-headers"
import { useState } from "react"
export const AgentsListHeader = () => {
    const [isDialogeOpen , setIsDialogOpen] = useState(false);
    return (
        <>
            <NewAgentDialog open = {isDialogeOpen} onOpenChange={setIsDialogOpen}/>
            <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xl">My Agents</h5>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <PlusIcon>
                        New Agent
                        </PlusIcon>
                    </Button>
                </div>
            </div>
        </>
    )
}