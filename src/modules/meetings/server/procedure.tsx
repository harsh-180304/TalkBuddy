import { db } from "@/db";
import { agents, meetings, user } from "@/db/schema";
import { createTRPCRouter,protectedProcedure } from "@/trpc/init";
import { Auth } from "better-auth";
import JSONL from "jsonl-parse-stringify"
import {z} from "zod";
import { eq , getTableColumns, and, ilike ,desc, count,sql, inArray} from "drizzle-orm";
import { DEFAULT_PAGE, MAX_PAGE_SIZE, MIN_PAGE_SIZE ,DEFAULT_PAGE_SIZE} from "@/constants";
import { pages } from "next/dist/build/templates/app-page";
import { TRPCError } from "@trpc/server";
import { meetingsInsertSchema , meetingsUpdateSchema} from "../schemas";

import { MeetingStatus, StreamTransriptItem } from "../types";
import { streamVideo } from "@/lib/stream-video";
import { generateAvatarUri } from "@/lib/avatar";
import { streamChat } from "@/lib/stream-chat";

export const meetingRouter = createTRPCRouter({

    generateChatToken : protectedProcedure.mutation(async({ctx}) => {
        const token = streamChat.createToken(ctx.auth.user.id);
        await streamChat.upsertUser({
            id:ctx.auth.user.id,
            role:"admin"
        });
        return token;
    }),

    getTranscript : protectedProcedure
        .input(z.object({id:z.string() }))
        .query(async ({input , ctx})=>{
            const [existingMeeting] = await db
                .select()
                .from(meetings)
                .where(
                    and(eq(meetings.id , input.id),eq(meetings.userId , ctx.auth.user.id))
                );
        if(!existingMeeting){
            throw new TRPCError({
                code : "NOT_FOUND",
                message : "Meeting not found",
            });
        }   
        
        if(!existingMeeting.transcriptUrl){
            return [];
        }

        const transcript = await fetch(existingMeeting.transcriptUrl)
            .then((res) =>res.text())
            .then((text) => JSONL.parse<StreamTransriptItem>(text))
            .catch(()=>{
                return [];
            });
        const speakerIds = [
            ...new Set(transcript.map((item)=>item.speaker_id)),
        ];

        const userSpeakers = await db
            .select()
            .from(user)
            .where(inArray(user.id , speakerIds))
            .then((users)=>
                users.map((user)=>({
                    ...user,
                    image:
                    user.image??
                    generateAvatarUri({seed:user.name , variant : "initials"}),
                }))
            );

        
            const agentSpeakers = await db
            .select()
            .from(agents)
            .where(inArray(agents.id , speakerIds))
            .then((agents)=>
                agents.map((agent)=>({
                    ...agent,
                    image : generateAvatarUri({
                        seed: agent.name,
                        variant : "botttsNeutral"
                    }),
                }))
            );
            const speakers = [...userSpeakers , ...agentSpeakers];

            const transcriptWithSpeakers = transcript.map((item)=>{
                const speaker = speakers.find(
                    (speaker) => speaker.id === item.speaker_id
                );

            if(!speaker){
                return {
                    ...item,
                    user: {
                        name : "Unknown",
                        image: generateAvatarUri({
                            seed : "Unknown",
                            variant : "initials",
                        }),
                    },
                };
            }
        })
           return transcriptWithSpeakers;

     }),

       generateToken : protectedProcedure.mutation(async ({ctx})=>{
        await streamVideo.upsertUsers([
            {
                id : ctx.auth.user.id,
                name: ctx.auth.user.name,
                role : "admin",
                image:  
                    ctx.auth.user.image ?? 
                    generateAvatarUri({seed : ctx.auth.user.name , variant : "initials" }),
                    
            },
        ]);

        const expirationTime = Math.floor(Date.now()/1000) + 3600;
        const issuedAt = Math.floor(Date.now()/1000)-60;

        const token = streamVideo.generateUserToken({
            user_id : ctx.auth.user.id,
            exp : expirationTime,
            validity_in_seconds : issuedAt, 
        })
        return token;
    }),

   


    remove:protectedProcedure
    .input(z.object({id: z.string()}))
    .mutation(async ({ctx , input}) => {
        const [removedMeeting] = await db
            .delete(meetings)
            .where(
                and(
                    eq(meetings.id , input.id ),
                    eq(meetings.userId , ctx.auth.user.id)
                )
            )
            .returning();

        if(!removedMeeting){
            throw new TRPCError({
                code : "NOT_FOUND",
                message: "Agent not found",
            });
        }
    return removedMeeting;
        
    }),

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
    const call = streamVideo.video.call("default",createdMeeting.id);
    await call.create({
        data:{
            created_by_id: ctx.auth.user.id,
            custom : {
                meetingId : createdMeeting.id,
                meetingName : createdMeeting.name
            },
            settings_override:{
                transcription:{
                language:"en",
                mode : 'auto-on',
                closed_caption_mode: "auto-on",
            },
            recording: {
                mode : "auto-on",
                quality : "1080p"
            },
        },
        },
    });

    const [existingAgent] = await db   
        .select()
        .from(agents)
        .where(eq(agents.id , createdMeeting.agentId));

    if(!existingAgent){
        throw new TRPCError({
            code : "NOT_FOUND",
            message : "Agent not found",
        });
    }

    await streamVideo.upsertUsers([
    {
        id:existingAgent.id,
        name:existingAgent.name,
        role : "user",
        image: generateAvatarUri({
            seed : existingAgent.name,
            variant : "botttsNeutral"
        }),
    },
]);
        return createdMeeting;
     }),
   
    getOne: protectedProcedure.input(z.object({id : z.string()}))
        .query( async ({ input,ctx })=>{ //for updating the agent they hav to fetch first and this done by getOne
        const[existingMeeting] = await db           //agents on the basis of id
            .select({
                //agent associated with number of meeings.
                ...getTableColumns(meetings),
                //change it later
                agent : agents,
                duration : sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as("duration"),
    })
            .from(meetings)
            .innerJoin(agents,eq(meetings.agentId,agents.id))
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
        search:z.string().nullish(),
        agentId:z.string().nullish(),
        status : z
            .enum([
                MeetingStatus.Upcoming,
                MeetingStatus.Active,
                MeetingStatus.Completed,
                MeetingStatus.Processing,
                MeetingStatus.Cancelled,
            ])
            .nullish(),
         })
        )
          //whenever we create new agent we refetch agent getMany by invalidating it.
         //thus we put default value and put the whole object in optional
    
        .query(async({ctx,input})=>{
          const {search,page,pageSize,status,agentId} = input;
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
                    status ? eq(meetings.status , status) : undefined,
                    agentId ? eq(meetings.agentId , agentId) : undefined,
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
                    status ? eq(meetings.status , status) : undefined,
                    agentId ? eq(meetings.agentId , agentId) : undefined,
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