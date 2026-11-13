import { PAGES } from '@/shared/config/pages-url.config';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-semibold">Страница не найдена</h1>
      <Link to={PAGES.MAIN} className="mt-4 inline-block text-sm underline">
        В личный кабинет
      </Link>
    </div>
  );
}
