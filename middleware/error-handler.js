const errorHandler = (err,req,res, next) => {
    const defaultError ={
        statusCode:err.statusCode || 500,
        msg: err.message || 'Something went wrong,try again later'
    }
    if(err.name === 'ValidationError'){
        defaultError.statusCode = 400
        defaultError.msg = Object.values(err.errors).map((item)=> item.message).join(',')
    }
    if(err.code && err.code === 11000){
        defaultError.statusCode = 400,
        defaultError.msg =`${Object.keys(err.keyValue)} field has to be unique. ${Object.values(err.keyValue)} already exists`
    }
    // res.status(defaultError.statusCode).json({msg:err})
    res.status(defaultError.statusCode).json({mes:defaultError.msg})
}

export default errorHandler