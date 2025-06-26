"use client" // if a pge is 

import { Button } from "@/components/ui/button"
import { PlusIcon} from "lucide-react"
import { NewMeetingDialog } from "./new-meeting-dialog"
import { useState } from "react"

export const MeetingsListHeader = () => {
    const [isDialogOpen , setIsDialogeOpen] = useState(false);

    return (
        <>
            <NewMeetingDialog open = {isDialogOpen} onOpenChange={setIsDialogeOpen}/>
            <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xl">My Meetings</h5>
                    <Button onClick={() => setIsDialogeOpen(true)}>
                        <PlusIcon />
                        New Meeting 
                    </Button>
                </div>
                <div className="flex items-center gap-x-2 p-1">
                   {/* todo filters */}
                </div>
            </div>
        </>
    )
}