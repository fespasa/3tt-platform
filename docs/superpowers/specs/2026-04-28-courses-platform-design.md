# Plataforma de Cursos 3Touch Tribe — Spec de Diseño

**Fecha**: 2026-04-28
**Estado**: Aprobado por usuario, pendiente de implementación

---

## 1. Objetivo

Construir una plataforma de cursos estilo Udemy dentro de 3Touch Tribe. Los usuarios pueden explorar un catálogo de cursos de voleibol, ver previews, inscribirse (gratis o de pago), seguir lecciones en vídeo, completar quizzes por módulo, trackear su progreso y descargar un certificado PDF al completar el curso. Los administradores gestionan todo el contenido desde el panel de admin.

## 2. Decisiones de diseño

| Decisión | Elección | Motivo |
|---|---|---|
| Alojamiento de vídeo | URL directa (MP4/HLS) | Control total, sin dependencia de terceros. HLS.js para streaming adaptativo. |
| Alcance V1 | Completo estilo Udemy | Catálogo + detalle + inscripción + reproductor + progreso + reviews + quizzes + certificados + admin CRUD |
| Certificados | PDF descargable | jsPDF genera certificado con nombre, curso, fecha y logo 3TT al completar 100% |
| Acceso sin cuenta | Solo previews | Puede ver catálogo y lecciones `is_preview`. Para inscribirse (incluso gratis) necesita cuenta. |
| Pagos | Stripe Checkout | Redirect a Stripe. Webhook confirma pago y crea enrollment. Revenue share al instructor. |
| Quizzes | Tipo test básico | Preguntas multiple-choice al final de cada módulo. Nota mínima para aprobar (70%). |
| Arquitectura frontend | Componentes modulares | Componentes reutilizables en `src/components/academia/`, páginas en `src/app/(main)/academia/` |

## 3. Estado actual del codebase

### Ya existe

- **Tablas Supabase**: `courses`, `course_modules`, `course_lessons`, `course_enrollments`, `lesson_progress`, `course_reviews` — schema completo con RLS y triggers
- **Vista**: `v_courses_with_instructor` — join con collaborators, avg rating, enrollment count
- **Tipos TypeScript**: `Course`, `CourseWithInstructor`, `CourseLevel` en `src/types/database.types.ts`
- **Trigger**: `update_course_progress()` — recalcula `progress_pct` al marcar lecciones completadas
- **Trigger**: `handle_course_payment()` — revenue sharing con instructor
- **Landing page**: ya hace fetch de cursos publicados y muestra cards

### No existe (hay que crear)

- Páginas públicas de academia (`/academia`, `/academia/[slug]`, `/academia/[slug]/aprender`)
- Componentes de academia (VideoPlayer, CourseCard, CourseFilters, LessonSidebar, QuizWidget, etc.)
- Páginas de admin para gestión de cursos
- Tablas de quizzes (`module_quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts`)
- Tabla de certificados (`course_certificates`)
- Integración Stripe Checkout para cursos individuales
- Generación de certificados PDF

## 4. Rutas y páginas

### 4.1 Páginas públicas

#### `/academia` — Catálogo de cursos

- Grid responsive de CourseCards (2 cols tablet, 3 cols desktop)
- Barra de filtros: búsqueda por texto, nivel (fundamentos/avanzado/especialización/elite), disciplina, precio (gratis/pago), ordenación (recientes, populares, mejor valorados)
- Paginación o infinite scroll
- Datos: query a `v_courses_with_instructor` con filtros dinámicos
- Estado vacío: mensaje cuando no hay resultados

#### `/academia/[slug]` — Detalle del curso

