import mongoose from "mongoose";
import moment from "moment";
import Job from "../Models/Job.js";
import { badRequest, notFound } from "../errors/index.js";
import checkPermission from "../utils/checkPermission.js";

const getAllJobs = async (req, res, next) => {
  try {
    const { search, status, jobType, sort } = req.query;

    const queryObject = {
      createdBy: req.user.userId,
    };

    if (status !== "all") {
      queryObject.status = status;
    }
    if (jobType !== "all") {
      queryObject.jobType = jobType;
    }
    if (search) {
      queryObject.position = { $regex: search, $options: "i" };
    }
    // NO AWAIT
    let result = Job.find(queryObject);

    // chain sort conditions
    if (sort === "latest") {
      result = result.sort("-createdAt");
    }
    if (sort === "oldest") {
      result = result.sort("createdAt");
    }
    if (sort === "a-z") {
      result = result.sort("position");
    }
    if (sort === "z-a") {
      result = result.sort("-position");
    }

    // setup pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit; //10
    result = result.skip(skip).limit(limit);

    const jobs = await result;

    const totalJobs = await Job.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalJobs / limit);

    res.status(200).json({ jobs, totalJobs, numOfPages });
  } catch (error) {
    next(error);
  }
};

const createJob = async (req, res, next) => {
  try {
    const { position, company } = req.body;
    if (!position || !company) {
      throw new badRequest("Please All fields are required");
    }
    req.body.createdBy = req.user.userId;
    const job = await Job.create(req.body);
    res.status(201).json({ job });
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const { id: jobId } = req.params;
    const { company, position } = req.body;

    if (!company || !position) {
      throw new badRequest("Please provide all filed");
    }
    const job = await Job.findOne({ _id: jobId });
    if (!job) {
      throw new notFound(`No job with id: ${jobId}`);
    }
    checkPermission(req.user, job.createdBy);

    const updatedJob = await Job.findOneAndUpdate({ _id: jobId }, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ updatedJob });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const { id: jobId } = req.params;
    const job = await Job.findOne({ _id: jobId });
    if (!job) {
      throw new notFound(`No job with id: ${jobId}`);
    }
    checkPermission(req.user, job.createdBy);

    await job.remove();

    res.status(200).json({ msg: "Success! Job removed" });
  } catch (error) {
    next(error);
  }
};

const showStats = async (req, res, next) => {
  try {
    let stats = await Job.aggregate([
      { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    stats = stats.reduce((acc, curr) => {
      const { _id: title, count } = curr;
      acc[title] = count;
      return acc;
    }, {});

    const defaultStats = {
      pending: stats.pending || 0,
      interview: stats.interview || 0,
      declined: stats.declined || 0,
    };
    let monthlyApplications = await Job.aggregate([
      { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]);

    monthlyApplications = monthlyApplications
      .map((item) => {
        const {
          _id: { year, month },
          count,
        } = item;
        // accepts 0-11
        const date = moment()
          .month(month - 1)
          .year(year)
          .format("MMM Y");
        return { date, count };
      })
      .reverse();

    res.status(200).json({ defaultStats, monthlyApplications });
  } catch (error) {
    next(error);
  }
};

export { createJob, deleteJob, getAllJobs, updateJob, showStats };
