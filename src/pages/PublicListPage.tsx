import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { LinkList } from '../types';

export default function PublicListPage() {
  const { slug } = useParams<{ slug: string }>();
  const [list, setList] = useState<LinkList | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const loadList = async () => {
      try {
        // Look up slug
        const slugDoc = await getDoc(doc(db, 'slugs', slug));
        if (!slugDoc.exists()) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const listId = slugDoc.data().listId;
        const listDoc = await getDoc(doc(db, 'lists', listId));
        if (!listDoc.exists() || !listDoc.data().published) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setList({ id: listDoc.id, ...listDoc.data() } as LinkList);
      } catch (err) {
        console.error('Failed to load list:', err);
        setNotFound(true);
      }
      setLoading(false);
    };
    loadList();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-haru-orange border-t-transparent" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🔗</div>
        <h1 className="text-2xl font-bold text-haru-brown mb-2">List not found</h1>
        <p className="text-haru-brown/50 mb-6">This link list doesn't exist or hasn't been published yet.</p>
        <Link
          to="/"
          className="inline-flex px-5 py-2.5 bg-haru-brown text-white font-medium rounded-xl hover:bg-haru-burnt transition-colors"
        >
          Create your own →
        </Link>
      </div>
    );
  }

  if (!list) return null;

  const sortedItems = [...list.items].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* List Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-haru-brown mb-3">{list.title}</h1>
        {list.description && (
          <p className="text-haru-brown/60 text-lg max-w-lg mx-auto">{list.description}</p>
        )}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-haru-brown/30">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {sortedItems.length} link{sortedItems.length !== 1 && 's'}
        </div>
      </div>

      {/* Links */}
      <div className="space-y-4">
        {sortedItems.map((item) => {
          const title = item.customTitle ?? item.ogTitle ?? item.url;
          const desc = item.customDescription ?? item.ogDescription;

          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-2xl border border-haru-cream overflow-hidden hover:shadow-lg hover:shadow-haru-orange/10 hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex">
                {item.ogImage && (
                  <div className="w-28 sm:w-36 flex-shrink-0">
                    <img
                      src={item.ogImage}
                      alt=""
                      className="w-full h-full object-cover min-h-[100px]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 p-4 sm:p-5 min-w-0 flex flex-col justify-center">
                  <h2 className="font-bold text-haru-brown text-base sm:text-lg group-hover:text-haru-burnt transition-colors truncate">
                    {title}
                  </h2>
                  {desc && (
                    <p className="text-sm text-haru-brown/50 mt-1 line-clamp-2">{desc}</p>
                  )}
                  <p className="text-xs text-haru-orange/60 mt-2 truncate flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {new URL(item.url).hostname}
                  </p>
                </div>
                <div className="flex items-center pr-4 text-haru-brown/20 group-hover:text-haru-orange transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="mt-12 text-center">
        <p className="text-sm text-haru-brown/30 mb-2">Made with URL LIST</p>
        <Link
          to="/"
          className="text-sm text-haru-orange hover:text-haru-burnt font-medium transition-colors"
        >
          Create your own link list →
        </Link>
      </div>
    </div>
  );
}
