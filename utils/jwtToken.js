// create token and saving that in cookies
const sendToken = (reseller, statusCode, res) => {
  const token = reseller.getJwtToken();

  // Options for cookies
  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "none",
    secure: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    reseller,
    token,
  });
};

module.exports = sendToken;
