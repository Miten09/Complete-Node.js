const Tour = require('./../models/tourModels');
const APIFeatures = require('./../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
  (req.query.limit = '5'),
    (req.query.sort = '-ratingsAverage,price'),
    (req.query.fields = 'name,price,ratingsAverage,summary,difficulty');
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //BUILD QUERY

    // 1A) Filtering
    // const queryObj = { ...req.query };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach(el => delete queryObj[el]);

    // // 1B) Advanced filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // // console.log(JSON.parse(queryStr));

    // let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   // console.log(sortBy);
    //   // console.log(req.query.sort);
    //   query = query.sort(sortBy);
    //   //sort('price ratingsAverage')
    // } else {
    //   query = query.sort('-createdAt');
    // }

    // 3) Field Limiting
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   // console.log(req.query.fields);
    //   // console.log(fields);
    //   query = query.select(fields);
    // } else {
    //   query = query.select('-__v');
    // }
    // 4) Pagination

    // const page = req.query.page * 1;
    // const limit = req.query.limit * 1;
    // const skip = (page - 1) * limit;

    // // page=3&limit=10 ,1-10 ,page 1, 11-20 , page 2, 21-30 , page3
    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }

    //EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sorting()
      .limitFields()
      .paginate();
    const tours = await features.query;
    // query.sort().select().skip().limit() aapdi original query aavi laage if I wrote in chain

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      result: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  // const id = req.params.id * 1; // jyare koi string ne 1 thi multiply kari to e number ma convert thai jaay
  // const tour = tours.find(el => el.id === id);

  try {
    const tour = await Tour.findById(req.params.id);
    //Tour.findOne({_id:req.parama.id}) behind the scene findById works same as findOne

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        tours: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'Success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'Success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'Invalid Data sent'
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
      // {
      //   $match: { _id: { $ne: 'easy' } }
      // }
    ]);

    res.status(200).json({
      status: 'Success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year; //2021
    console.log(year);

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numToursStarts: { $sum: 1 },
          Tours: { $push: `$name` }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { numToursStarts: -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'Success',
      data: {
        plan
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err
    });
  }
};
