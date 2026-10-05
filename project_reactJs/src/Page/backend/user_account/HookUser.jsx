import {alertError,alertSuccess} from "../../../swertalert/AlertSuccess"
import request from "../../util/request";
import { useState } from "react";
const HookUser = () => {
    const [data, setData] = useState({
        username: "",
        password: ""
    })

    const UserLogin =  async () => {
        try{
            const res = await request("/api/user/login", "POST", {
                username:  data?.username,
                password: data?.password
            })
            if(res){
                alertSuccess({
                    title: "Login Success",
                    text: "Login successfully"
                })
                // console.log(res);
            }
        }catch(error){
            alertError({
                title: "Error",
                text: error?.response?.data?.message
            })
        }
    }

  return (
    {
        UserLogin,
        data,
        setData
    }
  )
}

export default HookUser