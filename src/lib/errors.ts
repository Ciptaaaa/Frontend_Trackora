import { ApiError } from './api';
import type { Translate } from '../i18n';

export function describeError(caught: unknown, t: Translate): string {
  if (caught instanceof ApiError) {
    return caught.httpStatus === 0 ? t('board.errNetwork') : caught.message;
  }
  return t('board.errLoad');
}

export function isFatalError(caught: unknown): boolean {
  return caught instanceof ApiError && (caught.httpStatus === 0 || caught.isAuthError);
}
