// create token and saving that in cookies
const sendSupplierToken = (supplier, statusCode, res) => {
  const token = supplier.getJwtToken();

  // Options for cookies
  const options = {
    expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "none",
    secure: true,
  };

  res.status(statusCode).cookie("supplier_token", token, options).json({
    success: true,
    supplier,
    token,
  });
};

module.exports = sendSupplierToken;
