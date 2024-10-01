const Reseller = require('../models/Reseller')
const Product = require('../models/Product')
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const sendMail = require('../middleware/sendMail');
const fs = require('fs');
const path = require('path');

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, resellerId) => {
    return jwt.sign({ email, resellerId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: maxAge })
};

// @desc get all resellers
// @route GET /resellers
// @access Private
const getAllResellers = asyncHandler(async (req, res) => {
    const resellers = await Reseller.find().lean()
    if(!resellers?.length) {
        return res.status(400).json({message: 'No resellers found'})
    }
    res.json(resellers)
})

// @desc create new reseller
// @route POST /resellers
// @access Private
const createNewReseller = asyncHandler(async (req, res) => {
try {
    const { firstName, lastName, companyName, country, email, address, phoneNumber, password } = req.body;

    if(!firstName || !lastName || !country || !email || !companyName || !address || !phoneNumber || !password) {
        return res.status(400).json({message: 'All fields are required!'})
    }

    // Check if the email already exists
    const resellerEmail = await Reseller.findOne({ email });
    if (resellerEmail) {
        return res.status(409).json({ message: 'Reseller already exists!' })
    }

    const hashedPwd = await bcrypt.hash(password, 10)

    // Create a new user with status 'Not Approved'
    const newReseller = new Reseller({
      firstName,
      lastName,
      email,
      country,
      companyName,
      address,
      phoneNumber,
      "password": hashedPwd,
      status: "Not approved",
      roles: "Reseller"
    });

    // Save the user to the database
    await newReseller.save();

    const emailTemplatePath = path.join(__dirname, '..', 'views', 'emailTemplate.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Replace placeholders with actual values
    const formattedTemplate = emailTemplate
        .replace('{{firstName}}', newReseller.firstName)
        .replace('{{message}}', `Hi ${newReseller.firstName}, we have received your application to become a member of our platform. Your account is pending approval from our team. Kindly be patient as we process your application. You will be notified upon approval.`);

    // Send an email with the formatted template
    await sendMail({
        email: newReseller.email,
        subject: "Application Received",
        html: formattedTemplate,
    });

    res.status(201).json({
      success: true,
      message: `Please check your email (${newReseller.email}) for further instructions.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occurred!'})
  }
});

const adminCreateReseller = asyncHandler(async (req, res) => {

  try {
      const { firstName, lastName, companyName, email, address, country, phoneNumber, password } = req.body;
  
      if(!firstName || !lastName || !email || !companyName || !address || !country || !phoneNumber || !password) {
          return res.status(400).json({message: 'All fields are required!'})
      }
  
      // Check if the email already exists
      const Email = await Reseller.findOne({ email });
      if (Email) {
          return res.status(409).json({ message: 'Reseller already exists!' })
      }
  
      const hashedPwd = await bcrypt.hash(password, 10)
  
      // Create a new user with status 'Not Approved'
      const newReseller = new Reseller({
          firstName, 
          lastName, 
          companyName, 
          email, 
          address,  
          phoneNumber, 
          "password": hashedPwd,
          country,
          status: "Approved",
          roles: "Reseller"
      });
  
      // Save the user to the database
      await newReseller.save();
  
      const emailTemplatePath = path.join(__dirname, '..', 'views', 'accountSetup.html');
      const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');
  
      // Replace placeholders with actual values
      const formattedTemplate = emailTemplate
          .replace('{{firstName}}', newReseller.firstName)
          .replace('{{password}}', password)
          .replace('{{email}}', newReseller.email)
  
      // Send an email with the formatted template
      await sendMail({
          email: newReseller.email,
          subject: "Application Received",
          html: formattedTemplate,
      });
  
      res.status(201).json({
        success: true,
        message: `Please check your personal email (${newReseller.email}) for further instructions.`,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'An error occurred!'})
    }
  });


// @desc update a reseller
// @route PATCH /resellers
// @access Private

const loginReseller = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation for email and password
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if the reseller exists and retrieve password
    const reseller = await Reseller.findOne({ email }).select("+password");
    if (!reseller) {
      return res.status(400).send({
        success: false,
        message: "User with that email is not registered",
      });
    }

    // Check if the reseller is approved
    if (reseller.status !== "Approved") {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending approval. Please contact Admin!',
      });
    }

    // Validate the password
    const isMatch = await bcrypt.compare(password, reseller.password);
    if (!isMatch) {
      return res.status(400).send({
        success: false,
        message: "Invalid credentials",
      });
    }

    res.cookie("jwt", createToken(email, reseller.id), {
      maxAge,
      secure: true,
      sameSite: "None",
  });

    // Remove sensitive information like password before sending response
    const resellerData = {
      id: reseller.id,
      email: reseller.email,
      firstName: reseller.firstName,
      lastName: reseller.lastName,
      phoneNumber: reseller.phoneNumber,
      address: reseller.address,
      status: reseller.status,
      // Add other fields you may need (but not password)
    };

    // Send success response without exposing the token in JSON
    res.status(200).send({
      success: true,
      message: "Login successful",
      reseller: resellerData, // Send sanitized reseller data
    });

  } catch (error) {
    // Error handling
    res.status(500).send({
      success: false,
      message: "Error during login",
      error: error.message,
    });
  }
});

const getReseller = asyncHandler(async (req, res) => {
    try {
        const reseller = await Reseller.findById(req.reseller.id);
  
        if (!reseller) {
          return res.status(400).json({ message: "Reseller doesn't exist" });
        }
  
        res.status(200).json({
          success: true,
          reseller,
        });
      } catch (error) {
        return res.status(500).json(error.message);

      }
})

const getResellerInfo = async (req, res, next) => {
  try {

      const resellerData = await Reseller.findById(req.resellerId);
      console.log(resellerData)
      if (!resellerData) {
          return res.status(404).send("Reseller with the given id not found");
      }
      return res.status(200).json({
          id: resellerData.id,
          email: resellerData.email,
          phoneNumber: resellerData.phoneNumber,
          firstName: resellerData.firstName,
          lastName: resellerData.lastName,
          address: resellerData.address,
          companyName: resellerData.companyName,
          country: resellerData.country,
          // image: resellerData.image,
          // color: resellerData.color,
      })
  } catch (error) {
      console.log({ error })
      return res.status(500).send("Internal Server Error")
  }
}


const getResellerById = asyncHandler(async (req, res) => {
  try {
      const reseller = await Reseller.findById(req.params.id);
      if(!reseller) {
          return res.status(404).json({ message: 'Reseller not found!' });
      }
    res.status(201).json({
      success: true,
      reseller,
    });
    } catch (error) {
      return res.status(500).json(error.message);
    }
})
const getResellerByToken = asyncHandler(async (req, res) => {
  try {
    const resellerId = req.reseller.id; // Assuming the JWT payload includes the reseller's ID
    const reseller = await Reseller.findById(resellerId);

    if (!reseller) {
      return res.status(404).json({ message: "Reseller not found" });
    }

    res.status(200).json(reseller);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
})

const getNotApprovedResellers = asyncHandler(async (req, res) => {
  const resellers = await Reseller.find({ status: "Not approved" }).lean();
  if (!resellers?.length) {
      return res.status(400).json({ message: 'No resellers with status "Not approved" found' });
  }
  res.json(resellers);
});

const loggedIn = asyncHandler(async (req, res) => {
  try {
    const token = req.cookies.token;
    if(!token) {
      return res.json(false);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.send(true);
    next();
  } catch (error) {
    res.json(false)
  }
})

const logOutReseller = asyncHandler(async (req, res) => {
  try {
    res.cookie("jwt", "", {maxAge:1, secure:true, sameSite:"None"});

    return res.status(200).send("Logout successful!");
} catch (error) {
    console.log({ error })
    return res.status(500).send("Internal Server Error")
}
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const { id } = req.params;

  try {
    // Find the admin by ID
    const reseller = await Reseller.findById(id).select("+password");;

    // Check if admin exists
    if (!reseller) {
      return res.status(404).json({ message: 'Reseller not found' });
    }

    console.log('Reseller password:', reseller.password);

    // Compare old password with the hashed password in the database
    const isMatch = await bcrypt.compare(oldPassword, reseller.password);

    // Log the result of the comparison
    console.log('Password comparison result:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid old password' });
    }

    // Validate new password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirm password do not match' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);


    // Update user's password with the new hashed password
    reseller.password = hashedPassword;
    await reseller.save();

    // Password changed successfully
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


const updateReseller = asyncHandler(async (req, res) => {
    
    try {
      const { resellerId } = req;
      updatedResellerData = req.body;

        const updatedReseller = await Reseller.findByIdAndUpdate(resellerId, updatedResellerData, { new: true, runValidators: true });

        if (!updatedReseller) {
            return res.status(404).json({ error: 'Reseller not found' });
        }

        // Send a success response
        res.status(200).json({ message: 'Reseller updated successfully', reseller: updatedReseller });
    } catch (error) {
        console.error('Error updating reseller:', error);
        // Send an error response
        res.status(500).json({ error: 'Internal server error' });
    }

    // res.json({ message: `${updatedReseller.firstName} updated` })
})

const approveReseller = asyncHandler(async (req, res) => {
    try {
        const reseller = await Reseller.findById(req.params.id);
  
        if (!reseller) {
          return res.status(404).json({ message: "Reseller not found" });
        }
  
        reseller.status = "Approved";
        await reseller.save();

        const emailTemplatePath = path.join(__dirname, '..', 'views', 'emailTemplate.html');
        const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

        // Replace placeholders with actual values
        const formattedTemplate = emailTemplate
            .replace('{{firstName}}', reseller.firstName)
            .replace('{{message}}', `Hi ${reseller.firstName}, we are pleased to inform you that your account has been approved! You can now log in to your account at https://resellerprint.com/login and start your journey with us.`);

        // Send an email with the formatted template
        await sendMail({
            email: reseller.email,
            subject: "Account Approval Notification",
            html: formattedTemplate,
        });
  
        res.status(200).json({
          success: true,
          message: "Reseller approved successfully!",
          reseller,
        });
      } catch (error) {
        return res.status(500).json(error.message);
      }
})

const holdReseller = asyncHandler(async (req, res) => {
  try {
      const reseller = await Reseller.findById(req.params.id);

      if (!reseller) {
        return res.status(404).json({ message: "Reseller not found" });
      }

      reseller.status = "On Hold";
      await reseller.save();

      const emailTemplatePath = path.join(__dirname, '..', 'views', 'emailTemplate.html');
      const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

      // Replace placeholders with actual values
      const formattedTemplate = emailTemplate
          .replace('{{firstName}}', reseller.firstName)
          .replace('{{message}}', `Hi ${reseller.firstName}, we regret to inform you that your account has been put on hold! Kindly contact our team for further clarification.`);

      // Send an email with the formatted template
      await sendMail({
          email: reseller.email,
          subject: "Account Suspension Notification",
          html: formattedTemplate,
      });

      res.status(200).json({
        success: true,
        message: "Reseller suspended successfully!",
        reseller: reseller,
      });
    } catch (error) {
      return res.status(500).json(error.message);
    }
})
const rejectReseller = asyncHandler(async (req, res) => {
    try {
        const reseller = await Reseller.findById(req.params.id);
  
        if (!reseller) {
          return res.status(404).json({ message: "Reseller not found" });
        }
  
        reseller.status = "Rejected";
        await reseller.save();

        const emailTemplatePath = path.join(__dirname, '..', 'views', 'emailTemplate.html');
        const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

        // Replace placeholders with actual values
        const formattedTemplate = emailTemplate
            .replace('{{firstName}}', reseller.firstName)
            .replace('{{message}}', `Hi ${reseller.firstName}, we regret to inform you that your application has been rejected! Kindly reach out to our team for further details.`);

        // Send an email with the formatted template
        await sendMail({
            email: reseller.email,
            subject: "Application Rejected",
            html: formattedTemplate,
        });
  
        res.status(200).json({
          success: true,
          message: "Reseller rejection successful!",
          reseller,
        });
      } catch (error) {
        return res.status(500).json(error.message);
      }
})

// @desc delete a reseller
// @route DELETE /resellers
// @access Private
const deleteReseller = asyncHandler(async (req, res) => {
  const reseller = await Reseller.findById(req.params.id);
  
  if (!reseller) {
    return res.status(404).json({message: 'Reseller is not found'});
  }

  await reseller.deleteOne()

  res.status(201).json({
    success: true,
    message: "Reseller Deleted successfully!",
  });
})

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await Reseller.findOne({email});
    if(!oldUser) {
      return res.status(400).json({ message: 'Reseller not found'});
    }
    //token
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "20m",
    });
    const link = `https://resprint.api.resellersprint.com/resellers/reset-password/${oldUser._id}/${token}`;
    // const link = `http://localhost:3500/resellers/reset-password/${oldUser._id}/${token}`;
    const emailTemplatePath = path.join(__dirname, '..', 'views', 'forgotPassword.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Replace placeholders with actual values
    const formattedTemplate = emailTemplate
        .replace('{{firstName}}', oldUser.firstName)
        .replace('{{link}}', link)

    // Send an email with the formatted template
    await sendMail({
        email: oldUser.email,
        subject: "Password Reset",
        html: formattedTemplate,
    });
    return res.status(200).json({ message: 'Check your email' })
  } catch (error) {
    
  }
})

