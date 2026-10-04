import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import { deleteAssets } from './media.js';

// Permanently removes a course with its lessons, enrollments, progress and uploaded files.
// Used by both the teacher (own course) and admin (moderation) delete endpoints.
export async function deleteCourseCascade(course) {
  const lessons = await Lesson.find({ course: course._id }).select('attachments').lean();
  const assets = lessons.flatMap((l) => l.attachments);
  if (course.thumbnailPublicId) {
    assets.push({ publicId: course.thumbnailPublicId, resourceType: 'image' });
  }

  await Promise.all([
    Lesson.deleteMany({ course: course._id }),
    Enrollment.deleteMany({ course: course._id }),
    Progress.deleteMany({ course: course._id }),
  ]);
  await course.deleteOne();
  await deleteAssets(assets); // best-effort, never throws
}
