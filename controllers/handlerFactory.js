const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const cloudinary = require("../utils/cloudinary");
const Email = require("../utils/email");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const model = await Model.findById(req.params.id);

    if (!model) {
      return next(new AppError("No Document found with that ID", 404));
    }

    // Check if model.file is an array
    if (model.files && Array.isArray(model.files)) {
      // Iterate over each file and delete it
      for (const file of model.files) {
        const publicId = file.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
    } else if (model.file) {
      // Handle single file
      const publicId = model.file.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    const doc = await Model.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const model = await Model.findById(req.params.id);
    let publicId;
    if (!model) {
      return next(new AppError("No Document found with that ID", 404));
    }
    // console.log(req.file);
    // console.log(model);
    if (req.file) {
      req.body.file = req.cloudinaryResult.secure_url;

      if (model.file) {
        publicId = model.file.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
        req.body.file = req.cloudinaryResult.secure_url;
      }
    }
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (req.file) {
      // Single file upload
      req.body.file = req.cloudinaryResult.secure_url;
    } else if (req.files && req.files.length > 0) {
      // Multiple file upload
      req.body.files = req.cloudinaryResults.map((result) => result.secure_url);
    }

    const newDocument = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        newDocument,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query.populate(popOptions);
    const doc = await query;
    // Course.findOne({ _id: req.params.id })

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //To allow for nested GET Materials on course
    let filter = {};
    let docs;
    if (req.params.courseId) filter = { course: req.params.courseId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    let documents = await features.query;
    let totalPages;
    if (req.query.limit) {
      docs = await Model.find();
      totalPages = Math.ceil(docs.length / req.query.limit);
    } else {
      totalPages = 0;
      docs = 0;
    }
    if (Model == 'Reservations') {
      documents = documents.map((meeting) => {
        meeting.updateStatus();
        return meeting;
      });
    }
    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      totalDocs: docs.length,
      totalPages,
      results: documents.length,
      data: {
        documents,
      },
    });
  });

exports.changeStatus = (Model) =>
  catchAsync(async (req, res, next) => {
    let url;
    const doc = await Model.findById(req.params.id);
    if (doc.active === true) {
      await Model.findByIdAndUpdate(req.params.id, { active: false });
    } else {
      await Model.findByIdAndUpdate(req.params.id, { active: true });
      if (doc.firstName) await new Email(doc, url).sendVerified();
    }

    res.status(201).json({
      status: "success",
    });
  });
