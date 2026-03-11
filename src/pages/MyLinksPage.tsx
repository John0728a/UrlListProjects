import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import type { LinkList } from '../types';

export default function MyLinksPage() {
  const { user } = useAuth();
  const [lists, setLists] = useState<LinkList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadLists = async () => {
      const q = query(
        collection(db, 'lists'),
        where('ownerId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as LinkList));
      setLists(data);
      setLoading(false);
    };
    loadLists();
  }, [user]);

  const handleDelete = async (list: LinkList) => {
    if (!confirm('Delete this list? This cannot be undone.')) return;
    try {
      // Delete slug
      if (list.slug) {
        await deleteDoc(doc(db, 'slugs', list.slug));
      }
      await deleteDoc(doc(db, 'lists', list.id));
      setLists((prev) => prev.filter((l) => l.id !== list.id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-haru-orange border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-haru-brown">My Links</h1>
        <Link
          to="/"
          className="px-4 py-2 bg-haru-orange text-white text-sm font-medium rounded-lg hover:bg-haru-burnt transition-colors"
        >
          + New List
        </Link>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-haru-cream flex items-center justify-center">
            <svg className="w-8 h-8 text-haru-brown/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-haru-brown mb-1">No lists yet</h2>
          <p className="text-haru-brown/50 mb-6">Create your first link collection to get started.</p>
          <Link
            to="/"
            className="inline-flex px-5 py-2.5 bg-gradient-to-r from-haru-orange to-haru-burnt text-white font-semibold rounded-xl hover:shadow-md transition-all"
          >
            Create your first list →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <div
              key={list.id}
              className="bg-white rounded-xl border border-haru-cream p-4 sm:p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/edit/${list.id}`}
                    className="font-bold text-haru-brown hover:text-haru-burnt transition-colors text-lg"
                  >
                    {list.title || 'Untitled List'}
                  </Link>
                  {list.description && (
                    <p className="text-sm text-haru-brown/50 mt-0.5 line-clamp-1">{list.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-haru-brown/40">
                    <span>{list.items.length} link{list.items.length !== 1 && 's'}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        list.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-haru-cream text-haru-brown/50'
                      }`}
                    >
                      {list.published ? 'Published' : 'Draft'}
                    </span>
                    {list.slug && list.published && (
                      <a
                        href={`/l/${list.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-haru-orange hover:underline"
                      >
                        /l/{list.slug}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/edit/${list.id}`}
                    className="p-2 text-haru-brown/30 hover:text-haru-orange transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleDelete(list)}
                    className="p-2 text-haru-brown/30 hover:text-haru-red transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
