"use client"
import { ErrorState } from "@/components/error-state";
import {useState} from "react"
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { dataTagErrorSymbol, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { AgentIdViewHeader } from "../components/agent-id-view-header";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { UpdateAgentDialog } from "../components/update-agent-dialog";
interface Props{ 
    AgentId : string;
};

export const AgentIdView = ({AgentId}:Props)=>{
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [UpdateAgentDialogOpen , setUpdateAgentDialogOpen] = useState(false);

    const {data}  = useSuspenseQuery(trpc.agents.getOne.queryOptions({id:AgentId}));
     
    const removeAgent = useMutation(
        trpc.agents.remove.mutationOptions({
            onSuccess: async ()=>{
                await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
                //todo invalidate free tier usage
                router.push("/Agents");
            },
            onError : (error) => {
                toast .error(error.message);
            }
        })
    );

    const [RemoveConfirmation , confirmRemove] = useConfirm(
        "Are you sure?",
        `The following action will remove ${data.meetingCount} associated meetings`,
    )

    const handleRemoveAgent = async () => {
        const ok = await confirmRemove();
        if(!ok) return;
        await removeAgent.mutateAsync({id:AgentId})
    }

    return (
        <>
            <RemoveConfirmation/>
            <UpdateAgentDialog
                open = {UpdateAgentDialogOpen}
                onOpenChange={setUpdateAgentDialogOpen}
                initialValues={data}
            />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4 ">
                <AgentIdViewHeader
                AgentId = {AgentId}
                agentName = {data.name}
                onEdit = {()=>setUpdateAgentDialogOpen(true)}
                onRemove = {handleRemoveAgent} 
                />
            <div className="bg-white rounded-lg border">
                <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
                    <div className="flex items-center gap-x-5">
                        <GeneratedAvatar
                            variant="botttsNeutral"
                            seed = {data.name}
                            className="size-10"
                        />
                        <h2 className="text-2xl font-medium">{data.name}</h2>
                    </div>
                    <Badge
                        variant="outline"
                        className= "flex items-center gap-x-2 [&>svg]:size-4"    
                    >
                        <VideoIcon className="text-green-500"/>
                        {data.meetingCount} {data.meetingCount === 1 ? "meeting" : "meetings"}
                    </Badge>
                    <div className="flex flex-col gap-y-4">
                        <p className="text-lg font-medium">Instructions</p>
                        <p className="text-neutral-800">{data.instruction}</p>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}
export const AgentIdViewLoading = () => {
    return (
        <LoadingState
        title = "Loading Agents"
        description="This may take a few seconds"
    />        
    )
}

export const AgentIdViewError = () => {
    return (
        <ErrorState
        title = "Error Loading Agents"
        description="Something went wrong"
    />        
    )
}