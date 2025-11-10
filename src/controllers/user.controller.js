import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
}

const generateAccessAndRefreshTokens = async(user) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    return { accessToken, refreshToken };
}

const registerUser = asyncHandler(async (req, res) => {
    const {fullname, email, username, password} = req.body;

    if([fullname, email, username, password].some((field) => !field || field.trim() === '')) {
        throw new ApiError(400, 'All fields are required!');
    }

    const existingUser = await User.findOne({$or: [{email}, {username}]});
    if(existingUser) {
        throw new ApiError(409, 'User with given email or username already exists!');
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage && req.files?.coverImage.length ? req.files?.coverImage[0]?.path : '';
    if(!avatarLocalPath) {
        throw new ApiError(400, 'Avatar is required!');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(400, 'Unable to upload on Cloudinary!');
    }

    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ''
    });

    const createdUser = await User.findById(user._id).select('-password -refreshToken');

    if(!createdUser) {
        throw new ApiError(500, 'User registration failed!');
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, 'User registered successfully!')
    );
})

const loginUser = asyncHandler(async (req, res) => {
    // Login logic here
    const {username, email, password} = req.body;

    if(!username && !email) {
        throw new ApiError(400, 'Username or email is required to login!');
    }
    if(!password) {
        throw new ApiError(400, 'Password is required to login!');
    }
    const user = await User.findOne({
        $or: [{username: username?.toLowerCase()}, {email: email?.toLowerCase()}]
    });
    if(!user) {
        throw new ApiError(404, 'User not found!');
    }

    const isPasswordValidated = await user.isPasswordCorrect(password);
    if(!isPasswordValidated) {
        throw new ApiError(401, 'Invalid credentials!');
    }

    // Generate Tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

    return res.status(201)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            'User logged in successfully!')
    );
})

const logoutUser = asyncHandler(async (req, res) => {
    const updateUser = await User.findByIdAndUpdate(req.user._id, { refreshToken: '' }, { new: true });
    if(!updateUser) {
        throw new ApiError(500, 'Unable to logout user!');
    }

    return res.status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User logged out successfully!'));
});

export { registerUser, loginUser, logoutUser }