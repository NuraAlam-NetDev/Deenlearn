import { CourseCard } from './ui/Card.jsx';
import Badge from './ui/Badge.jsx';

// Maps a course from GET /api/courses to a card that links to its detail page
export default function CatalogCourseCard({ course }) {
  return (
    <CourseCard
      to={`/courses/${course._id}`}
      title={course.title}
      teacher={course.teacher?.name}
      category={course.category}
      lessonCount={course.lessonCount}
      studentCount={course.studentCount}
      thumbnail={course.thumbnail}
      progress={course.enrolled ? (course.progress ?? 0) : null}
      badge={course.enrolled ? <Badge tone="gold">Enrolled</Badge> : null}
    />
  );
}
