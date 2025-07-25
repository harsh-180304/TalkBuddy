
import { useQueryClient , useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { useForm } from "react-hook-form";

import { z } from "zod";
import { Input } from "@/components/ui/input";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,  
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { MeetingGetOne } from "../../types";
import { meetingsInsertSchema } from "../../schemas";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { CommandSelect } from "@/components/command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Divide } from "lucide-react";
import { botttsNeutral } from "@dicebear/collection";
import { NewAgentDialog } from "@/modules/agents/ui/components/new-agent-dialog";
interface MeetingformProps {
    onSuccess?: (id?:string)=>void;
    onCancel?: ()=> void;
    initialValues?: MeetingGetOne;

};

export const MeetingForm = ({    
    onSuccess,
    onCancel,
    initialValues,
}: MeetingformProps)=>{
    const trpc = useTRPC();

    const queryClient = useQueryClient();

    const [openNewAgentDialog , setopenNewAgentDialog] = useState(false);
    const [agentSearch , setAgentSearch] = useState("");
    const agents = useQuery(
        trpc.agents.getMany.queryOptions({
            pageSize : 100,
            search : agentSearch,
        }),
    );
  
    const createMeeting = useMutation(
        trpc.meetings.create.mutationOptions({
            onSuccess:async (data)=>{
                await queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({}),
                );
    
                onSuccess?.(data.id);
            },
            onError: (error) => {
                toast.error(error.message)
                //todo check if error code is forebidden redired to upgrade .
            }
        })
    );

    const UpdateMeeting = useMutation(
        trpc.meetings.update.mutationOptions({
            onSuccess:async ()=>{
                await queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({}),
                );
                
                //todo invalidate free tier usage
                onSuccess?.();
            },
            onError: (error) => {
                toast.error(error.message)
                //todo check if error code is forebidden redired to upgrade .
            }
        })
    );

    const form = useForm<z.infer<typeof meetingsInsertSchema>>({
        resolver : zodResolver(meetingsInsertSchema),
        defaultValues:{
            name:initialValues?.name ?? "",
            agentId:initialValues?.agentId?? "",//this will populate to fall back to empty string
        }
    })
    const isEdit = !!initialValues?.id;
    const isPending = createMeeting.isPending || UpdateMeeting.isPending;

    const onSubmit = (values : z.infer<typeof meetingsInsertSchema>) => {
        if(isEdit){
            UpdateMeeting.mutate({...values , id:initialValues.id}); 
        }else {
            createMeeting.mutate(values);
        }
    };
    return (
      <>
        <NewAgentDialog open = {openNewAgentDialog} onOpenChange={setopenNewAgentDialog}/>
        <Form{...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    name = "name"
                    control={form.control}
                    render = {({field})=>(
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g. Math consultation"/>
                            </FormControl>
                        </FormItem>
                    )}
                />

                 <FormField
                    name = "agentId"
                    control={form.control}
                    render = {({field})=>(
                        <FormItem>
                            <FormLabel>Agent</FormLabel>
                            <FormControl>
                                <CommandSelect
                                    options={(agents.data?.items ?? []).map((agent) => ({
                                        id : agent.id,
                                        value : agent.id,
                                        children : (
                                            <div className="flex items-center gap-x-2">
                                                <GeneratedAvatar
                                                    seed = {agent.name}
                                                    variant = "botttsNeutral"
                                                    className = "border size-6"
                                                />
                                                <span>{agent.name}</span>
                                            </div>
                                        )
                                    }))}
                                    onSelect={field.onChange}
                                    onSearch={setAgentSearch}
                                    value = {field.value}
                                    placeholder="Select an agent"
                                />
                            </FormControl>
                            <FormDescription>
                                Not found what you're looking for?{" "}
                                <button
                                    type = "button"
                                    className="text-primary hover:underline"
                                    onClick={()=>setopenNewAgentDialog(true)}
                                >
                                    Create new agent   
                                </button>
                            </FormDescription>
                        </FormItem>
                    )}
                />

                <div className="flex justify-between gap-x-2">
                    {onCancel && (
                        <Button
                        variant = "ghost"
                        disabled = {isPending}
                        type = "button"
                        onClick={()=>onCancel()}
                        >
                        Cancel
                        </Button>
                    )}
                    <Button
                        disabled = {isPending}
                        type = "submit"
                    >
                        {isEdit ? "Update" : "Create"}

                    </Button>
                </div>
            </form>
        </Form>
    </>
        
    )
}
