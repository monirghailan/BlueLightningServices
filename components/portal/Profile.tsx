import type { MemberRole } from "@/lib/supabase/database.types";
import { PortalCard } from "@/components/portal/PortalCard";

const ROLE_LABELS: Record<MemberRole, string> = {
  administrator: "Administrator",
  standard: "Standard",
};

interface ProfileProps {
  organizationName: string;
  userName: string | null;
  userEmail: string;
  userRole: MemberRole;
}

export function Profile({
  organizationName,
  userName,
  userEmail,
  userRole,
}: ProfileProps) {
  return (
    <PortalCard title="Profile">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Organization Name</dt>
          <dd className="font-medium">{organizationName}</dd>
        </div>
        <div>
          <dt className="text-muted">User Name</dt>
          <dd className="font-medium">{userName ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">User Email</dt>
          <dd>{userEmail}</dd>
        </div>
        <div>
          <dt className="text-muted">User Role</dt>
          <dd>{ROLE_LABELS[userRole]}</dd>
        </div>
      </dl>
    </PortalCard>
  );
}
