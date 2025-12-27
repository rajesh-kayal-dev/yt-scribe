import { Course } from '../models/courseModel.js';

// util to slugify
function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function createCourse(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const {
      title,
      description,
      category,
      price,
      thumbnailUrl,
      level,
      currency = 'INR',
      status = 'pending',
      videos = [],
    } = req.body || {};

    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const course = await Course.create({
      title,
      slug: slugify(title),
      description: description || '',
      category: category || '',
      price: typeof price === 'number' ? price : parseFloat(price) || 0,
      currency,
      thumbnailUrl: thumbnailUrl || '',
      creator: userId,
      level: level || '',
      // keep legacy flag in sync for current UI
      isPublished: status === 'published',
      status,
      videos: Array.isArray(videos) ? videos : [],
    });

    return res.status(201).json({ success: true, data: { course }, course });
  } catch (err) {
    next(err);
  }
}

export async function getMarketplaceCourses(req, res, next) {
  try {
    const isAdmin = req.user?.role === 'admin';
    const {
      search = '',
      category,
      sort = 'new',
      page = 1,
      limit = 20,
      includeAll = false,
    } = req.query || {};

    const pg = Math.max(parseInt(page, 10) || 1, 1);
    const lim = Math.min(parseInt(limit, 10) || 20, 100);
    const filter = {};

    if (!(includeAll && isAdmin)) {
      filter.$or = [{ status: 'published' }, { isPublished: true }];
    }
    if (category) filter.category = category;
    if (search) filter.title = { $regex: String(search), $options: 'i' };

    const sortMap = {
      new: { createdAt: -1 },
      popular: { 'stats.students': -1 },
      price: { price: 1 },
      price_desc: { price: -1 },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const [rows, total] = await Promise.all([
      Course.find(filter)
        .sort(sortObj)
        .skip((pg - 1) * lim)
        .limit(lim)
        .populate('creator', 'name'),
      Course.countDocuments(filter),
    ]);

    const courses = rows.map((c) => ({
      _id: c._id,
      title: c.title,
      description: c.description,
      category: c.category,
      price: c.price,
      thumbnailUrl: c.thumbnailUrl,
      creatorName: c.creator?.name || 'Creator',
      level: c.level || 'Beginner',
      students: c.stats?.students || 0,
      rating: 4.8,
      reviews: 0,
      duration: c.videos?.length ? `${c.videos.length} lessons` : 'Self-paced',
    }));

    return res.json({ success: true, data: { courses, pagination: { total, page: pg, limit: lim } }, courses });
  } catch (err) {
    next(err);
  }
}

export async function getAllCourses(req, res, next) {
  // For backward compat: alias to marketplace with includeAll allowed for admin
  return getMarketplaceCourses(req, res, next);
}

export async function getCourseById(req, res, next) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).populate('creator', 'name');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const isAdmin = req.user?.role === 'admin';
    const isOwner = req.user?.id && course.creator && String(course.creator._id) === String(req.user.id);
    if (!(isAdmin || isOwner) && !(course.status === 'published' || course.isPublished)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this course' });
    }

    return res.json({ success: true, data: { course }, course });
  } catch (err) {
    next(err);
  }
}

export async function updateCourse(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const isAdmin = req.user?.role === 'admin';
    const isOwner = String(course.creator) === String(userId);
    if (!(isAdmin || isOwner)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const allowed = ['title', 'description', 'category', 'price', 'currency', 'thumbnailUrl', 'level', 'videos', 'status'];
    for (const k of allowed) {
      if (k in req.body) {
        course[k] = req.body[k];
      }
    }
    if ('title' in req.body) course.slug = slugify(course.title);
    // keep legacy flag in sync
    if ('status' in req.body) course.isPublished = course.status === 'published';

    await course.save();
    return res.json({ success: true, data: { course } });
  } catch (err) {
    next(err);
  }
}

export async function getPendingCourses(req, res, next) {
  try {
    const rows = await Course.find({ status: { $in: ['pending', 'draft'] } }).sort({ createdAt: -1 }).populate('creator', 'name');
    return res.json({ success: true, data: { courses: rows } });
  } catch (err) {
    next(err);
  }
}

export async function publishCourse(req, res, next) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    course.status = 'published';
    course.isPublished = true; // legacy
    await course.save();
    return res.json({ success: true, data: { course } });
  } catch (err) {
    next(err);
  }
}
