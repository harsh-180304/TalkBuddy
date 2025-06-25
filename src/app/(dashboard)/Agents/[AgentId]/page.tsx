import { getQueryClient , trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AgentIdView, AgentIdViewError, AgentIdViewLoading } from "@/modules/agents/ui/views/agent_id_view";
interface Props {
    params : Promise<{AgentId : string}>
};

const Page = async ({ params }:Props)=>{
    const { AgentId } = await params; 
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(
        trpc.agents.getOne.queryOptions({id : AgentId})
    );
    return (
        <HydrationBoundary state = {dehydrate(queryClient)}>
            <Suspense fallback = {<AgentIdViewLoading/>}>
                <ErrorBoundary fallback = {<AgentIdViewError/>}>
                    <AgentIdView AgentId = {AgentId}/>
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
     );
}

export default Page;