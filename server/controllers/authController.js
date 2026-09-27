const User = require('../models/User');
const { generateTokens, REFRESH_SECRET } = require('../middleware/authMiddleware');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { sendEmail, sendVolunteerWelcomeEmail, sendOrgWelcomePendingEmail, sendAdminNewOrgVerificationEmail } = require('../utils/emailService');
const { uploadToCloudinary } = require('../config/cloudinary');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');

// @desc    Register a new user or organization
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      username,
      bio,
      location,
      skills,
      gender,
      institution,
      countryCode,
      mobileNumber,
      state,
      country,
      pincode,
    } = req.body;

    let orgDetails = req.body.orgDetails;
    if (typeof orgDetails === 'string') {
      try {
        orgDetails = JSON.parse(orgDetails);
      } catch (err) {
        orgDetails = {};
      }
    }

    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return sendError(res, 'An account with this email already exists.', 400);
    }

    if (mobileNumber && mobileNumber.trim()) {
      const existingMobile = await User.findOne({ where: { mobileNumber: mobileNumber.trim() } });
      if (existingMobile) {
        return sendError(res, 'An account with this mobile number already exists.', 400);
      }
    }

    const generatedUsername = username || email.split('@')[0] + Math.floor(100 + Math.random() * 900);

    let verificationDocument;
    if (role === 'organization' && req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'connectserve/certificates', {
          resource_type: 'auto',
          mimetype: req.file.mimetype,
        });
        verificationDocument = {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          format: uploadResult.format,
          uploadedAt: new Date(),
        };
      } catch (uploadErr) {
        console.error('[Register] Failed to upload verification document:', uploadErr.message);
        return sendError(res, 'Failed to upload verification document. Please try again.', 400);
      }
    }

    // Generate a 6-digit email verification code (prevents bot/fake signups)
    const verifyCode = crypto.randomInt(100000, 999999).toString();
    const verifyCodeHash = crypto.createHash('sha256').update(verifyCode).digest('hex');

    const user = await User.create({
      name,
      username: generatedUsername,
      email: email.toLowerCase(),
      password,
      role: role || 'user',
      bio: bio || '',
      gender: gender || '',
      institution: institution || '',
      countryCode: countryCode || '+91',
      mobileNumber: mobileNumber ? mobileNumber.trim() : '',
      location: location || '',
      state: state || '',
      country: country || '',
      pincode: pincode || '',
      skills: skills || [],
      orgDetails: role === 'organization' ? {
        mission: orgDetails?.mission || '',
        registrationNumber: orgDetails?.registrationNumber || '',
        isVerified: false,
        category: orgDetails?.category || 'General Community',
        ...(verificationDocument && { verificationDocument }),
      } : {},
      isEmailVerified: false,
      emailVerifyCode: verifyCodeHash,
      emailVerifyExpire: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    const verifyEmailSubject = 'Verify Your Email - ConnectServe';
    const verifyEmailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #059669;">Verify Your Email Address</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Thanks for signing up for ConnectServe! Please confirm it's really you by entering the 6-digit code below:</p>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #166534;">${verifyCode}</span>
        </div>
        <p>This code will expire in <strong>15 minutes</strong>. Enter it on the verification screen to activate your account.</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 25px;">If you did not create this account, you can safely ignore this email.</p>
      </div>
    `;

    try {
      const emailResult = await sendEmail(user.email, verifyEmailSubject, verifyEmailBody);
      if (!emailResult.success && !emailResult.simulated) {
        console.error('[Register] Failed to send verification email:', emailResult.error);
      }
    } catch (err) {
      console.error('[Register] Failed to send verification email:', err.message);
    }

    return sendSuccess(
      res,
      `A 6-digit verification code has been sent to ${user.email}. Please verify to activate your account.`,
      { email: user.email, requiresVerification: true },
      null,
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email with 6-digit code and activate account
// @route   POST /api/auth/verify-registration
// @access  Public
const verifyRegistration = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return sendError(res, 'Please provide email and the 6-digit code.', 400);
    }

    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return sendError(res, 'No account found with that email address.', 404);
    }

    if (user.isEmailVerified) {
      return sendError(res, 'This account is already verified. Please log in.', 400);
    }

    const codeHash = crypto.createHash('sha256').update(code.trim()).digest('hex');
    const isExpired = !user.emailVerifyExpire || new Date(user.emailVerifyExpire) < new Date();

    if (!user.emailVerifyCode || user.emailVerifyCode !== codeHash || isExpired) {
      return sendError(res, 'Invalid or expired verification code.', 400);
    }

    user.isEmailVerified = true;
    user.emailVerifyCode = null;
    user.emailVerifyExpire = null;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    const userObj = user.toJSON();
    delete userObj.password;

    try {
      if (user.role === 'organization') {
        await sendOrgWelcomePendingEmail(user);
        await sendAdminNewOrgVerificationEmail(user);
      } else {
        await sendVolunteerWelcomeEmail(user);
      }
    } catch (err) {
      console.error('[Email Service Error] Failed to send welcome email:', err.message);
    }

    return sendSuccess(res, 'Email verified successfully. Welcome to ConnectServe!', {
      user: userObj,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend the 6-digit email verification code
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerificationCode = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 'Please provide an email address.', 400);
    }

    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return sendError(res, 'No account found with that email address.', 404);
    }

    if (user.isEmailVerified) {
      return sendError(res, 'This account is already verified. Please log in.', 400);
    }

    const verifyCode = crypto.randomInt(100000, 999999).toString();
    const verifyCodeHash = crypto.createHash('sha256').update(verifyCode).digest('hex');

    const emailSubject = 'Your New Verification Code - ConnectServe';
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #059669;">Verify Your Email Address</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Here is your new 6-digit verification code:</p>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #166534;">${verifyCode}</span>
        </div>
        <p>This code will expire in <strong>15 minutes</strong>.</p>
      </div>
    `;

    const emailResult = await sendEmail(user.email, emailSubject, emailBody);
    if (!emailResult.success && !emailResult.simulated) {
      return sendError(res, `Failed to send email: ${emailResult.error || 'Brevo API delivery error'}`, 500);
    }

    user.emailVerifyCode = verifyCodeHash;
    user.emailVerifyExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    return sendSuccess(res, `A new verification code has been sent to ${user.email}.`);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get tokens
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password, identifier } = req.body;
    const loginInput = (identifier || email || '').trim();

    if (!loginInput || !password) {
      return sendError(res, 'Please provide both email/mobile number and password.', 400);
    }

    let user;
    if (loginInput.includes('@')) {
      user = await User.findOne({ where: { email: loginInput.toLowerCase() } });
    } else {
      const cleanNumber = loginInput.replace(/[\s-]/g, '');
      user = await User.findOne({
        where: {
          [Op.or]: [
            { mobileNumber: loginInput },
            { mobileNumber: cleanNumber },
            { username: loginInput.toLowerCase() },
          ],
        },
      });
    }

    if (!user) {
      return sendError(res, 'Invalid credentials. Please check your email/mobile number and password.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials. Please check your email/mobile number and password.', 401);
    }

    if (user.isBanned) {
      return sendError(res, 'Your account has been suspended. Please contact support.', 403);
    }

    if (!user.isEmailVerified) {
      return sendError(res, 'Please verify your email before logging in. Check your inbox for the 6-digit code.', 403, { requiresVerification: true, email: user.email });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    const userObj = user.toJSON();
    delete userObj.password;

    return sendSuccess(res, 'Logged in successfully.', {
      user: userObj,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    let user = await User.findByPk(userId);
    if (!user && req.user.mongoId) {
      user = await User.findOne({ where: { mongoId: req.user.mongoId } });
    }
    if (!user) {
      return sendError(res, 'User not found.', 404);
    }
    const userObj = user.toJSON();
    delete userObj.password;
    return sendSuccess(res, 'Current user profile fetched.', { user: userObj });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return sendError(res, 'Refresh token required.', 400);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, REFRESH_SECRET);
    } catch (err) {
      return sendError(res, 'Invalid or expired refresh token. Please login again.', 401);
    }

    let user = null;
    if (typeof decoded.id === 'number' || !isNaN(Number(decoded.id))) {
      user = await User.findByPk(decoded.id);
    }
    if (!user) {
      user = await User.findOne({ where: { mongoId: String(decoded.id) } });
    }

    if (!user || user.isBanned || !user.isActive) {
      return sendError(res, 'User not authorized or inactive.', 403);
    }

    const tokens = generateTokens(user.id, user.role);

    return sendSuccess(res, 'Token refreshed successfully.', {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password does not match.', 400);
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 'Password updated successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Update email address
// @route   PUT /api/auth/email
// @access  Private
const updateEmail = async (req, res, next) => {
  try {
    const { newEmail, password } = req.body;
    if (!newEmail || !password) {
      return sendError(res, 'Please provide both new email and your current password.', 400);
    }

    const cleanEmail = newEmail.trim().toLowerCase();
    const existingUser = await User.findOne({
      where: {
        email: cleanEmail,
        id: { [Op.ne]: req.user.id },
      },
    });
    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', 400);
    }

    const user = await User.findByPk(req.user.id);
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Password confirmation failed. Incorrect password.', 400);
    }

    user.email = cleanEmail;
    await user.save();

    const userObj = user.toJSON();
    delete userObj.password;

    return sendSuccess(res, 'Email address updated successfully.', { user: userObj });
  } catch (error) {
    next(error);
  }
};

// @desc    Update mobile number
// @route   PUT /api/auth/mobile
// @access  Private
const updateMobile = async (req, res, next) => {
  try {
    const { newMobile, password } = req.body;
    if (!newMobile || !password) {
      return sendError(res, 'Please provide both new mobile number and your current password.', 400);
    }

    const cleanMobile = newMobile.trim();
    const existingUser = await User.findOne({
      where: {
        mobileNumber: cleanMobile,
        id: { [Op.ne]: req.user.id },
      },
    });
    if (existingUser) {
      return sendError(res, 'An account with this mobile number already exists.', 400);
    }

    const user = await User.findByPk(req.user.id);
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Password confirmation failed. Incorrect password.', 400);
    }

    user.mobileNumber = cleanMobile;
    await user.save();

    const userObj = user.toJSON();
    delete userObj.password;

    return sendSuccess(res, 'Mobile number updated successfully.', { user: userObj });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 'Please provide an email address.', 400);
    }

    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return sendError(res, 'No account found with that email address.', 404);
    }

    // Generate a 6-digit numeric code
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const resetTokenHash = crypto.createHash('sha256').update(resetCode).digest('hex');

    const emailSubject = 'Your Password Reset Code - ConnectServe';
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #059669;">Password Reset Request</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>You requested to reset your ConnectServe account password. Use the 6-digit code below to reset it:</p>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #166534;">${resetCode}</span>
        </div>
        <p>This code will expire in <strong>15 minutes</strong>. Enter it along with your new password on the reset screen to complete the process.</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 25px;">If you did not request this, you can safely ignore this email — your password will remain unchanged.</p>
      </div>
    `;

    const emailResult = await sendEmail(user.email, emailSubject, emailBody);

    if (!emailResult.success && !emailResult.simulated) {
      return sendError(res, `Failed to send email: ${emailResult.error || 'Brevo API delivery error'}`, 500);
    }

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    return sendSuccess(res, `A 6-digit reset code has been sent to ${user.email}. Enter it below to set a new password.`);
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password using Code
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    if (!email || !resetCode || !newPassword) {
      return sendError(res, 'Please provide email, reset code, and new password.', 400);
    }

    const resetTokenHash = crypto.createHash('sha256').update(resetCode.trim()).digest('hex');

    const user = await User.findOne({
      where: {
        email: email.trim().toLowerCase(),
        resetPasswordToken: resetTokenHash,
        resetPasswordExpire: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return sendError(res, 'Invalid or expired password reset code.', 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    return sendSuccess(res, 'Password reset successful! You can now log in with your new password.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyRegistration,
  resendVerificationCode,
  login,
  getMe,
  refreshToken,
  updatePassword,
  updateEmail,
  updateMobile,
  forgotPassword,
  resetPassword,
};
