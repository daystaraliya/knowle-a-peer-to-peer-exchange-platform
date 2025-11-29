import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import slugify from 'slugify';

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        avatar: {
            type: String, // Cloudinary URL
        },
        bio: {
            type: String,
            default: '',
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        topicsToTeach: [{
            type: Schema.Types.ObjectId,
            ref: 'Topic'
        }],
        topicsToLearn: [{
            type: Schema.Types.ObjectId,
            ref: 'Topic'
        }],
        completedSkillNodes: [{
            type: Schema.Types.ObjectId,
            ref: 'SkillNode'
        }],
        achievements: [{
            type: Schema.Types.ObjectId,
            ref: 'Achievement'
        }],
        points: {
            type: Number,
            default: 0,
            index: true // Index for leaderboard performance
        },
        averageRating: {
            type: Number,
            default: 0,
            index: true // Index for leaderboard performance
        },
        numberOfRatings: {
            type: Number,
            default: 0,
        },
        exchangesAsTeacherCount: {
            type: Number,
            default: 0,
        },
        profileVisibility: {
            bio: { type: Boolean, default: true },
            skills: { type: Boolean, default: true },
            achievements: { type: Boolean, default: true },
        },
        reviewSummary: {
            positive: {
                type: [String],
                default: [],
            },
            negative: { // Areas for growth
                type: [String],
                default: [],
            },
            lastUpdated: {
                type: Date,
            }
        },
        role: {
            type: String,
            enum: ['user', 'mentor'],
            default: 'user'
        },
        premium: {
            stripeCustomerId: String,
            subscriptionId: String,
            subscriptionStatus: {
                type: String,
                default: 'inactive' // e.g., active, inactive, cancelled
            }
        },
        preferredLanguage: {
            type: String,
            default: 'en', // ISO 639-1 code
        },
        languagesSpoken: {
            type: [String],
            default: [],
        },
        onboardingCompleted: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String
        },
        resetPasswordToken: {
            type: String,
        },
        resetPasswordExpires: {
            type: Date,
        }
    },
    { timestamps: true }
);

// Middleware for password hashing and slug generation
userSchema.pre("save", async function (next) {
    // Generate slug from fullName if it's new or modified
    if (this.isModified("fullName") || this.isNew) {
        const generateSlug = async (name, attempt = 0) => {
            const baseSlug = slugify(name, { lower: true, strict: true });
            const slug = attempt > 0 ? `${baseSlug}-${attempt}` : baseSlug;
            const existingUser = await this.constructor.findOne({ slug: slug });
            if (existingUser && existingUser._id.toString() !== this._id.toString()) {
                return generateSlug(name, attempt + 1);
            }
            return slug;
        };
        this.slug = await generateSlug(this.fullName);
    }

    // Hash password if it's modified
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    
    next();
});

// Method to check password validity
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate access token
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        { _id: this._id, email: this.email, username: this.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

export const User = mongoose.model('User', userSchema);