- **Hero section**: thumbnail grande o trailer (si existe video_url del curso), título, badge de nivel, disciplina
- **Info principal**: descripción completa, duración total, número de lecciones, nivel, instructor (avatar + nombre + bio corta)
- **Módulos y lecciones**: acordeón desplegable. Cada módulo muestra sus lecciones con icono de candado (bloqueada), play (preview), o check (completada si está inscrito). Las lecciones `is_preview` son accesibles sin inscripción.
- **Sidebar/CTA sticky**: precio (o "Gratis"), botón "Inscribirse gratis" o "Comprar por X€" (precio miembro si aplica), rating medio con estrellas, número de inscritos
- **Reviews section**: lista de reviews con rating + comentario + autor + fecha. Si el usuario está inscrito y no ha dejado review, mostrar formulario.
- **Sin cuenta**: puede ver todo menos las lecciones no-preview. El botón de inscripción redirige a `/login?redirectTo=/academia/[slug]`

#### `/academia/[slug]/aprender` — Reproductor de lecciones

- **Layout**: sidebar izquierda (colapsable en móvil) + área principal de contenido
- **Sidebar**: lista de módulos y lecciones. Cada lección muestra: checkbox de completada, título, duración. Módulo actual expandido, otros colapsados. Indicador de quiz al final de cada módulo.
- **Área principal**:
  - Reproductor de vídeo (VideoPlayer con HLS.js)
  - Debajo del vídeo: título de la lección, descripción
  - Botón "Marcar como completada" + botón "Siguiente lección"
  - Cuando toca quiz: el QuizWidget reemplaza el vídeo
- **Progreso**: barra de progreso global en la parte superior
- **Acceso**: requiere enrollment. Si no está inscrito → redirect a detalle del curso.
- **Certificado**: al llegar a 100% + todos quizzes aprobados → banner "¡Curso completado!" + botón "Descargar certificado"

### 4.2 Páginas admin

#### `/admin/cursos` — Listado de cursos

- Tabla con columnas: thumbnail, título, instructor, nivel, precio, estado (draft/published), inscritos, rating medio, acciones (editar/eliminar)
- Botón "+ Nuevo curso" → abre formulario de creación
- Filtros: estado, nivel
- Consistente con el estilo de las otras tablas admin (eventos, newsletter, etc.)

#### `/admin/cursos/[id]/editar` — Editor de curso

**Sección 1: Datos generales**
- Título, slug (auto-generado desde título), descripción (textarea)
- Nivel (select: fundamentos/avanzado/especialización/elite), disciplina
- Instructor (select de collaborators existentes)
- Thumbnail URL, trailer URL
- Precio público, precio miembro
- Duración estimada (horas)
- Tags (input con chips)
- Estado: draft / published
- Checkbox: is_published

**Sección 2: Módulos y lecciones**
- Lista de módulos ordenable (drag & drop o botones arriba/abajo)
- Cada módulo expandible muestra:
  - Título del módulo (editable inline)
  - Lista de lecciones ordenable
  - Cada lección: título, descripción, video URL, duración (minutos), checkbox is_preview
  - Botón "+ Añadir lección"
  - Botón "Gestionar quiz" → abre editor de quiz del módulo
- Botón "+ Añadir módulo"

**Sección 3: Quiz por módulo**
- Dentro de cada módulo, un mini-editor de quiz:
  - Título del quiz, nota mínima para aprobar (default 70%)
  - Lista de preguntas:
    - Texto de la pregunta
    - 2-4 opciones de respuesta, marcar cuál es correcta
    - Botón "+ Añadir pregunta"

**Sección 4: Inscripciones y stats (solo lectura)**
- Número de inscritos, progreso medio, rating medio
- Lista de últimas inscripciones

## 5. Componentes

### 5.1 Componentes públicos (`src/components/academia/`)

