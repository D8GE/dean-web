/** Fields Dean reads from the Canvas REST API. Extra JSON keys are ignored. */

export type CanvasProfile = {
  id: number;
  name?: string | null;
  short_name?: string | null;
  sortable_name?: string | null;
  primary_email?: string | null;
  login_id?: string | null;
  sis_user_id?: string | null;
  time_zone?: string | null;
};

export type CanvasEnrollment = {
  type?: string;
  computed_current_score?: number | null;
  computed_current_grade?: string | null;
};

export type CanvasTerm = {
  name?: string | null;
  start_at?: string | null;
  end_at?: string | null;
};

export type CanvasCourse = {
  id: number;
  name?: string | null;
  course_code?: string | null;
  html_url?: string | null;
  workflow_state?: string | null;
  access_restricted_by_date?: boolean | null;
  public_description?: string | null;
  syllabus_body?: string | null;
  apply_assignment_group_weights?: boolean | null;
  credits?: number | null;
  teachers?: { display_name?: string | null }[] | null;
  term?: CanvasTerm | null;
  enrollments?: CanvasEnrollment[] | null;
};

export type CanvasSubmissionComment = {
  comment?: string | null;
  created_at?: string | null;
};

export type CanvasSubmission = {
  score?: number | null;
  submitted_at?: string | null;
  late?: boolean | null;
  missing?: boolean | null;
  excused?: boolean | null;
  workflow_state?: string | null;
  posted_at?: string | null;
  submission_comments?: CanvasSubmissionComment[] | null;
};

export type CanvasAssignment = {
  id: number;
  name?: string | null;
  html_url?: string | null;
  due_at?: string | null;
  points_possible?: number | null;
  assignment_group_id?: number | null;
  submission_types?: string[] | null;
  published?: boolean | null;
  grading_type?: string | null;
  omit_from_final_grade?: boolean | null;
  submission?: CanvasSubmission | null;
};

export type CanvasAssignmentGroup = {
  id: number;
  name?: string | null;
  position?: number | null;
  group_weight?: number | null;
};

export type CanvasModuleItem = {
  id: number;
  title?: string | null;
  type?: string | null;
  completion_requirement?: { completed?: boolean | null } | null;
};

export type CanvasModule = {
  id: number;
  name?: string | null;
  position?: number | null;
  items?: CanvasModuleItem[] | null;
};

export type CanvasAnnouncement = {
  id: number;
  title?: string | null;
  message?: string | null;
  posted_at?: string | null;
  context_code?: string | null;
  author?: { display_name?: string | null } | null;
};

export type CanvasPlannerSubmission = {
  submitted?: boolean | null;
  graded?: boolean | null;
  late?: boolean | null;
  missing?: boolean | null;
  excused?: boolean | null;
};

export type CanvasPlannerItem = {
  course_id?: number | null;
  context_name?: string | null;
  plannable_id?: number | null;
  plannable_type?: string | null;
  plannable_date?: string | null;
  html_url?: string | null;
  plannable?: {
    title?: string | null;
    due_at?: string | null;
    points_possible?: number | null;
  } | null;
  submissions?: CanvasPlannerSubmission | false | null;
};

export type CanvasCalendarEvent = {
  id: number;
  title?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  all_day?: boolean | null;
  all_day_date?: string | null;
  location_name?: string | null;
  context_code?: string | null;
  type?: string | null;
};

export type CanvasBundle = {
  profile: CanvasProfile;
  courses: CanvasCourse[];
  assignmentsByCourse: Record<string, CanvasAssignment[]>;
  groupsByCourse: Record<string, CanvasAssignmentGroup[]>;
  modulesByCourse: Record<string, CanvasModule[]>;
  announcements: CanvasAnnouncement[];
  /** `null` means the planner request failed and upcoming work is derived from assignments. */
  planner: CanvasPlannerItem[] | null;
  calendarEvents: CanvasCalendarEvent[];
};
