import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import responseHandler from "../handlers/response.handler.js";

//bộ test
// {
//   "user_name": "newName",
//   "user_birth": "2000-05-15",
//   "user_gender": "newGender",
//   "user_email": "newEmail",
//   "user_phone": "0123456789",
//   "user_address": "newAddress"
// }


//api để test, không sử dụng trong thực tế
export const getUserByEmail = async (req, res, next) => {
  const { user_email } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ user_email });

    // Check if user exists
    if (!user) {
      return responseHandler.notFound(res, "User does not exist");
    }

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
//api để test, không sử dụng trong thực tế
export const deleteUserByEmail = async (req, res, next) => {
  const { user_email } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ user_email });

    // Check if user exists
    if (!user) {
      return responseHandler.notFound(res, "User does not exist");
    }

    // Delete the user
    await User.deleteOne({ user_email });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const edit = async (req, res, next) => {
  const { user_name, user_birth, user_gender, user_phone, user_address } =
    req.body;

  try {
    // Get the user's id from the cookie
    const token = req.cookies.access_token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.id;

    // Find the user in the database and update their details
    const user = await User.findByIdAndUpdate(userId, req.body, { new: true });

    if (!user) {
      return responseHandler.notFound(res, "User does found");
    }

    return res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  try {
    // Get the user's id from the cookie
    const token = req.cookies.access_token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.id;

    // Find the user in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = bcryptjs.compareSync(oldPassword, user.user_password);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.user_password = bcryptjs.hashSync(newPassword, 10);

    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const getInforUser = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    console.log("In ra từ middleware", user_id)

    // Kiểm tra xem user_id có tồn tại không
    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id in request body" });
    }

    // Tìm kiếm người dùng trong cơ sở dữ liệu
    const user = await User.findById(user_id);

    // Kiểm tra xem người dùng có tồn tại không
    if (!user) {
      return responseHandler.notFound(res, "User does found");
    }

    // Trả về thông tin của người dùng
    return res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error in getInforUser:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};