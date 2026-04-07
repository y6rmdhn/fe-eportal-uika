import {redirect} from "react-router-dom";
import session from "@/utils/session.ts";

export default function authLoader (){
    const isAuthenticated = session.isAuthenticated();


    if (isAuthenticated){
        return redirect('/')
    }

    return null;
}