const resetPassword = asyncHandler(async (req, res) => {
  const {id, token} = req.params;
  const oldReseller = await Reseller.findOne({_id: id})
  if(!oldReseller) {
    return res.status(400).json({ message: "Reseller does not exist" });
  }
  try {
    const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.render('forgot', { email: verify.email, status:"not verified" })
  } catch (error) {
    res.send("Not verified")
  }

})
const resetPasswordComplete = asyncHandler(async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    // Verify the JWT token
    const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Hash the new password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Update the password for the Reseller document
    const updatedReseller = await Reseller.findByIdAndUpdate(
      id,
      { password: encryptedPassword },
      { new: true } // To return the updated document
    );

    if (!updatedReseller) {
      return res.status(400).json({ message: "Reseller does not exist" });
    }

    // Password successfully updated, render a response
    res.render("forgot", { email: verify.email, status: "verified" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }

})

module.exports = {
    getAllResellers, 
    createNewReseller, 
    updateReseller,
    loginReseller,
    getReseller,
    deleteReseller,
    logOutReseller,
    approveReseller,
    loggedIn,
    forgotPassword,
    resetPassword,
    resetPasswordComplete,
    getNotApprovedResellers,
    rejectReseller,
    getResellerById,
    holdReseller,
    adminCreateReseller,
    changePassword,
    getResellerByToken,
    getResellerInfo,
}