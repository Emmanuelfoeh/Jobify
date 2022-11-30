import {
  badRequest,
  unauthenticated,
} from "../errors/index.js";
import User from "../Models/User.js";


const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      throw new badRequest("please enter all required fields");
    }
    const user = await User.create(req.body);
    const token = user.createJWT();
    res.status(201).json({
      status: "success",
      user: {
        email: user.email,
        lastName: user.lastName,
        location: user.location,
        name: user.name,
      },
      location: user.location,
      token,
    });

    // throw new Error("User created fail")
  } catch (error) {
    next(error);
    // res.status(500).json({msg:'An error has occurred while registering',error:error.message});
  }
};

const login = async (req, res, next) => {

try {
  const {email, password} = req.body
  if(!email || !password) {
    throw new badRequest("All Fields are required")
  }
  const user = await User.findOne({email}).select('+password')
  if(!user) {
    throw new unauthenticated('Invalid email or password')
  }
  const isCorrectPassword = await user.comparePassword(password)
  if(!isCorrectPassword) {
    throw new unauthenticated('Invalid email or password')
  }
  const token = user.createJWT()
  
  user.password = undefined
  res.status(200).json({status: 'success',user,token,location:user.location})

} catch (error) {
  next(error)
}
};

const update = async (req, res, next) => {
  try {
    
  const { email, name, lastName, location } = req.body;
 if (!email || !name || !lastName || !location) {
   throw new badRequest("Please provide all values");
 }

 const user = await User.findOne({ _id: req.user.userId });

 user.email = email;
 user.name = name;
 user.lastName = lastName;
 user.location = location;

 await user.save();

 const token = user.createJWT();
 res.status(200).json({
   user,
   token,
   location: user.location,
 });

  } catch (error) {
    next(error)
  }
};

export { register, login, update };
