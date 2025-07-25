"use client";

import { z } from "zod"; 
import {FaGithub , FaGoogle} from "react-icons/fa";
import {useForm} from "react-hook-form"
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { OctagonAlert } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input"

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert , AlertTitle } from "@/components/ui/alert";
import{
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"

const formSchema = z.object({
    email : z.string().email(),
    password : z.string().min(1, {message : "password is required"}),
});


export const SignInView = () => {
    const router = useRouter();
    const[error , setError] = useState<string | null>(null);
    const[pending , setPending] = useState(false);
    const form = useForm < z.infer<typeof formSchema>>({
        resolver : zodResolver(formSchema),
        defaultValues : {
            email: "",
            password: "",
        },
    });

    const onSubmit =(data: z.infer<typeof formSchema>) => {
        setError(null);
        setPending(true);


        authClient.signIn.email({
            email : data.email,
            password : data.password,
            callbackURL : "/"
        },
        {
            onSuccess: ()=>{
                setPending(false);
                router.push("/")
               
            },
            onError : ({error}) =>{
                setPending(false);
                setError(error.message)
            }
        }  
        );
        

    }

    const onSocial =(provider : "github" | "google") => {
        setError(null);
        setPending(true);


        authClient.signIn.social({
            provider : provider,
            callbackURL : "/"
        },
        {
            onSuccess: ()=>{
                setPending(false);
            },
            onError : ({error}) =>{
                setPending(false);
                setError(error.message)
            }
        }  
        );
        

    }
  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-6">
        <CardContent className="grid gap-4 p-0 md:grid-cols-2">
            <Form {...form}>
                <form onSubmit = {form.handleSubmit(onSubmit)}className="p-6 md:p-8">
                    <div className = "flex flex-col gap-6">
                        <div className="flex flex-col items-center text-center">
                            <h1 className = "text-2xl fond-bold">
                                Welcome back
                            </h1>
                            <p className = "text-muted-foreground text-balance">
                                Login to your account
                            </p>    
                        </div>

                        <div className="grid gap-3">
                        {/* Email Field */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="m@example.com"
                                        {...field}
                                 />
                                </FormControl>
                                 <FormMessage />
                            </FormItem>
                            )}
                            />
                        {/* password Field */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                     type="password"
                                     placeholder="********"
                                     {...field}
                                      />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                  />

                        </div>
                        {!!error && (
                        <Alert className="bg-destructive/10 border-none">
                            <OctagonAlert className="h-4 w-4 !text-desturctive"/>
                            <AlertTitle>{error}</AlertTitle>
                        </ Alert>
                        )}

                        <Button
                
                            disabled = {pending}
                            type="submit"
                            className="w-full bg-blue-700"
                        >
                            Sign in 
                        </Button>
                        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:boreder-t">
                            <span className="bg-card text-muted-foreground relative z-10 px-2 ">
                                Or continue with
                            </span>
                        </div>

                {/* login via social */}
                        <div className = "grid grid-cols-2 gap-4">  
                            <Button
                                disabled = {pending}
                                onClick={()=>{
                                    onSocial("google")
                                }}
                                variant="outline"
                                type = "button"
                                className="w-full"
                            > 
                            <FaGoogle/>
                            </Button>
 
                            <Button
                                disabled = {pending}
                                onClick={()=>{
                                    onSocial("github")
                                }}
                                variant="outline"
                                type = "button"
                                className="w-full"
                            > 
                            <FaGithub/> 
                            </Button>
                        </div>
                            <div className="text-center text-sm">
                                don't have an account? <Link href = "/sign-up">Sign Up</Link>
                         </div> 
                    </div>
                </form>
            </Form>
            

            <div className="bg-radial from-blue-400 to-blue-600 relative hidden md:flex flex-col
            gap-y-4 items-center justify-center ">
                <img src = "/logo.svg" alt = "img" className="h-[100px] w-[100px]"/>
                <p className="text-2xl font-semibold text-white">TalkBuddy</p>
            </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By cliking continue, you agree to our <a href="#">Terms of Service</a> and <a href ="#">Privacy Policy</a>
      </div>
    </div>
  );
};
