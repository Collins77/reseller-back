const Supplier = require('../models/Supplier')
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const sendMail = require('../middleware/sendMail');
const fs = require('fs');
const path = require('path');
const sendSupplierToken = require('../utils/supplierToken');

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, supplierId) => {
    return jwt.sign({ email, supplierId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: maxAge })
};

const getAllSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find().lean()
  if (!suppliers?.length) {
    return res.status(400).json({ message: 'No suppliers found' })
  }
  res.status(200).json({ suppliers })
})


const createNewSupplier = asyncHandler(async (req, res) => {

  try {
    const { firstName, lastName, companyName, companyEmail, companyType, categories, location, email, address, dollarExchangeRate, phoneNumber, password } = req.body;

    if (!firstName || !lastName || !location || !email || !companyName || !companyEmail || !categories || !companyType || !dollarExchangeRate || !address || !phoneNumber || !password) {
      return res.status(400).json({ message: 'All fields are required!' })
    }

    // Check if the email already exists
    const Email = await Supplier.findOne({ companyEmail });
    if (Email) {
      return res.status(409).json({ message: 'Supplier already exists!' })
    }

    const hashedPwd = await bcrypt.hash(password, 10)

    // Create a new user with status 'Not Approved'
    const newSupplier = new Supplier({
      firstName,
      lastName,
      companyName,
      companyEmail,
      companyType,
      categories,
      location,
      email,
      address,
      dollarExchangeRate,
      phoneNumber,
      "password": hashedPwd,
      status: "Not approved",
      roles: "Supplier"
    });

    // Save the user to the database
    await newSupplier.save();

    const emailTemplatePath = path.join(__dirname, '..', 'views', 'emailTemplate.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Replace placeholders with actual values
    const formattedTemplate = emailTemplate
      .replace('{{firstName}}', newSupplier.firstName)
      .replace('{{message}}', `Hi ${newSupplier.firstName}, an account has been created successfully. Kindly login using these credentials: `);

    // Send an email with the formatted template
    await sendMail({
      email: newSupplier.email,
      subject: "Account Created",
      html: formattedTemplate,
    });

    res.status(201).json({
      success: true,
      message: `Please check your personal email (${newSupplier.email}) for further instructions.`,
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occurred!' })
  }
});
const registerNewSupplier = asyncHandler(async (req, res) => {

  try {
    const { firstName, lastName, companyName, companyEmail, companyType, categories, country, email, address, dollarExchangeRate, phoneNumber, password } = req.body;

    if (!firstName || !lastName || !country || !email || !companyName || !companyEmail || !categories || !companyType || !dollarExchangeRate || !address || !phoneNumber || !password) {
      return res.status(400).json({ message: 'All fields are required!' })
    }

    // Check if the email already exists
    const Email = await Supplier.findOne({ companyEmail });
    if (Email) {
      return res.status(409).json({ message: 'Supplier already exists!' })
    }

    const hashedPwd = await bcrypt.hash(password, 10)

    // Create a new user with status 'Not Approved'
    const newSupplier = new Supplier({
      firstName,
      lastName,
      companyName,
      companyEmail,
      companyType,
      categories,
      country,
      email,
      address,
      dollarExchangeRate,
      phoneNumber,
      "password": hashedPwd,
      status: "Not approved",
      roles: "Supplier"
    });

    // Save the user to the database
    await newSupplier.save();

    const emailTemplatePath = path.join(__dirname, '..', 'views', 'emailTemplate.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Replace placeholders with actual values
    const formattedTemplate = emailTemplate
      .replace('{{firstName}}', newSupplier.firstName)
      .replace('{{message}}', `Hi ${newSupplier.firstName}, we have received your application to become a member of our platform. Your account is pending approval from our team. Kindly be patient as we process your application. You will be notified upon approval.`);

    // Send an email with the formatted template
    await sendMail({
      email: newSupplier.email,
      subject: "Application Received",
      html: formattedTemplate,
    });

    res.status(201).json({
      success: true,
      message: `Please check your personal email (${newSupplier.email}) for further instructions.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occurred!' })
  }
});

const adminCreateSupplier = asyncHandler(async (req, res) => {

  try {
    const { firstName, lastName, companyName, companyEmail, categories, country, email, address, dollarExchangeRate, phoneNumber, password } = req.body;

    if (!firstName || !lastName || !country || !email || !companyName || !companyEmail || !categories || !dollarExchangeRate || !address || !phoneNumber || !password) {
      return res.status(400).json({ message: 'All fields are required!' })
    }

    // Check if the email already exists
    const Email = await Supplier.findOne({ companyEmail });
    if (Email) {
      return res.status(409).json({ message: 'Supplier already exists!' })
    }

    const hashedPwd = await bcrypt.hash(password, 10)

    // Create a new user with status 'Not Approved'
    const newSupplier = new Supplier({
      firstName,
      lastName,
      companyName,
      companyEmail,
      categories,
      country,
      email,
      address,
      dollarExchangeRate,
      phoneNumber,
      "password": hashedPwd,
      status: "Approved",
      roles: "Supplier"
    });

    // Save the user to the database
    await newSupplier.save();

    const emailTemplatePath = path.join(__dirname, '..', 'views', 'accountSetup.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Replace placeholders with actual values
    const formattedTemplate = emailTemplate
      .replace('{{firstName}}', newSupplier.firstName)
      .replace('{{password}}', password)
      .replace('{{email}}', newSupplier.email)

    // Send an email with the formatted template
    await sendMail({
      email: newSupplier.email,
      subject: "Application Received",
      html: formattedTemplate,
    });

    res.status(201).json({
      success: true,
      message: `Please check your personal email (${newSupplier.email}) for further instructions.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occurred!' })
  }
});

const loginSupplier = asyncHandler(async (req, res) => {

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
    const supplier = await Supplier.findOne({ email }).select("+password");
    if (!supplier) {
      return res.status(400).send({
        success: false,
        message: "Supplier with that email is not registered",
      });
    }

    // Check if the reseller is approved
    if (supplier.status !== "Approved") {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending approval. Please contact Admin!',
      });
    }

    // Validate the password
    const isMatch = await bcrypt.compare(password, supplier.password);
    if (!isMatch) {
      return res.status(400).send({
        success: false,
        message: "Invalid credentials",
      });
    }

    res.cookie("jwt", createToken(email, supplier.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });

    // Remove sensitive information like password before sending response
    const supplierData = {
      id: supplier.id,
      email: supplier.email,
      firstName: supplier.firstName,
      lastName: supplier.lastName,
      phoneNumber: supplier.phoneNumber,
      address: supplier.address,
      status: supplier.status,
      companyName: supplier.companyName,
      companyEmail: supplier.companyEmail,
      categories: supplier.categories,
      dollarExchangeRate: supplier.dollarExchangeRate,
      // Add other fields you may need (but not password)
    };

    // Send success response without exposing the token in JSON
    res.status(200).send({
      success: true,
      message: "Login successful",
      supplier: supplierData, // Send sanitized reseller data
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

const getSupplierInfo = async (req, res, next) => {
  try {

    const supplier = await Supplier.findById(req.supplierId);
    if (!supplier) {
      return res.status(404).send("Supplier with the given id not found");
    }
    return res.status(200).json({
      id: supplier.id,
      email: supplier.email,
      firstName: supplier.firstName,
      lastName: supplier.lastName,
      phoneNumber: supplier.phoneNumber,
      address: supplier.address,
      status: supplier.status,
      companyName: supplier.companyName,
      companyEmail: supplier.companyEmail,
      categories: supplier.categories,
      dollarExchangeRate: supplier.dollarExchangeRate,
    })
  } catch (error) {
    console.log({ error })
    return res.status(500).send("Internal Server Error")
  }
}

const getSupplierById = asyncHandler(async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found!' });
    }
    res.status(201).json({
      success: true,
      supplier,
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
})


// const updateSupplier = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   updatedSupplierData = req.body;

//   try {

//     // Update the reseller in the database
//     const updatedSupplier = await Supplier.findByIdAndUpdate(id, updatedSupplierData, { new: true });

//     if (!updatedSupplier) {
//       return res.status(404).json({ error: 'Supplier not found' });
//     }

//     // Send a success response
//     res.status(200).json({ message: 'Supplier updated successfully', reseller: updatedSupplier });
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// })

const updateSupplier = asyncHandler(async (req, res) => {
    
  try {
    const { supplierId } = req;
    updatedSupplierData = req.body;

      const updatedSupplier = await Supplier.findByIdAndUpdate(supplierId, updatedSupplierData, { new: true, runValidators: false });

      if (!updatedSupplier) {
          return res.status(404).json({ error: 'Supplier not found' });
      }

      // Send a success response
      res.status(200).json({ message: 'Supplier updated successfully', supplier: updatedSupplier });
  } catch (error) {
      console.error('Error updating supplier:', error);
      // Send an error response
      res.status(500).json({ error: 'Internal server error' });
  }

  // res.json({ message: `${updatedReseller.firstName} updated` })
})

const deleteSupplier = asyncHandler(async (req, res) => {

  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return res.status(404).json({ message: 'Supplier is not found' });
  }

  await supplier.deleteOne()

  res.status(201).json({
    success: true,
    message: "Supplier Deleted successfully!",
  });
})

const updateExchangeRate = asyncHandler(async (req, res) => {
  const { dollarExchangeRate } = req.body;
  const { id } = req.params;

  try {
    // Find the admin by ID
    const supplier = await Supplier.findById(id);

    // Check if admin exists
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Update user's password with the new hashed password
    supplier.dollarExchangeRate = dollarExchangeRate;
    await supplier.save();

    // Password changed successfully
    return res.status(200).json({ message: 'Exchange Rate updated successfully', dollarExchangeRate: dollarExchangeRate });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

const getApprovedSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({ status: "Approved" }).lean();
  if (!suppliers?.length) {
    return res.status(400).json({ message: 'No suppliers with status "Approved" found' });
  }
  res.json(suppliers);
});
const getNotApprovedSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({ status: "Not approved" }).lean();
  if (!suppliers?.length) {
    return res.status(400).json({ message: 'No suppliers with status "Not approved" found' });
  }
  res.json(suppliers);
});

const approveSupplier = asyncHandler(async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    supplier.status = "Approved";
    await supplier.save();

    const emailTemplatePath = path.join(__dirname, '..', 'views', 'emailTemplate.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Replace placeholders with actual values
    const formattedTemplate = emailTemplate
      .replace('{{firstName}}', supplier.firstName)
      .replace('{{message}}', `Hi ${supplier.firstName}, we are pleased to inform you that your account has been approved! You can now log in to your account https://resellerprint.com/supplier-login and start your journey with us.`);

    // Send an email with the formatted template
    await sendMail({
      email: supplier.email,
      subject: "Account Approval Notification",
      html: formattedTemplate,
    });

    res.status(200).json({
      success: true,
      message: "Supplier approved successfully!",
      supplier: supplier,
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
})

const holdSupplier = asyncHandler(async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    supplier.status = "On Hold";
    await supplier.save();

    const emailTemplatePath = path.join(__dirname, '..', 'views', 'emailTemplate.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Replace placeholders with actual values
    const formattedTemplate = emailTemplate
      .replace('{{firstName}}', supplier.firstName)
      .replace('{{message}}', `Hi ${supplier.firstName}, we regret to inform you that your account has been put on hold! Kindly contact our team for further clarification.`);

    // Send an email with the formatted template
    await sendMail({
      email: supplier.email,
      subject: "Account Suspension Notification",
      html: formattedTemplate,
    });

    res.status(200).json({
      success: true,
      message: "Supplier suspended successfully!",
      supplier: supplier,
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
})

const rejectSupplier = asyncHandler(async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    supplier.status = "Rejected";
    await supplier.save();

    const emailTemplatePath = path.join(__dirname, '..', 'views', 'emailTemplate.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Replace placeholders with actual values
    const formattedTemplate = emailTemplate
      .replace('{{firstName}}', supplier.firstName)
      .replace('{{message}}', `Hi ${supplier.firstName}, we regret to inform you that your application has been rejected! Kindly reach out to our team for further details.`);

    // Send an email with the formatted template
    await sendMail({
      email: supplier.email,
      subject: "Application Rejected",
      html: formattedTemplate,
    });

    res.status(200).json({
      success: true,
      message: "Supplier rejection successful!",
      supplier,
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
})

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  console.log(oldPassword, newPassword, confirmPassword);
  const { id } = req.params;

  try {
    // Find the admin by ID
    const supplier = await Supplier.findById(id).select("+password");

    // Check if admin exists
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // / Compare old password with the hashed password in the database
    const isMatch = await bcrypt.compare(oldPassword, supplier.password);

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

    // Update password without running validations for other fields
    await Supplier.findByIdAndUpdate(id, { password: hashedPassword }, { new: true, runValidators: false });

    // Password changed successfully
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({error: error.message});
    console.log({error});
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const oldSupplier = await Supplier.findOne({ email });
    if (!oldSupplier) {
      return res.status(400).json({ message: 'Supplier not found' });
    }
    //token
    const token = jwt.sign({ email: oldSupplier.email, id: oldSupplier._id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "20m",
    });
    const link = `https://resprint.api.resellersprint.com/suppliers/reset-password/${oldSupplier._id}/${token}`;
    // const link = `http://localhost:3500/suppliers/reset-password/${oldSupplier._id}/${token}`;
    const emailTemplatePath = path.join(__dirname, '..', 'views', 'forgotPassword.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Replace placeholders with actual values
    const formattedTemplate = emailTemplate
      .replace('{{firstName}}', oldSupplier.firstName)
      .replace('{{link}}', link)

    // Send an email with the formatted template
    await sendMail({
      email: oldSupplier.email,
      subject: "Password Reset",
      html: formattedTemplate,
    });
    return res.status(200).json({ message: 'Check your email' })
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
})

const resetPassword = asyncHandler(async (req, res) => {
  const { id, token } = req.params;
  const oldSupplier = await Supplier.findOne({ _id: id })
  if (!oldSupplier) {
    return res.status(400).json({ message: "Supplier does not exist" });
  }
  try {
    const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.render('supplierForgot', { email: verify.email, status: "not verified" })
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
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      { password: encryptedPassword },
      { new: true } // To return the updated document
    );

    if (!updatedSupplier) {
      return res.status(400).json({ message: "Supplier does not exist" });
    }

    // Password successfully updated, render a response
    res.render("supplierForgot", { email: verify.email, status: "verified" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }

})

const logOutSupplier = asyncHandler(async (req, res) => {
  try {
    res.cookie("jwt", "", {maxAge:1, secure:true, sameSite:"None"});

    return res.status(200).send("Logout successful!");
} catch (error) {
    console.log({ error })
    return res.status(500).send("Internal Server Error")
}
});

module.exports = {
  getAllSuppliers,
  createNewSupplier,
  registerNewSupplier,
  updateSupplier,
  loginSupplier,
  getSupplierById,
  deleteSupplier,
  approveSupplier,
  rejectSupplier,
  forgotPassword,
  resetPassword,
  resetPasswordComplete,
  getNotApprovedSuppliers,
  getApprovedSuppliers,
  holdSupplier,
  updateExchangeRate,
  adminCreateSupplier,
  changePassword,
  getSupplierInfo,
  logOutSupplier
}