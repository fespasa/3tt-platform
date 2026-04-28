import ReviewForm from "./ReviewForm";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string | null;
  user_id: string;
  profiles: { full_name: string; avatar_url: string | null } | null;
}

interface ReviewListProps {
  reviews: Review[];
  courseId: string;
  isEnrolled: boolean;
  userReviewed: boolean;
  isLoggedIn: boolean;
}

export default function ReviewList({ reviews, courseId, isEnrolled, userReviewed, isLoggedIn }: ReviewListProps) {
  return (
    <div>
      <h2 className="text-xl font-black text-foreground mb-4">
        Reseñas {reviews.length > 0 && `(${reviews.length})`}
      </h2>

      {isEnrolled && !userReviewed && isLoggedIn && (
        <div className="mb-6">
          <ReviewForm courseId={courseId} />
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-muted text-sm">Aún no hay reseñas para este curso.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => {
            const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
            return (
              <div key={review.id} className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: "var(--bg-tertiary)" }}>
                    {review.profiles?.avatar_url
                      ? <img src={review.profiles.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                      : "👤"}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{review.profiles?.full_name ?? "Usuario"}</p>
                    <span className="text-amber-500 text-xs">{stars}</span>
                  </div>
                  {review.created_at && (
                    <span className="text-xs text-muted ml-auto">
                      {new Date(review.created_at).toLocaleDateString("es-ES")}
                    </span>
                  )}
                </div>
                {review.comment && <p className="text-secondary text-sm">{review.comment}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
