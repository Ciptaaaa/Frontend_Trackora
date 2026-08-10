export type UserRole = 'admin' | 'user';

export interface User {
  public_id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface Board {
  public_id: string;
  title: string;
  description: string;
  due_date: string | null;
  owner_public_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface List {
  public_id: string;
  board_public_id: string;
  title: string;
  position: number;
}

export interface Label {
  public_id: string;
  name: string;
  
  color: string;
}

export interface Attachment {
  public_id: string;
  card_public_id: string;
  /** Cloudinary secure_url. */
  file: string;
  created_at: string;
}

export interface Comment {
  public_id: string;
  message: string;
  created_at: string;
  author: {
    public_id: string;
    name: string;
    email: string;
  };
}

export interface Card {
  public_id: string;
  list_public_id: string;
  title: string;
  description: string;
  due_date: string | null;
  position: number;
  labels: Label[];
  assignees: User[];
  attachments: Attachment[];
}
export interface RawCard {
  internal_id: number;
  public_id: string;
  list_internal_id: number;
  title: string;
  description: string;
  due_date: string | null;
  position: number;
  created_at: string;
  assigness?: Array<{
    card_internal_id: number;
    user_internal_id: number;
    user: {
      internal_id: number;
      public_id: string;
      name: string;
      email: string;
    };
  }>;
  labels?: Array<{
    card_internal_id: number;
    label_internal_id: number;
  }>;
  attachments?: RawAttachment[];
}

export interface RawLabel {
  internal_id: number;
  public_id: string;
  name: string;
  color: string;
}

export interface RawList {
  internal_id: number;
  public_id: string;
  board_public_id: string;
  title: string;
  created_at: string;
}

export interface ListWithOrder {
  Positions: string[];
  Lists: RawList[];
}

export interface RawAttachment {
  internal_id: number;
  public_id: string;
  card_internal_id: number;
  user_internal_id: number;
  file: string;
  created_at: string;
}

export interface RawComment {
  internal_id: number;
  public_id: string;
  card_internal_id: number;
  user_internal_id: number;
  message: string;
  created_at: string;
  user: {
    internal_id: number;
    public_id: string;
    name: string;
    email: string;
  };
}

export type DueState = 'none' | 'upcoming' | 'soon' | 'today' | 'overdue';


export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_page: number;
  filter: string;
  sort: string;
}

export interface ApiSuccess<TData> {
  status: string;
  response_code: number;
  message: string;
  data: TData;
  meta?: PaginationMeta;
}

export interface ApiError {
  status: string;
  response_code: number;
  message: string;
  error: string;
}

export interface AuthSession {
  user: User;
}

export interface DaySlot {
  date: string;
  weekday: string;
  dayOfMonth: number;
  isToday: boolean;
  isWeekend: boolean;
  cards: Card[];
}
