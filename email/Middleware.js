const middleware = (req,res,next) =>{
    // Health check endpoint
    if (req.path === "/health") {
        return res.status(200).send("OK");
    }

    const api_key=req.header("email-api-key");

    const secret = process.env.API_KEY;

    if(api_key!=secret) res.status(403).send("Invalid API KEY");
    else next();
}

export default middleware;