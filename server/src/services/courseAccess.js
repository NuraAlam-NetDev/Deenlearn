import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import { httpError } from '../utils/httpError.js';

export async function findCourseOr404(id) {
  const course = await Course.findById(id);
  if (!course) throw httpError(404, 'Course not found');
  return course;
}

// Course owner (teacher) or admin
export function canManage(user, course) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const teacherId = course.teacher?._id ?? course.teacher;
  return String(teacherId) === String(user._id);
}

// Manager OR enrolled student
export async function hasCourseAccess(user, course) {
  if (canManage(user, course)) return true;
  return !!(await Enrollment.exists({ student: user._id, course: course._id }));
}

// Recalculate one student's progress % for a course
export async function recomputeEnrollment(studentId, courseId) {
  const [total, done] = await Promise.all([
    Lesson.countDocuments({ course: courseId }),
    Progress.countDocuments({ student: studentId, course: courseId, completed: true }),
  ]);
  const progress = total ? Math.round((done / total) * 100) : 0;
  await Enrollment.updateOne({ student: studentId, course: courseId }, { progress });
  return progress;
}

// Recalculate every enrolled student's progress (after lessons added/removed)
export async function syncCourseProgress(courseId) {
  const enrollments = await Enrollment.find({ course: courseId }).select('student').lean();
  if (!enrollments.length) return;

  const total = await Lesson.countDocuments({ course: courseId });
  const doneRows = await Progress.aggregate([
    { $match: { course: courseId, completed: true } },
    { $group: { _id: '$student', n: { $sum: 1 } } },
  ]);
  const done = new Map(doneRows.map((r) => [String(r._id), r.n]));

  await Enrollment.bulkWrite(
    enrollments.map((e) => ({
      updateOne: {
        filter: { _id: e._id },
        update: {
          $set: {
            progress: total ? Math.round(((done.get(String(e.student)) ?? 0) / total) * 100) : 0,
          },
        },
      },
    }))
  );
}
