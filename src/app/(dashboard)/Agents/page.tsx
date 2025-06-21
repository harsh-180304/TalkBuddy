import { LoadingState } from "@/components/loading-state";
import { AgentsView  ,AgentViewError} from "@/modules/agents/ui/views/agents-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

const page = async () =>{
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions());
    return (
        <HydrationBoundary state = {dehydrate(queryClient)}>
            <Suspense fallback = {<LoadingState title = "Loading Agents" description="This may take a few seconds"/>}>
                <ErrorBoundary fallback = {<AgentViewError/>}>
                    <AgentsView/>
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
};
export default page;