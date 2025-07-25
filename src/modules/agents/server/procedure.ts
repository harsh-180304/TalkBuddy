import { db } from "@/db";
import { agents } from "@/db/schema";
import { createTRPCRouter,protectedProcedure } from "@/trpc/init";
import { Auth } from "better-auth";
import { agentsInsertSchema, agentsUpdateSchema } from "../schemas";
import {z} from "zod";
import { eq, sql , getTableColumns, and, ilike ,desc, count} from "drizzle-orm";
import { DEFAULT_PAGE, MAX_PAGE_SIZE, MIN_PAGE_SIZE ,DEFAULT_PAGE_SIZE} from "@/constants";
import { pages } from "next/dist/build/templates/app-page";
import { TRPCError } from "@trpc/server";
export const agentsRouter = createTRPCRouter({
    update:protectedProcedure
        .input(agentsUpdateSchema)
        .mutation(async ({ctx , input}) => {
            const [updatedAgent] = await db
                .update(agents)
                .set(input)
                .where(
                    and(
                        eq(agents.id , input.id ),
                        eq(agents.userId , ctx.auth.user.id)
                    )
                )
                .returning();

            if(!updatedAgent){
                throw new TRPCError({
                    code : "NOT_FOUND",
                    message: "Agent not found",
                });
            }
        return updatedAgent;
            
        }),
    remove : protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx , input }) =>{
        const [removedAgent] = await db
            .delete(agents)
            .where(
                and(
                    eq(agents.id , input.id ),
                    eq(agents.userId , ctx.auth.user.id)
                ),
            )
            .returning();

        if(!removedAgent){
            throw new TRPCError({
                code : "NOT_FOUND",
                message: "Agent not found",
            });
        }
        return removedAgent;
    }),
    //too : change getMany to use protectedprocedures
    getOne: protectedProcedure.input(z.object({id : z.string()}))
        .query( async ({ input,ctx })=>{ //for updating the agent they hav to fetch first and this done by getOne
        const[existingAgent] = await db           //agents on the basis of id
            .select({
                //agent associated with number of meeings.
                ...getTableColumns(agents),
                meetingCount: sql<number>`3` ,//change it later
    })
            .from(agents)
            .where(
                and(
                    eq(agents.id , input.id),
                    eq(agents.userId , ctx.auth.user.id), //along side grasping the data we check that author is the creater of that agent or not 

            )
        );
        if(!existingAgent){
            throw new TRPCError({code:"NOT_FOUND",message : "Agent not found" })     
        }
    
        return existingAgent ;
    }),
    getMany : protectedProcedure
      .input(
        z.object({
           page : z.number().default(DEFAULT_PAGE),
           pageSize:z   
            .number()
            .min(MIN_PAGE_SIZE)
            .max(MAX_PAGE_SIZE)
            .default(DEFAULT_PAGE_SIZE),
        search:z.string().nullish()
         })
        )
          //whenever we create new agent we refetch agent getMany by invalidating it.
         //thus we put default value and put the whole object in optional
    
        .query(async({ctx,input})=>{
          const {search,page,pageSize} = input;
          const data = await db
            .select({
                ...getTableColumns(agents),
                meetingCount: sql<number>`3` ,
            })
            .from(agents)
            .where(
                and(
                    eq(agents.userId , ctx.auth.user.id),
                    search ? ilike(agents.name,`%${search}%`) : undefined,
                )
            )
            .orderBy(desc(agents.createdAt),desc(agents.id))
            .limit(pageSize)
            .offset((page-1)*pageSize)
        
        const [total] = await db  
            .select({count:count()})
            .from(agents)
            .where(
                and(
                    eq(agents.userId , ctx.auth.user.id),
                    search ? ilike(agents.name,`%${search}%`) : undefined,
                )
            );
        const totalPages = Math.ceil(total.count / pageSize)
        return {
            items:data,
            total:total.count,
            totalPages,
        }
    

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