| Componente | Responsabilidad |
|---|---|
| `CourseCard` | Card de curso para catálogo: thumbnail, título, instructor, rating (estrellas), precio, badge nivel |
| `CourseFilters` | Barra de filtros: search input + dropdowns (nivel, disciplina, precio) + orden |
| `CourseGrid` | Grid responsive que renderiza CourseCards con loading skeletons |
| `VideoPlayer` | Reproductor HTML5 con HLS.js para .m3u8, fallback MP4. Controles custom. Reporta watched_seconds. |
| `LessonSidebar` | Sidebar del reproductor: módulos colapsables, lecciones con estado, indicador de quiz |
| `QuizWidget` | Formulario de quiz: preguntas con radio buttons, submit, feedback inmediato (correcto/incorrecto), registra intento |
| `ReviewForm` | Formulario de review: selector de estrellas (1-5) + textarea comentario |
| `ReviewList` | Lista de reviews con avatar, nombre, rating, comentario, fecha |
| `ProgressBar` | Barra de progreso lineal con porcentaje |
| `CertificateDownload` | Botón que genera y descarga certificado PDF con jsPDF |
| `CourseLevelBadge` | Badge coloreado según nivel (fundamentos=verde, avanzado=azul, especialización=morado, elite=dorado) |
| `PriceDisplay` | Muestra precio formateado, "Gratis" si es 0, precio miembro tachando el original |

### 5.2 Componentes admin (`src/components/admin/courses/`)

| Componente | Responsabilidad |
|---|---|
| `CourseForm` | Formulario completo de datos generales del curso |
| `ModuleEditor` | Editor de un módulo: título editable + lista de lecciones |
| `LessonEditor` | Formulario inline de una lección: título, descripción, video URL, duración, is_preview |
| `QuizEditor` | Editor de quiz de un módulo: preguntas + opciones |
| `QuestionEditor` | Editor de una pregunta: texto + opciones con radio para marcar correcta |
| `SortableList` | Wrapper genérico para reordenar items (módulos o lecciones) con botones arriba/abajo |

## 6. Schema de base de datos adicional

### 6.1 Nuevas tablas

```sql
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
```

### 6.2 RLS policies

- `module_quizzes`: SELECT para todos (public read), INSERT/UPDATE/DELETE solo admin
- `quiz_questions`: SELECT para todos, INSERT/UPDATE/DELETE solo admin
- `quiz_options`: SELECT para todos, INSERT/UPDATE/DELETE solo admin
- `quiz_attempts`: SELECT para el propio usuario, INSERT para usuarios autenticados
- `course_certificates`: SELECT para el propio usuario, INSERT vía función/trigger

### 6.3 Índices

```sql
CREATE INDEX idx_module_quizzes_module ON module_quizzes(module_id);
CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_options_question ON quiz_options(question_id);
CREATE INDEX idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
CREATE INDEX idx_course_certificates_user ON course_certificates(user_id);
```

## 7. Flujos de usuario

### 7.1 Explorar y descubrir

1. Usuario llega a `/academia`
2. Ve grid de cursos publicados con filtros
3. Click en un curso → `/academia/[slug]`
4. Ve detalle completo: info, módulos, lecciones preview, reviews
5. Puede reproducir lecciones marcadas como `is_preview` directamente

### 7.2 Inscripción gratuita

1. Usuario con cuenta hace click en "Inscribirse gratis"
2. Se crea registro en `course_enrollments`
3. Redirect a `/academia/[slug]/aprender`
4. Si no tiene cuenta → redirect a `/register?redirectTo=/academia/[slug]`

### 7.3 Compra de curso

1. Usuario con cuenta hace click en "Comprar por X€"
2. Se crea Stripe Checkout Session (server-side API route)
3. Redirect a Stripe
4. Pago exitoso → Stripe webhook llama a `/api/webhooks/stripe`
5. Webhook crea enrollment + ejecuta revenue share
6. Redirect back a `/academia/[slug]/aprender`
7. Si no tiene cuenta → redirect a `/register?redirectTo=/academia/[slug]`

### 7.4 Aprender

