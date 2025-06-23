import { db } from "@/db";
import { agents } from "@/db/schema";
import { createTRPCRouter,protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { agentsInsertSchema } from "../schemas";
import {z} from "zod";
import { eq } from "drizzle-orm";
export const agentsRouter = createTRPCRouter({
    //too : change getMany to use protectedprocedures
    getOne: protectedProcedure.input(z.object({id : z.string()})).query(async({input})=>{ //for updating the agent they hav to fetch first and this done by getOne
        const[existingAgent] = await db           //agents on the basis of id
            .select()
            .from(agents)
            .where(eq(agents.id , input.id))
    
        return existingAgent ;
    }),
    getMany : protectedProcedure.query(async()=>{
        const data = await db
            .select()
            .from(agents);

    
        return data;
    }),
    create: protectedProcedure //this will provide safety if user is not logged in 
    .input(agentsInsertSchema)   //this remainig code will protect if user does not provide valid bot name and intruction.
    .mutation(async({input , ctx})=>{
        const[createdAgent] = await db  //doing this inside of an array  and not const data = await db 
        .insert(agents)                 //because by default drizzle always return an array thats the way 
        .values({                       //its sql works thus we have to destructure the first term of this
            ...input,                   // array as this will create a single recored and it is safe to access
            userId : ctx.auth.user.id,  // the first itme of an array in here
        })
        .returning();

        return createdAgent;
    })
});