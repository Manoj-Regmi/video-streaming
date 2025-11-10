import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';

const jwtVerification = asyncHandler(async(req, _, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace('Bearer ', '');
        if(!accessToken) {
            return res.status(401).json(new ApiError(401, 'Access token is missing in cookies!'));
        }

        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        if(!decodedToken?._id) {
            return res.status(401).json(new ApiError(401, 'Invalid access token!'));
        }

        const user = await User.findById(decodedToken._id).select('-password -refreshToken');
        if(!user) {
            return res.status(404).json(new ApiError(404, 'User not found!'));
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, 'Unauthorized access! Invalid or expired token: ' + error.message);
    }
});

export default jwtVerification;