import { ResponsiveDialog } from "@/components/responsive-dialog";

import { MeetingForm } from "./meeting-form";
import { MeetingGetOne } from "../../types";
import { init } from "next/dist/compiled/webpack/webpack";
interface UpdateMeetingDialogProps {
    open : boolean;
    onOpenChange : (open : boolean) => void;
    initialValues : MeetingGetOne
};

export const UpdateMeetingDialog = ({
    open,
    onOpenChange,
    initialValues,

}:UpdateMeetingDialogProps) => {


    return (
        <ResponsiveDialog
            title="Edit Agent"
            description="Edit the Meeting details"
            open = {open}
            onOpenChange={onOpenChange}
        >
            <MeetingForm
                onSuccess={()=>{
                    onOpenChange(false); 
                }}
                onCancel={()=>onOpenChange(false)}
                initialValues={initialValues}
            />
            {/* as agent name is the seed new avatar will generate for each new agent name */}
        </ResponsiveDialog>
    )
}
