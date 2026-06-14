export type OrgStatus = "active" | "suspended";
export type MemberRole = "administrator" | "standard";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  jira_project_key: string;
  jira_component_id: string | null;
  jira_component_name: string | null;
  jira_board_id: string | null;
  status: OrgStatus;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
}

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: MemberRole;
  token_hash: string;
  expires_at: string;
  invited_by: string | null;
  accepted_at: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Organization>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Profile>;
      };
      organization_members: {
        Row: OrganizationMember;
        Insert: Omit<OrganizationMember, "id" | "joined_at"> & {
          id?: string;
          joined_at?: string;
        };
        Update: Partial<OrganizationMember>;
      };
      invitations: {
        Row: Invitation;
        Insert: Omit<Invitation, "id" | "created_at" | "accepted_at"> & {
          id?: string;
          created_at?: string;
          accepted_at?: string | null;
        };
        Update: Partial<Invitation>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
