export interface GitHubConnection {
  id: string;
  user_id: string;
  github_user_id: string;
  username: string;
  avatar_url?: string;
  installation_id?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  github_connections: GitHubConnection[];
  created_at: string;
  updated_at: string;
}
