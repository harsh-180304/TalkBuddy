import {Button} from "@/components/ui/button"
export default function Home(){
  console.log("Loaded DB URL:", process.env.DATABASE_URL);
  return(
    <Button variant={"destructive"}>click me</Button>

  )
} 