1. Usuario inscrito entra a `/academia/[slug]/aprender`
2. Ve primera lección no completada (o la última en la que estaba)
3. Reproduce vídeo → al terminar, click "Marcar como completada"
4. Se registra en `lesson_progress`, trigger actualiza `progress_pct`
5. Avanza a siguiente lección
6. Al completar todas las lecciones de un módulo → aparece quiz

### 7.5 Quiz

1. QuizWidget muestra preguntas una a una (o todas juntas)
2. Usuario selecciona respuestas y envía
3. Se calcula score, se registra en `quiz_attempts`
4. Si aprueba (>= passing_score) → quiz marcado como superado
5. Si no aprueba → mensaje de feedback, puede reintentar
6. **Nota**: los quizzes NO bloquean el avance al siguiente módulo. El usuario puede seguir viendo lecciones libremente. Sin embargo, todos los quizzes deben estar aprobados para obtener el certificado final.

### 7.6 Certificado

1. Al llegar a `progress_pct = 100` y todos los quizzes aprobados
2. Aparece banner de "Curso completado"
3. Click "Descargar certificado"
4. Se genera PDF con jsPDF: nombre del usuario, título del curso, fecha, número de certificado, logo 3TT
5. Se guarda registro en `course_certificates` (número único)
6. PDF se descarga directamente en el navegador

### 7.7 Reviews

1. Usuario inscrito que ha completado al menos 1 lección puede dejar review
2. Selecciona rating (1-5 estrellas) + comentario opcional
3. Se guarda en `course_reviews`
4. Se muestra en la página de detalle del curso
5. Solo 1 review por usuario por curso (UNIQUE constraint ya existe)

## 8. Integración Stripe

### API Routes necesarias

- `POST /api/courses/checkout` — Crea Stripe Checkout Session. Recibe `courseId` y `userId`. Devuelve `sessionUrl`.
- `POST /api/webhooks/stripe` — Recibe webhooks de Stripe. En evento `checkout.session.completed`, crea enrollment y ejecuta revenue share.

### Metadata en Stripe Session

```json
{
  "course_id": "uuid",
  "user_id": "uuid",
  "type": "course_purchase"
}
```

## 9. Generación de certificados (PDF)

- Librería: `jsPDF` (client-side)
- Contenido:
  - Logo 3Touch Tribe (embebido como base64)
  - "Certificado de finalización"
  - Nombre completo del usuario
  - Título del curso
  - Nombre del instructor
  - Fecha de emisión
  - Número de certificado (formato: `3TT-YYYY-XXXXX`)
  - Duración del curso
- Estilo: fondo con branding 3TT (navy + teal), bordes decorativos
- Se genera en el navegador, no en servidor

## 10. VideoPlayer — Especificación técnica

- Elemento `<video>` HTML5 nativo
- Si la URL termina en `.m3u8`: cargar HLS.js dinámicamente, attach al elemento video
- Si la URL es `.mp4` u otro: reproducción nativa del navegador
- Controles: play/pause, barra de progreso, volumen, fullscreen, velocidad (0.5x, 1x, 1.25x, 1.5x, 2x)
- Reportar `watched_seconds` al desmontar el componente o cada 30 segundos (debounced update a `lesson_progress`)
- Responsive: 16:9 aspect ratio, max-width 100%

## 11. Responsive y UX

- Catálogo: 1 col móvil, 2 cols tablet, 3 cols desktop
- Detalle: layout single column en móvil, sidebar CTA sticky en desktop
- Reproductor: sidebar se convierte en drawer/bottom sheet en móvil
- Admin editor: formularios apilados en móvil, grid en desktop
- Skeleton loaders mientras cargan datos
- Transiciones suaves entre estados

## 12. Fuera de alcance (V2+)

- Comentarios/discusión dentro de lecciones
- Notas personales en lecciones
- Descargar vídeos offline
- Subtítulos/transcripciones automáticas
- Gamificación avanzada (XP, badges)
- Búsqueda dentro del contenido de lecciones
- Recomendaciones de cursos personalizadas
- Bundles de cursos
- Cupones de descuento
