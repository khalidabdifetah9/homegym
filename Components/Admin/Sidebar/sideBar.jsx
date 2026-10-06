import React from 'react'
import Content from './content'
import {auth} from "@/lib/auth"
import { headers } from "next/headers";
const Sidebar = async () => {
  const session = await auth.api.getSession({
    headers:await headers()
  })
  let Admin = "Your Name"
  if(session){
    Admin = session.user.name;
  }
  return (
    <Content name = {Admin}/>
  )
}

export default Sidebar