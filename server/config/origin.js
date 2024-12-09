exports.origin = ()=>{
    const server=`http://localhost:${process.env.PORT}`;
    const others = ['http://localhost:5173'];
    return {
        server,
        others,
        all: [server,...others]
    }
}