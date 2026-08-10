import { useEffect, useState } from 'react';
import Button from '../atoms/Button';
import IconButton from '../atoms/IconButton';
import Avatar from '../atoms/Avatar';
import Spinner from '../atoms/Spinner';
import { useT } from '../../i18n/LocaleContext';
import { getComments, createComment, deleteComment } from '../../lib/api';
import { getSession } from '../../lib/session';
import { describeError } from '../../lib/errors';
import type { Comment } from '../../types/domain';

interface CommentThreadProps {
  cardPublicId: string;
}
export default function CommentThread({ cardPublicId }: CommentThreadProps) {
  const t = useT();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = getSession()?.user.public_id ?? null;

  useEffect(() => {
    let live = true;
    setLoading(true);
    setDraft('');

    getComments(cardPublicId)
      .then((fetched) => {
        if (live) setComments(fetched);
      })
      .catch((caught: unknown) => {
        if (live) setError(describeError(caught, t));
      })
      .finally(() => {
        if (live) setLoading(false);
      });

    return () => {
      live = false;
    };
  }, [cardPublicId, t]);

  async function handleSend() {
    const message = draft.trim();
    if (message === '') return;

    setSending(true);
    setError(null);

    try {
      const created = await createComment(cardPublicId, message);
      setComments((current) => [...current, created]);
      setDraft('');
    } catch (caught: unknown) {
      setError(describeError(caught, t));
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(comment: Comment) {
    setError(null);
    try {
      await deleteComment(cardPublicId, comment.public_id);
      setComments((current) =>
        current.filter((item) => item.public_id !== comment.public_id),
      );
    } catch (caught: unknown) {
      setError(describeError(caught, t));
    }
  }

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex justify-center py-4">
          <Spinner label={t('app.loading')} size="sm" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-ink-400">{t('detail.noComments')}</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.public_id} className="flex gap-2.5">
              <Avatar
                user={{
                  public_id: comment.author.public_id,
                  name: comment.author.name,
                  email: comment.author.email,
                  role: 'user',
                }}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-xs font-semibold text-ink-800">
                    {comment.author.name}
                  </span>
                  {comment.author.public_id === currentUserId && (
                    <IconButton
                      icon="trash"
                      label={t('detail.commentDelete')}
                      onClick={() => void handleDelete(comment)}
                      className="ml-auto size-6 shrink-0"
                    />
                  )}
                </div>
                <p className="mt-0.5 text-sm leading-relaxed wrap-break-words text-ink-600">
                  {comment.message}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg bg-paper-100 p-2 ring-1 ring-paper-300">
        <textarea
          rows={2}
          value={draft}
          placeholder={t('detail.commentPlaceholder')}
          aria-label={t('detail.comments')}
          disabled={sending}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
          className="w-full resize-none bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
        />
        <div className="mt-1 flex justify-end">
          <Button
            size="sm"
            disabled={sending || draft.trim() === ''}
            onClick={() => void handleSend()}
          >
            {t('detail.commentSend')}
          </Button>
        </div>
      </div>

      {error !== null && (
        <p role="alert" className="text-xs leading-relaxed text-berry-500">
          {error}
        </p>
      )}
    </div>
  );
}
