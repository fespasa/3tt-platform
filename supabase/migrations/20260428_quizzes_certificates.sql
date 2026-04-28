-- =============================================
-- Quiz & Certificate tables for courses platform
-- =============================================

-- Quizzes por módulo
CREATE TABLE module_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Quiz del módulo',
  passing_score INTEGER NOT NULL DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Preguntas de quiz
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES module_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Opciones de respuesta
CREATE TABLE quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0
);

-- Intentos de quiz
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES module_quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Certificados generados
CREATE TABLE course_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Índices
CREATE INDEX idx_module_quizzes_module ON module_quizzes(module_id);
CREATE INDEX idx_module_quizzes_course ON module_quizzes(course_id);
CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_options_question ON quiz_options(question_id);
CREATE INDEX idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
CREATE INDEX idx_course_certificates_user ON course_certificates(user_id);
CREATE INDEX idx_course_certificates_course ON course_certificates(course_id);

-- RLS
ALTER TABLE module_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_certificates ENABLE ROW LEVEL SECURITY;

-- module_quizzes: everyone can read, only admin can write
CREATE POLICY "quizzes_select" ON module_quizzes FOR SELECT USING (true);
CREATE POLICY "quizzes_admin_insert" ON module_quizzes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "quizzes_admin_update" ON module_quizzes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "quizzes_admin_delete" ON module_quizzes FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- quiz_questions: everyone can read, only admin can write
CREATE POLICY "questions_select" ON quiz_questions FOR SELECT USING (true);
CREATE POLICY "questions_admin_insert" ON quiz_questions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "questions_admin_update" ON quiz_questions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "questions_admin_delete" ON quiz_questions FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- quiz_options: everyone can read, only admin can write
CREATE POLICY "options_select" ON quiz_options FOR SELECT USING (true);
CREATE POLICY "options_admin_insert" ON quiz_options FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "options_admin_update" ON quiz_options FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "options_admin_delete" ON quiz_options FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- quiz_attempts: users can read their own, authenticated can insert
CREATE POLICY "attempts_select_own" ON quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "attempts_insert" ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- course_certificates: users can read their own, insert via service role
CREATE POLICY "certificates_select_own" ON course_certificates FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "certificates_insert" ON course_certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);
