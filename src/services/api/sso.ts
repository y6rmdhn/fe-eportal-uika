import network from "@/utils/network.ts";

const auth = {
    generateTicket(){
        return network.post("/sso/generate-ticket");
    },
};

export default auth;
