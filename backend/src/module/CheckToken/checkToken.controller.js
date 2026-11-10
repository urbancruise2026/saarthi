// controllers/authController.js
import jwt from "jsonwebtoken";
import { findUserById, updateUserRefreshToken } from "./checkToken.model.js";
import { clientInfo, logLoginEvent, touchSession } from "../user/staff.repository.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const checkAuth = async (req, res) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    console.log("Check Auth - Cookies:", {
      accessToken: !!accessToken,
      refreshToken: !!refreshToken,
    });

    if (!accessToken && !refreshToken) {
      throw new ApiError(401, "No tokens found");
    }

    if (accessToken) {
      try {
        const decoded = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET,
        );

        const user = await findUserById(decoded.id);

        if (!user) {
          return res.status(401).json({
            success: false,
            message: "User not found",
            isAuthenticated: false,
          });
        }

        const { password, ...userWithoutPassword } = user;

        return res.status(200).json({
          success: true,
          isAuthenticated: true,
          data: {
            id: userWithoutPassword.id,
            uuid: userWithoutPassword.uuid,
            name: userWithoutPassword.name,
            email: userWithoutPassword.email,
            role_id: userWithoutPassword.role_id,
            role_name: userWithoutPassword.role_name,
            department_id: userWithoutPassword.department_id,
            manager_id: userWithoutPassword.manager_id,
            is_active: userWithoutPassword.is_active,
          },
        });
      } catch (accessError) {
        console.log("Access token expired, trying refresh token");
      }
    }

    if (refreshToken) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
        );

        const user = await findUserById(decoded.id);

        if (!user) {
          return res.status(401).json({
            success: false,
            message: "User not found",
            isAuthenticated: false,
          });
        }

        if (user.is_active === 0) {
          return res.status(401).json({
            success: false,
            message: "User account is deactivated",
            isAuthenticated: false,
          });
        }

        const newAccessToken = jwt.sign(
          {
            id: user.id,
            uuid: user.uuid,
            role_id: user.role_id,
            email: user.email,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" },
        );

        // Record that this session was used (no effect for tokens issued before the migration
        // that are not in auth_sessions).
        try {
          if (await touchSession(refreshToken)) {
            await logLoginEvent({ staffId: user.id, eventType: "token_refresh", ...clientInfo(req) });
          }
        } catch (sessionError) {
          console.error("Session update failed:", sessionError.message);
        }

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 15 * 60 * 1000,
        });

        // Password ko response se hatao
        const { password, ...userWithoutPassword } = user;

        return res.status(200).json({
          success: true,
          isAuthenticated: true,
          data: {
            id: userWithoutPassword.id,
            uuid: userWithoutPassword.uuid,
            name: userWithoutPassword.name,
            email: userWithoutPassword.email,
            role_id: userWithoutPassword.role_id,
            role_name: userWithoutPassword.role_name,
            department_id: userWithoutPassword.department_id,
            manager_id: userWithoutPassword.manager_id,
            is_active: userWithoutPassword.is_active,
          },
          message: "Token refreshed successfully",
        });
      } catch (refreshError) {
       
         console.log("Refresh token expired:", refreshError.message);

      
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res.status(401).json({
          success: false,
          message: "Refresh token expired",
          isAuthenticated: false,
        });
      }
    }

 
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      isAuthenticated: false,
    });
  } catch (error) {
    console.error("Check auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      isAuthenticated: false,
    });
  }
};

export const userLogout = asyncHandler(async (req, res) => {
  await updateUserRefreshToken(req.user.id, null, req.cookies?.refreshToken || null);
  await logLoginEvent({ staffId: req.user.id, eventType: "logout", ...clientInfo(req) });
  console.log(req.user.id);
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, [], "User Logged Out Successfully"));
});
