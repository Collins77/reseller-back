const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin')
const Supplier = require('../models/Supplier')


//Protected Routes token base
exports.requireSignIn = async (req, res, next) => {
  try {
    // Retrieve the token from the cookies (where it's stored securely)
    const token = req.cookies.token;

    // Ensure the token exists in the cookies
    if (!token) {
      return res.status(401).json({ message: "Authorization token missing or invalid" });
    }

    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(decoded);

    // Attach the decoded data (e.g., reseller ID) to the request object
    req.reseller = decoded;

    // Proceed to the next middleware or controller
    next();
  } catch (error) {
    console.error("Token verification failed:", error);

    // Respond with 401 Unauthorized in case of token verification failure
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).send("You are not authenticated!")
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
      if(err) return res.status(403).send("Token is not valid!");
      req.resellerId = payload.resellerId;
      next();
  })
}
exports.verifySupplierToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).send("You are not authenticated!")
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
      if(err) return res.status(403).send("Token is not valid!");
      req.supplierId = payload.supplierId;
      next();
  })
}
exports.verifyAdminToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).send("You are not authenticated!")
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
      if(err) return res.status(403).send("Token is not valid!");
      req.adminId = payload.adminId;
      next();
  })
}



exports.requiresSupplierSignIn = async (req, res, next) => {
  try {
    const decode =  jwt.verify(
      req.headers.authorization,
      process.env.ACCESS_TOKEN_SECRET
    );
    req.supplier = decode;
    next()
  } catch (error) {
    console.log(error);
  }
}

exports.requiresAdminSignIn = async (req, res, next) => {
  try {
    const decode =  jwt.verify(
      req.headers.authorization,
      process.env.ACCESS_TOKEN_SECRET
    );
    req.admin = decode;
    next()
  } catch (error) {
    console.log(error);
  }
}

//admin acceess
// exports.isAdmin = async (req, res, next) => {
//   try {
//     const admin = await Admin.findById(req.admin._id);
//     if (admin.status !== true) {
//       return res.status(401).send({
//         success: false,
//         message: "UnAuthorized Access",
//       });
//     } else {
//       next();
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(401).send({
//       success: false,
//       error,
//       message: "Error in admin middelware",
//     });
//   }
// };
exports.isSupplier = async (req, res, next) => {
  try {
    const decode = jwt.verify(
      req.headers.authorization,
      process.env.ACCESS_TOKEN_SECRET
    );
    req.supplier = decode;
    next();
  } catch (error) {
    console.log(error);
  }

};

exports.isAdmin = async (req, res, next) => {
  try {
    const decode = jwt.verify(
      req.headers.authorization,
      process.env.ACCESS_TOKEN_SECRET
    );
    req.admin = decode;
    next();
  } catch (error) {
    console.log(error);
  }

};




// exports.isSeller = catchAsyncErrors(async(req,res,next) => {
//     const {seller_token} = req.cookies;
//     if(!seller_token){
//         return next(new ErrorHandler("Please login to continue", 401));
//     }

//     const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);

//     req.seller = await Supplier.findById(decoded.id);

//     next();
// });


// exports.isAdmin = (...roles) => {
//     return (req,res,next) => {
//         if(!roles.includes(req.user.role)){
//             return next(new ErrorHandler(`${req.user.role} can not access this resources!`))
//         };
//         next();
//     }
// }