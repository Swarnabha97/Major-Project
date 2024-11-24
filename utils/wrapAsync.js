 wrapAsync =  (fn)=> {
    return (req,res,next)=> {
         fn(req,res,next).catch(next);
    }
};

module.exports = wrapAsync;

// module.exports= (fn)=> {
//     return (req,res,next)=> {
//          fn(req,res,next).catch(next);
//     }
// };