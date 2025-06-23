import { useQueryClient , useMutation } from "@tanstack/react-query";
import { AgentGetOne } from "../../types";
import { useTRPC } from "@/trpc/client";

import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { agentsInsertSchema } from "../../schemas";
import { z } from "zod";
import { Input } from "@/components/ui/input";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,  
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
interface AgentformProps {
    onSuccess?: ()=>void;
    onCancel?: ()=> void;
    initialValues?: AgentGetOne;

};

export const AgentForm = ({    
    onSuccess,
    onCancel,
    initialValues,
}: AgentformProps)=>{
    const trpc = useTRPC();

    const queryClient = useQueryClient();

    const createAgent = useMutation(
        trpc.agents.create.mutationOptions({
            onSuccess:async ()=>{
                await queryClient.invalidateQueries(
                    trpc.agents.getMany.queryOptions(),
                );
                if (initialValues?.id) {
                    await queryClient.invalidateQueries(
                        trpc.agents.getOne.queryOptions({ id: initialValues.id })
                    );
                }
    
                onSuccess?.();
            },
            onError: (error) => {
                toast.error(error.message)
                //todo check if error code is forebidden redired to upgrade .
            }
        })
    );
    const form = useForm<z.infer<typeof agentsInsertSchema>>({
        resolver : zodResolver(agentsInsertSchema),
        defaultValues:{
            name:initialValues?.name ?? "",
            instruction:initialValues?.instruction?? "",//this will populate to fall back to empty string
        }
    })
    const isEdit = !!initialValues?.id;
    const isPending = createAgent.isPending;

    const onSubmit = (values : z.infer<typeof agentsInsertSchema>) => {
        if(isEdit){
            console.log("1000 : updateAgent")
        }else {
            createAgent.mutate(values);
        }
    };
    return (
        <Form{...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <GeneratedAvatar
                    seed={form.watch("name")}
                    variant="botttsNeutral"
                    className="border size-16"
                />
                <FormField
                    name = "name"
                    control={form.control}
                    render = {({field})=>(
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g. Ratatouille"/>
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    name = "instruction"
                    control={form.control}
                    render = {({field})=>(
                        <FormItem>
                            <FormLabel>Instruction</FormLabel>
                            <FormControl>
                                <Textarea 
                                {...field} 
                                placeholder = "You are a renowned chef that helps people with recipe."
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <div className="flex justify-between gap-x-2">
                    {onCancel && (
                        <Button
                        variant = "ghost"
                        disabled = {isPending}
                        type = "button"
                        >
                        Cancel
                        </Button>
                    )}
                    <Button
                        disabled = {isPending}
                        type = "submit"
                    >
                        {isEdit ? "update" : "Create"}

                    </Button>
                </div>
            </form>
        </Form>

        
    )
}
