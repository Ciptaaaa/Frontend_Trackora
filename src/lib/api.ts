import { API_BASE_URL, API_PREFIX } from './config';
import { getSession, setSession, clearSession } from './session';
import type {
  ApiSuccess,
  Attachment,
  Board,
  Card,
  Comment,
  Label,
  List,
  ListWithOrder,
  RawAttachment,
  RawCard,
  RawComment,
  RawLabel,
  RawList,
  User,
} from '../types/domain';


export class ApiError extends Error {
  constructor(
    readonly httpStatus: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
  get isAuthError(): boolean {
    return this.httpStatus === 401 || this.httpStatus === 403;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isMultipart = init.body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'network_error');
  }
  const text = await response.text();
  const payload: Record<string, unknown> =
    text.length === 0 ? {} : (JSON.parse(text) as Record<string, unknown>);

  if (!response.ok) {
    const message =
      typeof payload.message === 'string' ? payload.message : response.statusText;
    throw new ApiError(response.status, message);
  }

  return payload as T;
}

function get<T>(path: string): Promise<ApiSuccess<T>> {
  return request<ApiSuccess<T>>(path, { method: 'GET' });
}

function post<T>(path: string, body?: unknown): Promise<ApiSuccess<T>> {
  return request<ApiSuccess<T>>(path, {
    method: 'POST',
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

function put<T>(path: string, body?: unknown): Promise<ApiSuccess<T>> {
  return request<ApiSuccess<T>>(path, {
    method: 'PUT',
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

function del<T>(path: string, body?: unknown): Promise<ApiSuccess<T>> {
  return request<ApiSuccess<T>>(path, {
    method: 'DELETE',
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

function postForm<T>(path: string, body: FormData): Promise<ApiSuccess<T>> {
  return request<ApiSuccess<T>>(path, { method: 'POST', body });
}
function nullableDate(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined || raw === '') return null;
  return raw.startsWith('0001-01-01') ? null : raw;
}
let labelCache: Map<number, Label> | null = null;

async function labelIndex(): Promise<Map<number, Label>> {
  if (labelCache !== null) return labelCache;

  try {
    const response = await get<RawLabel[] | null>(`${API_PREFIX}/labels`);
    labelCache = new Map(
      (response.data ?? []).map((label) => [
        label.internal_id,
        { public_id: label.public_id, name: label.name, color: label.color },
      ]),
    );
  } catch {
    labelCache = new Map();
  }

  return labelCache;
}

function adaptCard(
  raw: RawCard,
  listPublicId: string,
  labels: Map<number, Label>,
): Card {
  return {
    public_id: raw.public_id,
    list_public_id: listPublicId,
    title: raw.title,
    description: raw.description ?? '',
    due_date: nullableDate(raw.due_date),
    position: raw.position,
    labels: (raw.labels ?? [])
      .map((row) => labels.get(row.label_internal_id))
      .filter((label): label is Label => label !== undefined),
    assignees: (raw.assigness ?? []).map((row) => ({
      public_id: row.user.public_id,
      name: row.user.name,
      email: row.user.email,
      role: 'user' as const,
    })),
    attachments: (raw.attachments ?? []).map((row) => ({
      public_id: row.public_id,
      card_public_id: raw.public_id,
      file: row.file,
      created_at: row.created_at,
    })),
  };
}

interface LoginPayload {
  user: User;
}

export async function login(email: string, password: string): Promise<User> {
  const response = await post<LoginPayload>('/v1/auth/login', {
    email,
    password,
  });

  setSession(response.data.user);
  return response.data.user;
}
export async function register(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  await post<User>('/v1/auth/register', { name, email, password });
  return login(email, password);
}

export async function getMe(): Promise<User | null> {
  try {
    const response = await get<User>(`${API_PREFIX}/auth/me`);
    setSession(response.data);
    return response.data;
  } catch (caught: unknown) {
    if (caught instanceof ApiError && caught.isAuthError) {
      clearSession();
      return null;
    }
    throw caught;
  }
}

export async function logout(): Promise<void> {
  try {
    await post('/v1/auth/logout');
  } catch {
  } finally {
    clearSession();
    labelCache = null;
  }
}

export async function refreshToken(): Promise<boolean> {
  try {
    await post<{ access_token: string }>('/v1/auth/refresh');
    return true;
  } catch {
    return false;
  }
}

function adaptBoard(raw: Board): Board {
  return { ...raw, due_date: nullableDate(raw.due_date) };
}

export async function getMyBoards(): Promise<Board[]> {
  const response = await get<Board[] | null>(
    `${API_PREFIX}/boards/my?page=1&limit=100`,
  );
  return (response.data ?? []).map(adaptBoard);
}

export async function createBoard(input: {
  title: string;
  description?: string;
  due_date?: string | null;
}): Promise<Board> {
  const response = await post<Board>(`${API_PREFIX}/boards/`, input);
  return adaptBoard(response.data);
}
export async function updateBoard(
  boardPublicId: string,
  input: {
    title: string;
    description: string;
    due_date: string | null;
  },
): Promise<Board> {
  const response = await put<Board>(
    `${API_PREFIX}/boards/${boardPublicId}`,
    input,
  );
  return adaptBoard(response.data);
}

export async function addBoardMembers(
  boardPublicId: string,
  userPublicIds: string[],
): Promise<void> {
  await post(`${API_PREFIX}/boards/${boardPublicId}/members`, userPublicIds);
}

export async function removeBoardMembers(
  boardPublicId: string,
  userPublicIds: string[],
): Promise<void> {
  await del(`${API_PREFIX}/boards/${boardPublicId}/members`, userPublicIds);
}


function adaptList(raw: RawList, position: number): List {
  return {
    public_id: raw.public_id,
    board_public_id: raw.board_public_id,
    title: raw.title,
    position,
  };
}

export async function getListsOnBoard(boardPublicId: string): Promise<List[]> {
  let response: ApiSuccess<ListWithOrder | null>;
  try {
    response = await get<ListWithOrder | null>(
      `${API_PREFIX}/boards/${boardPublicId}/lists`,
    );
  } catch (caught: unknown) {
    if (caught instanceof ApiError && caught.httpStatus === 404) return [];
    throw caught;
  }

  const lists = response.data?.Lists ?? [];
  const order = response.data?.Positions ?? [];
  const rank = new Map(order.map((publicId, index) => [publicId, index]));

  return lists
    .map((raw, index) =>
      adaptList(raw, rank.get(raw.public_id) ?? order.length + index),
    )
    .sort((a, b) => a.position - b.position);
}

export async function createList(input: {
  board_public_id: string;
  title: string;
}): Promise<List> {
  const response = await post<RawList>(`${API_PREFIX}/lists/`, input);
  return adaptList(response.data, Number.MAX_SAFE_INTEGER);
}

export async function updateList(
  listPublicId: string,
  input: { title: string },
): Promise<void> {
  await put(`${API_PREFIX}/lists/${listPublicId}`, input);
}

export async function deleteList(listPublicId: string): Promise<void> {
  await del(`${API_PREFIX}/lists/${listPublicId}`);
}

export async function updateListPositions(
  boardPublicId: string,
  listPublicIds: string[],
): Promise<void> {
  await put(`${API_PREFIX}/boards/${boardPublicId}/position`, listPublicIds);
}


export async function getCardsInList(listPublicId: string): Promise<Card[]> {
  const [response, labels] = await Promise.all([
    get<RawCard[] | null>(`${API_PREFIX}/lists/${listPublicId}/cards`),
    labelIndex(),
  ]);

  return (response.data ?? [])
    .map((raw) => adaptCard(raw, listPublicId, labels))
    .sort((a, b) => a.position - b.position);
}

export async function getCardsForBoard(lists: List[]): Promise<Card[]> {
  const perList = await Promise.all(
    lists.map((list) =>
      getCardsInList(list.public_id).catch((caught: unknown) => {
        if (caught instanceof ApiError && (caught.httpStatus === 0 || caught.isAuthError)) {
          throw caught;
        }
        return [];
      }),
    ),
  );
  return perList.flat();
}
export async function getCardDetail(
  cardPublicId: string,
  listPublicId: string,
): Promise<Card> {
  const [response, labels] = await Promise.all([
    get<RawCard>(`${API_PREFIX}/cards/${cardPublicId}`),
    labelIndex(),
  ]);

  return adaptCard(response.data, listPublicId, labels);
}

export async function createCard(input: {
  list_public_id: string;
  title: string;
  description?: string;
  due_date?: string | null;
  position?: number;
}): Promise<Card> {
  const response = await post<RawCard>(`${API_PREFIX}/cards/`, {
    list_id: input.list_public_id,
    title: input.title,
    description: input.description ?? '',
    due_date: input.due_date,
    position: input.position ?? 0,
  });

  return adaptCard(response.data, input.list_public_id, await labelIndex());
}

export async function updateCard(
  cardPublicId: string,
  input: {
    list_public_id: string;
    title: string;
    description: string;
    due_date: string | null;
    position: number;
  },
): Promise<Card> {
  const response = await put<RawCard>(`${API_PREFIX}/cards/${cardPublicId}`, {
    list_id: input.list_public_id,
    title: input.title,
    description: input.description,
    due_date: input.due_date,
    position: input.position,
  });

  return adaptCard(response.data, input.list_public_id, await labelIndex());
}

export async function deleteCard(cardPublicId: string): Promise<void> {
  await del(`${API_PREFIX}/cards/${cardPublicId}`);
}

export async function updateCardPositions(
  listPublicId: string,
  cardPublicIds: string[],
): Promise<void> {
  await put(`${API_PREFIX}/lists/${listPublicId}/positions`, {
    positions: cardPublicIds,
  });
}


export async function getAllLabels(): Promise<Label[]> {
  const index = await labelIndex();
  return [...index.values()];
}

export async function createLabel(input: {
  name: string;
  color: string;
}): Promise<Label> {
  const response = await post<RawLabel>(`${API_PREFIX}/labels/`, input);
  labelCache = null;
  return {
    public_id: response.data.public_id,
    name: response.data.name,
    color: response.data.color,
  };
}

export async function updateLabel(
  labelPublicId: string,
  input: { name: string; color: string },
): Promise<Label> {
  const response = await put<RawLabel>(
    `${API_PREFIX}/labels/${labelPublicId}`,
    input,
  );
  labelCache = null;
  return {
    public_id: response.data.public_id,
    name: response.data.name,
    color: response.data.color,
  };
}

export async function deleteLabel(labelPublicId: string): Promise<void> {
  await del(`${API_PREFIX}/labels/${labelPublicId}`);
  labelCache = null;
}

export async function addCardLabel(
  cardPublicId: string,
  labelPublicId: string,
): Promise<void> {
  await post(`${API_PREFIX}/cards/${cardPublicId}/labels`, {
    label_id: labelPublicId,
  });
}

export async function removeCardLabel(
  cardPublicId: string,
  labelPublicId: string,
): Promise<void> {
  await del(`${API_PREFIX}/cards/${cardPublicId}/labels`, {
    label_id: labelPublicId,
  });
}


export async function assignUser(
  cardPublicId: string,
  userPublicId: string,
): Promise<void> {
  await post(`${API_PREFIX}/cards/${cardPublicId}/assignees`, {
    user_id: userPublicId,
  });
}

export async function unassignUser(
  cardPublicId: string,
  userPublicId: string,
): Promise<void> {
  await del(`${API_PREFIX}/cards/${cardPublicId}/assignees`, {
    user_id: userPublicId,
  });
}


function adaptComment(raw: RawComment): Comment {
  return {
    public_id: raw.public_id,
    message: raw.message,
    created_at: raw.created_at,
    author: {
      public_id: raw.user.public_id,
      name: raw.user.name,
      email: raw.user.email,
    },
  };
}

export async function getComments(cardPublicId: string): Promise<Comment[]> {
  try {
    const response = await get<RawComment[] | null>(
      `${API_PREFIX}/cards/${cardPublicId}/comments`,
    );
    return (response.data ?? []).map(adaptComment);
  } catch (caught: unknown) {
    if (caught instanceof ApiError && (caught.httpStatus === 0 || caught.isAuthError)) {
      throw caught;
    }
    return [];
  }
}

export async function createComment(
  cardPublicId: string,
  message: string,
): Promise<Comment> {
  const response = await post<RawComment>(
    `${API_PREFIX}/cards/${cardPublicId}/comments`,
    { message },
  );
  return adaptComment(response.data);
}

export async function deleteComment(
  cardPublicId: string,
  commentPublicId: string,
): Promise<void> {
  await del(`${API_PREFIX}/cards/${cardPublicId}/comments/${commentPublicId}`);
}


function adaptAttachment(raw: RawAttachment, cardPublicId: string): Attachment {
  return {
    public_id: raw.public_id,
    card_public_id: cardPublicId,
    file: raw.file,
    created_at: raw.created_at,
  };
}
export async function getAttachments(cardPublicId: string): Promise<Attachment[]> {
  try {
    const response = await get<RawAttachment[] | null>(
      `${API_PREFIX}/cards/${cardPublicId}/attachments`,
    );
    return (response.data ?? []).map((raw) => adaptAttachment(raw, cardPublicId));
  } catch (caught: unknown) {
    if (caught instanceof ApiError && (caught.httpStatus === 0 || caught.isAuthError)) {
      throw caught;
    }
    return [];
  }
}

export async function uploadAttachment(
  cardPublicId: string,
  file: File,
): Promise<Attachment> {
  const form = new FormData();
  form.append('file', file);

  const response = await postForm<RawAttachment>(
    `${API_PREFIX}/cards/${cardPublicId}/attachments`,
    form,
  );
  return adaptAttachment(response.data, cardPublicId);
}

export async function deleteAttachment(
  cardPublicId: string,
  attachmentPublicId: string,
): Promise<void> {
  await del(
    `${API_PREFIX}/cards/${cardPublicId}/attachments/${attachmentPublicId}`,
  );
}

export async function getUsers(filter = ''): Promise<User[]> {
  const query = new URLSearchParams({ page: '1', limit: '50' });
  if (filter !== '') query.set('filter', filter);

  try {
    const response = await get<User[] | null>(
      `${API_PREFIX}/users/page?${query.toString()}`,
    );
    return response.data ?? [];
  } catch (caught: unknown) {
    if (caught instanceof ApiError && caught.httpStatus === 404) return [];
    throw caught;
  }
}

export async function updateProfile(input: {
  publicId: string;
  name: string;
  email: string;
}): Promise<User> {
  const response = await put<User>(`${API_PREFIX}/users/${input.publicId}`, {
    name: input.name,
    email: input.email,
  });

  const updated = response.data;
  if (getSession() !== null) setSession(updated);

  return updated;
}
