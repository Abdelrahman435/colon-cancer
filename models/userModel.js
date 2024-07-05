const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please tell us your first name!"],
      maxlength: [
        15,
        "A first name must have less or equal than 15 characters",
      ],
      minlength: [3, "A first name must have more or equal than 3 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Please tell us your last name!"],
      maxlength: [15, "A last name must have less or equal than 15 characters"],
      minlength: [3, "A last name must have more or equal than 3 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    description: {
      type: String,
      maxlength: [
        300,
        "A Description must have less or equal than 300 characters",
      ],
      minlength: [
        20,
        "A Description must have more or equal than 20 characters",
      ],
      trim: true,
    },
    file: {
      type: String,
      default: "https://coloncancer-37854a95459d.herokuapp.com/user_1.png",
    },
    experience: {
      type: Number,
    },
    hospital: {
      type: String,
    },
    address: {
      type: String,
      required: [true, "Please provide your city"],
    },
    dateOfBirth: {
      type: String,
      required: [true, "Please provide your date of birth"],
    },
    // rating: {
    //   type: Number,
    //   default: 4.0,
    //   min: [1, "Rating must be above 1.0"],
    //   max: [5, "Rating must be below 5.0"],
    // },
    // reviews: {
    //   type: Number,
    //   default: 200,
    // },
    availableAppointments: [
      {
        day: {
          type: String,
          required: true,
        },
        from: {
          type: String,
          required: true,
        },
        to: {
          type: String,
          required: true,
        },
      },
    ],
    role: {
      type: String,
      enum: {
        values: ["user", "Doctor"],
        message: "Role is either: user, Doctor",
      },
      default: "user",
    },
    phone: {
      type: String,
      validate: {
        validator: function (value) {
          return value.length === 11 && validator.isNumeric(value);
        },
        message: "Phone number must be exactly 11 digits",
      },
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    rememberMe: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // Only run this function if password has changed
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  //delete password Confirmation from database
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now();
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
