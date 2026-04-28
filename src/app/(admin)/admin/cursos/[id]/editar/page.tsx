"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CourseForm, { type CourseFormData } from "@/components/admin/courses/CourseForm";
import ModuleEditor from "@/components/admin/courses/ModuleEditor";
import QuizEditor from "@/components/admin/courses/QuizEditor";

interface LessonData {
  id?: string; title: string; description: string;
  video_url: string; video_duration: number; is_preview: boolean; position: number;
}
interface ModuleData {
  id?: string; title: string; position: number; lessons: LessonData[];
}

const emptyForm: CourseFormData = {
  title: "", slug: "", subtitle: "", description: "",
  level: "fundamentos", discipline: "general", instructor_id: "",
  price: 0, thumbnail_url: "", preview_url: "", duration_mins: 0,
  is_published: false, is_featured: false, tags: "",
};

const emptyLesson: LessonData = {
  title: "", description: "", video_url: "", video_duration: 0, is_preview: false, position: 0,
};

export default function CourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "nuevo";
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<CourseFormData>(emptyForm);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [instructors, setInstructors] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(isNew ? null : id);

  useEffect(() => {
    // Load instructors (collaborators)
    supabase
      .from("collaborators")
      .select("id, profiles:user_id(full_name)")
      .then(({ data }) => {
        if (data) {
          setInstructors(data.map((c: any) => ({ id: c.id, name: c.profiles?.full_name ?? "Sin nombre" })));
        }
      });

    // Load existing course
    if (!isNew) {
      supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data: course }) => {
          if (course) {
            setForm({
              title: course.title, slug: course.slug, subtitle: course.subtitle ?? "",
              description: course.description ?? "", level: course.level,
              discipline: course.discipline, instructor_id: course.instructor_id,
              price: course.price, thumbnail_url: course.thumbnail_url ?? "",
              preview_url: course.preview_url ?? "", duration_mins: course.duration_mins ?? 0,
              is_published: course.is_published ?? false, is_featured: course.is_featured ?? false,
              tags: (course.tags ?? []).join(", "),
            });
          }
        });

      // Load modules with lessons
      supabase
        .from("course_modules")
        .select("*, course_lessons(*)")
        .eq("course_id", id)
        .order("position")
        .then(({ data }) => {
          if (data) {
            setModules(data.map(m => ({
              id: m.id,
              title: m.title,
              position: m.position,
              lessons: (m.course_lessons ?? [])
                .sort((a: any, b: any) => a.position - b.position)
                .map((l: any) => ({
                  id: l.id, title: l.title, description: l.description ?? "",
                  video_url: l.video_url ?? "", video_duration: l.video_duration ?? 0,
                  is_preview: l.is_preview ?? false, position: l.position,
                })),
            })));
          }
        });
    }
  }, []);

  const setField = (key: keyof CourseFormData, value: string | number | boolean) =>
    setForm(f => ({ ...f, [key]: value }));

  const addModule = () => {
    setModules(prev => [...prev, { title: `Módulo ${prev.length + 1}`, position: prev.length, lessons: [] }]);
  };

  const save = async () => {
    setSaving(true);

    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    const payload = {
      title: form.title, slug: form.slug, subtitle: form.subtitle || null,
      description: form.description || null, level: form.level, discipline: form.discipline,
      instructor_id: form.instructor_id, price: form.price,
      thumbnail_url: form.thumbnail_url || null, preview_url: form.preview_url || null,
      duration_mins: form.duration_mins, is_published: form.is_published,
      is_featured: form.is_featured, tags,
      lessons_count: modules.reduce((acc, m) => acc + m.lessons.length, 0),
    };

    let savedCourseId = courseId;

    if (isNew || !courseId) {
      const { data, error } = await supabase.from("courses").insert(payload).select("id").single();
      if (error) { alert("Error: " + error.message); setSaving(false); return; }
      savedCourseId = data.id;
      setCourseId(data.id);
    } else {
      await supabase.from("courses").update(payload).eq("id", courseId);
    }

    if (!savedCourseId) { setSaving(false); return; }

    // Save modules and lessons
    // Delete existing modules (cascade deletes lessons)
    if (!isNew && courseId) {
      await supabase.from("course_modules").delete().eq("course_id", courseId);
    }

    for (let mi = 0; mi < modules.length; mi++) {
      const mod = modules[mi];
      const { data: savedModule } = await supabase
        .from("course_modules")
        .insert({ course_id: savedCourseId, title: mod.title, position: mi })
        .select("id")
        .single();

      if (savedModule) {
        for (let li = 0; li < mod.lessons.length; li++) {
          const lesson = mod.lessons[li];
          await supabase.from("course_lessons").insert({
            course_id: savedCourseId,
            module_id: savedModule.id,
            title: lesson.title,
            description: lesson.description || null,
            video_url: lesson.video_url || null,
            video_duration: lesson.video_duration || null,
            is_preview: lesson.is_preview,
            position: li,
          });
        }
      }
    }

    setSaving(false);
    if (isNew) {
      router.replace(`/admin/cursos/${savedCourseId}/editar`);
    }
    router.refresh();
  };

  // Module operations
  const moveModule = (idx: number, dir: -1 | 1) => {
    setModules(prev => {
      const arr = [...prev];
      const swap = idx + dir;
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return arr;
    });
  };

  const deleteModule = (idx: number) => {
    if (!confirm("¿Eliminar este módulo y sus lecciones?")) return;
    setModules(prev => prev.filter((_, i) => i !== idx));
  };

  // Lesson operations
  const addLesson = (moduleIdx: number) => {
    setModules(prev => prev.map((m, i) =>
      i === moduleIdx ? { ...m, lessons: [...m.lessons, { ...emptyLesson, position: m.lessons.length }] } : m
    ));
  };

  const changeLesson = (moduleIdx: number, lessonIdx: number, field: string, value: any) => {
    setModules(prev => prev.map((m, mi) =>
      mi === moduleIdx ? {
        ...m,
        lessons: m.lessons.map((l, li) => li === lessonIdx ? { ...l, [field]: value } : l),
      } : m
    ));
  };

  const deleteLesson = (moduleIdx: number, lessonIdx: number) => {
    setModules(prev => prev.map((m, mi) =>
      mi === moduleIdx ? { ...m, lessons: m.lessons.filter((_, li) => li !== lessonIdx) } : m
    ));
  };

  const moveLesson = (moduleIdx: number, lessonIdx: number, dir: -1 | 1) => {
    setModules(prev => prev.map((m, mi) => {
      if (mi !== moduleIdx) return m;
      const arr = [...m.lessons];
      const swap = lessonIdx + dir;
      [arr[lessonIdx], arr[swap]] = [arr[swap], arr[lessonIdx]];
      return { ...m, lessons: arr };
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-foreground">{isNew ? "Nuevo curso" : "Editar curso"}</h1>
          <p className="text-muted text-sm mt-1">{form.title || "Sin título"}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push("/admin/cursos")} className="btn-secondary !text-sm !py-2 !px-4">
            ← Volver
          </button>
          <button onClick={save} disabled={saving || !form.title || !form.slug || !form.instructor_id}
            className="btn-primary !text-sm !py-2 !px-5 disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar todo"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <CourseForm form={form} onChange={setField} instructors={instructors} />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-foreground text-lg">Módulos y lecciones</h3>
            <button onClick={addModule} className="btn-secondary !text-sm !py-1.5 !px-4">
              + Añadir módulo
            </button>
          </div>

          <div className="space-y-4">
            {modules.map((mod, mi) => (
              <ModuleEditor
                key={mi}
                mod={mod}
                index={mi}
                onChangeTitle={(title) => setModules(prev => prev.map((m, i) => i === mi ? { ...m, title } : m))}
                onDelete={() => deleteModule(mi)}
                onMoveUp={() => moveModule(mi, -1)}
                onMoveDown={() => moveModule(mi, 1)}
                isFirst={mi === 0}
                isLast={mi === modules.length - 1}
                onAddLesson={() => addLesson(mi)}
                onChangeLesson={(li, field, value) => changeLesson(mi, li, field as string, value)}
                onDeleteLesson={(li) => deleteLesson(mi, li)}
                onMoveLessonUp={(li) => moveLesson(mi, li, -1)}
                onMoveLessonDown={(li) => moveLesson(mi, li, 1)}
              />
            ))}
            {modules.length === 0 && (
              <div className="text-center py-12 text-muted">
                <div className="text-4xl mb-2">📚</div>
                <p>Aún no hay módulos. Añade el primero para organizar las lecciones.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quiz editors — only show for saved courses with saved modules */}
        {courseId && modules.some(m => m.id) && (
          <div>
            <h3 className="font-black text-foreground text-lg mb-4">Quizzes por módulo</h3>
            <div className="space-y-4">
              {modules.filter(m => m.id).map(mod => (
                <div key={mod.id}>
                  <p className="text-sm font-semibold text-secondary mb-2">{mod.title}</p>
                  <QuizEditor moduleId={mod.id!} courseId={courseId} />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">Los quizzes se guardan por separado. Primero guarda el curso y módulos, luego edita los quizzes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
