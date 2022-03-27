const jwt = require('jsonwebtoken')

module.exports = (context) => {
    let token;
    if(context.req && context.req.headers.authorization)
    {
        token = context.req.headers.authorization.split('Bearer ')[1];
    }
    // else if(context.connectionParams.authentication)
    // {
    //     token = context.connectionParams.authentication.split(' ')[1];
    // }
    let decodedToken;
    if(token)
    {
        try 
        {
            decodedToken = jwt.verify(token, process.env.JSON_SECRET);
            context.authUser = decodedToken;
        } 
        catch (error) 
        {
            console.log(error);
            throw error;
        }
    }

    return context
};