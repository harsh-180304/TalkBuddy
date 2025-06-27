import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useRouter } from "next/navigation";
import { MeetingForm } from "./meeting-form";
interface NewMeetingDialogProps {
    open : boolean;
    onOpenChange : (open : boolean) => void;
};

export const NewMeetingDialog = ({
    open,
    onOpenChange,
}:NewMeetingDialogProps) => {
    const router = useRouter();

    return (
        <ResponsiveDialog
            title="New Agent"
            description="Create a new Meeting"
            open = {open}
            onOpenChange={onOpenChange}
        >
            <MeetingForm
                onSuccess={(id)=>{
                    onOpenChange(false);
                    router.push(`/meetings/${id}`);
                }}
                onCancel={()=>onOpenChange(false)}
            />
            {/* as agent name is the seed new avatar will generate for each new agent name */}
        </ResponsiveDialog>
    )
}
