const axios = require("axios");
const userService = require("../services/user.service");
const jwt = require("jsonwebtoken");

exports.airtableLogin = async (req, res) => {

  const { code, codeVerifier } = req.body;

  console.log("LOGIN STEP 1: Received Code & Verifier");

  try {
    const clientId = process.env.AIRTABLE_CLIENT_ID;
    const clientSecret = process.env.AIRTABLE_CLIENT_SECRET;
    const redirectUri = process.env.AIRTABLE_REDIRECT_URI;


    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  
    const payload = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier 
    });

    console.log("LOGIN STEP 2: Sending to Airtable...");


    const tokenResponse = await axios.post(
      "https://airtable.com/oauth2/v1/token",
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${basicAuth}`
        }
      }
    );

    console.log("LOGIN STEP 3: Token Received!");
    
    const { access_token, refresh_token } = tokenResponse.data;


    const userRes = await axios.get("https://api.airtable.com/v0/meta/whoami", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile = userRes.data;

  
    const user = await userService.loginOrSignup(
      {
        id: profile.id,
        email: profile.email,
        name: profile.name,
      },
      { accessToken: access_token, refreshToken: refresh_token }
    );

    const jwtToken = jwt.sign(
      { userId: user._id, airtableId: profile.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token: jwtToken,
      user: {
        name: user.profile.name,
        email: user.profile.email,
      },
    });

  } catch (err) {
    console.error("OAuth Error:", err.response?.data || err.message);
    res.status(500).json({
      message: "Authentication failed",
      error: err.response?.data || err.message
    });
  }
};