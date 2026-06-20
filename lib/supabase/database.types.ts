export type OrgStatus = "active" | "suspended";
export type MemberRole = "administrator" | "standard";
export type AssistantPersona =
  | "sales_rep"
  | "sales_manager"
  | "service_agent"
  | "service_manager"
  | "general";
export type LeadStatus =
  | "New"
  | "Contacted"
  | "In Progress"
  | "Not Qualified"
  | "Qualified"
  | "Parked";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  jira_project_key: string;
  jira_component_id: string | null;
  jira_component_name: string | null;
  jira_board_id: string | null;
  status: OrgStatus;
  github_repo_url: string | null;
  github_default_branch: string;
  assistant_enabled: boolean;
  assistant_last_indexed_at: string | null;
  assistant_system_prompt_override: string | null;
  metadata_repo_url: string | null;
  metadata_last_synced_at: string | null;
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
  assistant_persona: AssistantPersona | null;
  joined_at: string;
}

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  full_name: string | null;
  role: MemberRole;
  assistant_persona: AssistantPersona | null;
  token_hash: string;
  expires_at: string;
  invited_by: string | null;
  accepted_at: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string | null;
  message: string;
  source: string | null;
  status: LeadStatus;
  organization_id: string | null;
  provisioned_at: string | null;
  provisioning_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadProvisioningJob {
  lead_id: string;
  created_at: string;
  processed_at: string | null;
  error: string | null;
  attempt_count: number;
}

export interface AssistantDocument {
  id: string;
  organization_id: string;
  path: string;
  content_hash: string;
  title: string;
  chunk_index: number;
  content: string;
  personas: string[];
  embedding: number[] | null;
  created_at: string;
}

export interface AssistantConversation {
  id: string;
  organization_id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssistantMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources: Record<string, unknown>[] | null;
  created_at: string;
}

export interface GuideSearchResult {
  id: string;
  path: string;
  title: string;
  content: string;
  personas: string[];
  similarity: number;
}

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
          github_repo_url?: string | null;
          github_default_branch?: string;
          assistant_enabled?: boolean;
          assistant_last_indexed_at?: string | null;
          assistant_system_prompt_override?: string | null;
          metadata_repo_url?: string | null;
          metadata_last_synced_at?: string | null;
        };
        Update: Partial<Organization>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      organization_members: {
        Row: OrganizationMember;
        Insert: Omit<OrganizationMember, "id" | "joined_at"> & {
          id?: string;
          joined_at?: string;
          assistant_persona?: AssistantPersona | null;
        };
        Update: Partial<OrganizationMember>;
        Relationships: [];
      };
      invitations: {
        Row: Invitation;
        Insert: Omit<Invitation, "id" | "created_at" | "accepted_at"> & {
          id?: string;
          created_at?: string;
          accepted_at?: string | null;
          assistant_persona?: AssistantPersona | null;
        };
        Update: Partial<Invitation>;
        Relationships: [];
      };
      leads: {
        Row: Lead;
        Insert: {
          id?: string;
          name: string;
          email: string;
          company: string;
          phone?: string | null;
          message: string;
          source?: string | null;
          status?: LeadStatus;
          organization_id?: string | null;
          provisioned_at?: string | null;
          provisioning_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Lead>;
        Relationships: [];
      };
      lead_provisioning_jobs: {
        Row: LeadProvisioningJob;
        Insert: {
          lead_id: string;
          created_at?: string;
          processed_at?: string | null;
          error?: string | null;
          attempt_count?: number;
        };
        Update: Partial<LeadProvisioningJob>;
        Relationships: [];
      };
      assistant_documents: {
        Row: AssistantDocument;
        Insert: Omit<AssistantDocument, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
          embedding?: number[] | null;
        };
        Update: Partial<AssistantDocument>;
        Relationships: [];
      };
      assistant_conversations: {
        Row: AssistantConversation;
        Insert: Omit<AssistantConversation, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<AssistantConversation>;
        Relationships: [];
      };
      assistant_messages: {
        Row: AssistantMessage;
        Insert: Omit<AssistantMessage, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
          sources?: Record<string, unknown>[] | null;
        };
        Update: Partial<AssistantMessage>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_assistant_documents: {
        Args: {
          p_org_id: string;
          p_query_embedding: number[];
          p_personas: string[];
          p_match_count?: number;
          p_match_threshold?: number;
        };
        Returns: GuideSearchResult[];
      };
    };
    Enums: {
      assistant_persona: AssistantPersona;
    };
  };
}
