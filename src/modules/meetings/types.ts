import { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type MeetingGetOne = inferRouterOutputs<AppRouter>["meetings"]["getOne"];
            //reusable get one that our ai will return
            //this will help in knowing exactly what my agent is returning.
