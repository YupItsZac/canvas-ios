// @flow

import type { CourseListDataProps } from '../course-prop-types'
import localeSort from '../../../utils/locale-sort'

export default function mapStateToProps (state: CoursesAppState): CourseListDataProps {
  const allCourses: CoursesState = state.entities.courses
  const { pending, error } = state.favoriteCourses
  let courses = Object.keys(allCourses)
    .map(id => allCourses[id])
    .map(({ course, color }) => ({ ...course, color }))
    .sort((c1, cs2) => localeSort(c1.name, cs2.name))

  return { pending, error, courses }
}
