import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { createTRPCRouter,protectedProcedure } from "@/trpc/init";
import { Auth } from "better-auth";

import {z} from "zod";
import { eq , getTableColumns, and, ilike ,desc, count,sql} from "drizzle-orm";
import { DEFAULT_PAGE, MAX_PAGE_SIZE, MIN_PAGE_SIZE ,DEFAULT_PAGE_SIZE} from "@/constants";
import { pages } from "next/dist/build/templates/app-page";
import { TRPCError } from "@trpc/server";
import { meetingsInsertSchema , meetingsUpdateSchema} from "../schemas";

export const meetingRouter = createTRPCRouter({

    update:protectedProcedure
    .input(meetingsUpdateSchema)
    .mutation(async ({ctx , input}) => {
        const [updatedMeeting] = await db
            .update(meetings)
            .set(input)
            .where(
                and(
                    eq(meetings.id , input.id ),
                    eq(meetings.userId , ctx.auth.user.id)
                )
            )
            .returning();

        if(!updatedMeeting){
            throw new TRPCError({
                code : "NOT_FOUND",
                message: "Agent not found",
            });
        }
    return updatedMeeting;
        
    }),

    create: protectedProcedure //this will provide safety if user is not logged in 
    .input(meetingsInsertSchema)   //this remainig code will protect if user does not provide valid bot name and intruction.
    .mutation(async({input , ctx})=>{
        const[createdMeeting] = await db  //doing this inside of an array  and not const data = await db 
        .insert(meetings)                 //because by default drizzle always return an array thats the way 
        .values({                       //its sql works thus we have to destructure the first term of this
            ...input,                   // array as this will create a single recored and it is safe to access
            userId : ctx.auth.user.id,  // the first itme of an array in here
        })
        .returning();
        //todo : create stream call , upsert stream users
        return createdMeeting;
    }),
   
    getOne: protectedProcedure.input(z.object({id : z.string()}))
        .query( async ({ input,ctx })=>{ //for updating the agent they hav to fetch first and this done by getOne
        const[existingMeeting] = await db           //agents on the basis of id
            .select({
                //agent associated with number of meeings.
                ...getTableColumns(meetings),
                //change it later
    })
            .from(meetings)
            .where(
                and(
                    eq(meetings.id , input.id),
                    eq(meetings.userId , ctx.auth.user.id), //along side grasping the data we check that author is the creater of that agent or not 

            )
        );
        if(!existingMeeting){
            throw new TRPCError({code:"NOT_FOUND",message : "Agent not found" })     
        }
    
        return existingMeeting ;
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
                ...getTableColumns(meetings),
                agent : agents,
                duration : sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as("duration"),
            })
            .from(meetings)
            .innerJoin(agents,eq(meetings.agentId , agents.id)) //inner join bcz only render those meeting that are correctly matched with there agent. and inner join prevent null cases
            
            .where(
                and(
                    eq(meetings.userId , ctx.auth.user.id),
                    search ? ilike(meetings.name,`%${search}%`) : undefined,
                )
            )
            .orderBy(desc(meetings.createdAt),desc(meetings.id))
            .limit(pageSize)
            .offset((page-1)*pageSize)
        
        const [total] = await db  
            .select({count:count()})
            .from(meetings)
            .where(
                and(
                    eq(meetings.userId , ctx.auth.user.id),
                    search ? ilike(meetings.name,`%${search}%`) : undefined,
                )
            );
        const totalPages = Math.ceil(total.count / pageSize)
        return {
            items:data,
            total:total.count,
            totalPages,
        }
    

    }),
    
    
});