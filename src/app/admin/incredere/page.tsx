import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  ReviewAdminActions,
  TrustedSellerBadgeButton,
  VerificationAdminActions,
} from "@/components/admin/admin-trust-actions";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminSetupState } from "@/components/admin/admin-setup-state";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth/user";
import { requireAdmin, getAdminUsers } from "@/lib/db/admin";
import { getReviewsForAdmin } from "@/lib/db/reviews";
import { getVerificationRequestsForAdmin } from "@/lib/db/verification";
import { reviewStatusLabels, verificationStatusLabels } from "@/lib/trust/labels";
import { noIndexRobots } from "@/lib/seo/metadata";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Incredere & review-uri — Admin TROKO",
  },
  description: "Administrare verificari, badge-uri si review-uri TROKO.",
  robots: noIndexRobots,
};

export default async function AdminTrustPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/?auth=login&redirectTo=/admin/incredere");
  }

  const supabase = await createClient();
  const admin = await requireAdmin(supabase);

  if (admin.error === "ADMIN_UNAVAILABLE") {
    return (
      <AdminLayout
        title="Incredere & review-uri"
        description="Verificarile si review-urile se vor incarca dupa aplicarea migrarii."
      >
        <AdminSetupState
          title="Admin trust va fi disponibil dupa configurarea Supabase."
          description="Aplica migrarea 0008 si verifica accesul in tabela admin_users."
        />
      </AdminLayout>
    );
  }

  if (admin.error) {
    notFound();
  }

  const [verificationRequests, reviews, users] = await Promise.all([
    getVerificationRequestsForAdmin({}, supabase),
    getReviewsForAdmin(supabase),
    getAdminUsers(supabase),
  ]);

  return (
    <AdminLayout
      title="Incredere & review-uri"
      description="Revizuieste cererile de verificare, review-urile si badge-urile manuale."
    >
      <div className="grid gap-5">
        <section className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
          <h2 className="text-xl font-semibold text-foreground">
            Cereri de verificare
          </h2>
          <div className="mt-5 grid gap-3">
            {verificationRequests.requests.length > 0 ? (
              verificationRequests.requests.map((request) => (
                <article
                  key={request.id}
                  className="grid gap-3 rounded-[1rem] border border-border bg-background p-4 lg:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {request.type === "phone"
                        ? "Verificare telefon"
                        : "Verificare vanzator"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      ID scurt: {request.id.slice(0, 8)} · user{" "}
                      {request.user_id.slice(0, 8)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-primary">
                        {verificationStatusLabels[request.status]}
                      </Badge>
                      <Badge className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {new Intl.DateTimeFormat("ro-RO").format(
                          new Date(request.created_at),
                        )}
                      </Badge>
                    </div>
                    {request.admin_note ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Nota: {request.admin_note}
                      </p>
                    ) : null}
                  </div>
                  {request.status === "pending" ? (
                    <VerificationAdminActions requestId={request.id} />
                  ) : null}
                </article>
              ))
            ) : (
              <div className="rounded-[1rem] border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                Nu exista cereri de verificare.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
          <h2 className="text-xl font-semibold text-foreground">
            Review-uri recente
          </h2>
          <div className="mt-5 grid gap-3">
            {reviews.reviews.length > 0 ? (
              reviews.reviews.map((review) => (
                <article
                  key={review.id}
                  className="grid gap-3 rounded-[1rem] border border-border bg-background p-4 lg:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      Rating {review.rating}/5 · {review.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      Pentru user {review.reviewed_user_id.slice(0, 8)} · de la{" "}
                      {review.reviewer_id.slice(0, 8)}
                    </p>
                    {review.comment ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {review.comment}
                      </p>
                    ) : null}
                    <Badge className="mt-3 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-primary">
                      {reviewStatusLabels[review.status]}
                    </Badge>
                  </div>
                  <ReviewAdminActions reviewId={review.id} />
                </article>
              ))
            ) : (
              <div className="rounded-[1rem] border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                Nu exista review-uri.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
          <h2 className="text-xl font-semibold text-foreground">
            Badge vanzator de incredere
          </h2>
          <div className="mt-5 grid gap-3">
            {users.users.slice(0, 12).map((row) => (
              <article
                key={row.profile.id}
                className="grid gap-3 rounded-[1rem] border border-border bg-background p-4 lg:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {row.profile.display_name ?? "Utilizator TROKO"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {row.listingCount} anunturi · {row.reportCount} raportari ·
                    scor {row.profile.trust_score}/100
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <TrustedSellerBadgeButton userId={row.profile.id} mode="award" />
                  <TrustedSellerBadgeButton userId={row.profile.id} mode="remove" />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
