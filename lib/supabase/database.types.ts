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

export type JiraIssueSyncStatus = "synced" | "pending_create" | "pending_update" | "error";
export type JiraCommentSource = "portal" | "jira" | "cursor";
export type JiraCommentSyncStatus = "synced" | "pending" | "error";
export type JiraOutboxOperation =
  | "create_issue"
  | "add_comment"
  | "rank_backlog"
  | "move_to_board"
  | "move_to_backlog";
export type JiraOutboxStatus = "pending" | "processing" | "done" | "failed";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  jira_project_key: string;
  jira_component_id: string | null;
  jira_component_name: string | null;
  jira_board_id: string | null;
  jira_last_synced_at: string | null;
  metrics_computed_at: string | null;
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

export type AssistantMessageFeedback = "up" | "down";

export interface AssistantMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources: Record<string, unknown>[] | null;
  feedback: AssistantMessageFeedback | null;
  feedback_at: string | null;
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

export interface JiraIssueRow {
  id: string;
  organization_id: string;
  jira_key: string | null;
  summary: string;
  description: string;
  issue_type: string;
  priority: string | null;
  status: string;
  status_category: string;
  labels: string[];
  parent_jira_key: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  is_in_backlog: boolean;
  backlog_rank: number | null;
  exclude_from_close_metric: boolean;
  sync_status: JiraIssueSyncStatus;
  sync_error: string | null;
  jira_updated_at: string | null;
}

export interface JiraCommentRow {
  id: string;
  issue_id: string;
  jira_comment_id: string | null;
  author_display_name: string;
  author_email: string | null;
  body_markdown: string;
  source: JiraCommentSource;
  sync_status: JiraCommentSyncStatus;
  created_at: string;
}

export interface JiraStatusTransitionRow {
  id: string;
  issue_id: string;
  from_status: string;
  to_status: string;
  transitioned_at: string;
}

export interface OrganizationMetricsRow {
  organization_id: string;
  computed_at: string;
  open_tickets: number;
  closed_this_month: number;
  avg_time_to_close_days: number;
  oldest_open: { key: string; summary: string; ageDays: number } | null;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
  throughput: { week: string; created: number; resolved: number }[];
}

export interface JiraSyncOutboxRow {
  id: string;
  organization_id: string;
  operation: JiraOutboxOperation;
  payload: Record<string, unknown>;
  status: JiraOutboxStatus;
  attempts: number;
  last_error: string | null;
  created_at: string;
  processed_at: string | null;
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
          jira_last_synced_at?: string | null;
          metrics_computed_at?: string | null;
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
      jira_issues: {
        Row: JiraIssueRow;
        Insert: Omit<JiraIssueRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<JiraIssueRow>;
        Relationships: [];
      };
      jira_comments: {
        Row: JiraCommentRow;
        Insert: Omit<JiraCommentRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<JiraCommentRow>;
        Relationships: [];
      };
      jira_status_transitions: {
        Row: JiraStatusTransitionRow;
        Insert: Omit<JiraStatusTransitionRow, "id"> & { id?: string };
        Update: Partial<JiraStatusTransitionRow>;
        Relationships: [];
      };
      organization_metrics: {
        Row: OrganizationMetricsRow;
        Insert: Omit<OrganizationMetricsRow, "computed_at"> & { computed_at?: string };
        Update: Partial<OrganizationMetricsRow>;
        Relationships: [];
      };
      jira_sync_outbox: {
        Row: JiraSyncOutboxRow;
        Insert: Omit<JiraSyncOutboxRow, "id" | "created_at" | "attempts"> & {
          id?: string;
          created_at?: string;
          attempts?: number;
        };
        Update: Partial<JiraSyncOutboxRow>;
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
