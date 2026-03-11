import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { db } from '../lib/firebase';
import { fetchOgData } from '../lib/og';
import { useAuth } from '../hooks/useAuth';
import SortableLinkCard from '../components/SortableLinkCard';
import type { LinkItem, LinkList } from '../types';

export default function EditorPage() {
  const { listId } = useParams<{ listId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [list, setList] = useState<LinkList | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [addingUrl, setAddingUrl] = useState(false);
  const [slugInput, setSlugInput] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load list
  useEffect(() => {
    if (!listId || !user) return;
    const loadList = async () => {
      const docSnap = await getDoc(doc(db, 'lists', listId));
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as LinkList;
        if (data.ownerId !== user.uid) {
          navigate('/');
          return;
        }
        setList(data);
        setTitle(data.title);
        setDescription(data.description);
        setSlugInput(data.slug);
      } else {
        navigate('/');
      }
      setLoading(false);
    };
    loadList();
  }, [listId, user, navigate]);

  // Auto-save debounced
  const saveList = useCallback(async (updates: Partial<LinkList>) => {
    if (!listId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'lists', listId), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      console.error('Save failed:', err);
    }
    setSaving(false);
  }, [listId]);

  // Add URL
  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !list) return;

    setAddingUrl(true);
    const normalizedUrl = newUrl.trim().startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`;

    const newItem: LinkItem = {
      id: crypto.randomUUID(),
      url: normalizedUrl,
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      customTitle: null,
      customDescription: null,
      order: list.items.length,
    };

    const updatedItems = [...list.items, newItem];
    setList({ ...list, items: updatedItems });
    setNewUrl('');
    await saveList({ items: updatedItems });

    // Fetch OG data in background
    try {
      const ogData = await fetchOgData(normalizedUrl);

      const withOg = updatedItems.map((item) =>
        item.id === newItem.id
          ? { ...item, ogTitle: ogData.title || '', ogDescription: ogData.description || '', ogImage: ogData.image || '' }
          : item
      );
      setList((prev) => prev ? { ...prev, items: withOg } : prev);
      await saveList({ items: withOg });
    } catch (err) {
      console.error('OG fetch failed:', err);
    }

    setAddingUrl(false);
  };

  // Drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !list) return;

    const oldIndex = list.items.findIndex((i) => i.id === active.id);
    const newIndex = list.items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(list.items, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      order: idx,
    }));

    setList({ ...list, items: reordered });
    saveList({ items: reordered });
  };

  // Update item
  const updateItem = (itemId: string, updates: Partial<LinkItem>) => {
    if (!list) return;
    const updatedItems = list.items.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    setList({ ...list, items: updatedItems });
    saveList({ items: updatedItems });
  };

  // Delete item
  const deleteItem = (itemId: string) => {
    if (!list) return;
    const updatedItems = list.items
      .filter((item) => item.id !== itemId)
      .map((item, idx) => ({ ...item, order: idx }));
    setList({ ...list, items: updatedItems });
    saveList({ items: updatedItems });
  };

  // Slug check
  const checkSlug = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugStatus('idle');
      return;
    }
    setSlugStatus('checking');
    try {
      const slugDoc = await getDoc(doc(db, 'slugs', slug));
      if (!slugDoc.exists() || slugDoc.data()?.listId === listId) {
        setSlugStatus('available');
      } else {
        setSlugStatus('taken');
      }
    } catch {
      setSlugStatus('idle');
    }
  };

  // Save slug
  const handleSlugSave = async () => {
    if (!list || !listId || slugStatus !== 'available') return;
    setSaving(true);
    try {
      // Remove old slug if exists
      if (list.slug && list.slug !== slugInput) {
        await deleteDoc(doc(db, 'slugs', list.slug));
      }
      // Set new slug
      if (slugInput) {
        await setDoc(doc(db, 'slugs', slugInput), { listId });
      }
      await updateDoc(doc(db, 'lists', listId), { slug: slugInput, updatedAt: Timestamp.now() });
      setList({ ...list, slug: slugInput });
    } catch (err) {
      console.error('Slug save failed:', err);
    }
    setSaving(false);
  };

  // Publish toggle
  const togglePublish = async () => {
    if (!list || !listId) return;
    const newPublished = !list.published;
    setList({ ...list, published: newPublished });
    await saveList({ published: newPublished });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-haru-orange border-t-transparent" />
      </div>
    );
  }

  if (!list) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-haru-brown">編輯清單</h1>
        <div className="flex items-center gap-3">
          {saving && (
            <span className="text-sm text-haru-brown/40 flex items-center gap-1">
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              儲存中...
            </span>
          )}
          <button
            onClick={togglePublish}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              list.published
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-haru-cream text-haru-brown hover:bg-haru-orange/20'
            }`}
          >
            {list.published ? '✓ 已發布' : '發布'}
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-4 mb-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => saveList({ title })}
          placeholder="為你的清單命名..."
          className="w-full text-xl font-bold text-haru-brown bg-transparent border-b-2 border-haru-cream focus:border-haru-orange outline-none pb-2 transition-colors placeholder-haru-brown/30"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => saveList({ description })}
          placeholder="新增描述（選填）..."
          rows={2}
          className="w-full text-haru-brown/70 bg-transparent border-b border-haru-cream focus:border-haru-orange outline-none pb-2 resize-none transition-colors placeholder-haru-brown/30"
        />
      </div>

      {/* Custom URL / Slug */}
      <div className="mb-8 p-4 bg-white rounded-xl border border-haru-cream">
        <label className="block text-sm font-medium text-haru-brown/60 mb-2">自訂網址</label>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-haru-brown/40 whitespace-nowrap">
            {window.location.origin}/l/
          </span>
          <input
            type="text"
            value={slugInput}
            onChange={(e) => {
              const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
              setSlugInput(val);
              checkSlug(val);
            }}
            placeholder="my-link-list"
            className="flex-1 px-3 py-2 text-sm bg-haru-cream-light rounded-lg border border-haru-cream focus:border-haru-orange outline-none text-haru-brown transition-colors"
          />
          <button
            onClick={handleSlugSave}
            disabled={slugStatus !== 'available' || !slugInput}
            className="px-4 py-2 text-sm font-medium bg-haru-brown text-white rounded-lg hover:bg-haru-burnt transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            儲存
          </button>
        </div>
        {slugStatus === 'checking' && <p className="text-xs text-haru-brown/40 mt-1">檢查中...</p>}
        {slugStatus === 'available' && <p className="text-xs text-green-600 mt-1">✓ 可以使用</p>}
        {slugStatus === 'taken' && <p className="text-xs text-haru-red mt-1">✗ 已被使用</p>}
        {list.published && list.slug && (
          <p className="text-xs text-haru-brown/50 mt-2">
            公開網址：{' '}
            <a
              href={`/l/${list.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-haru-orange hover:underline"
            >
              {window.location.origin}/l/{list.slug}
            </a>
          </p>
        )}
      </div>

      {/* Add URL */}
      <form onSubmit={handleAddUrl} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="新增另一個連結..."
            className="flex-1 px-4 py-3 bg-white rounded-xl border border-haru-cream focus:border-haru-orange outline-none text-haru-brown transition-colors placeholder-haru-brown/30"
            disabled={addingUrl}
          />
          <button
            type="submit"
            disabled={addingUrl || !newUrl.trim()}
            className="px-5 py-3 bg-haru-orange text-white font-medium rounded-xl hover:bg-haru-burnt transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {addingUrl ? '...' : '+ 新增'}
          </button>
        </div>
      </form>

      {/* Link List */}
      {list.items.length === 0 ? (
        <div className="text-center py-16 text-haru-brown/30">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <p>尚無連結，在上方新增你的第一個連結！</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={list.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {list.items.map((item) => (
                <SortableLinkCard
                  key={item.id}
                  item={item}
                  onUpdate={(updates) => updateItem(item.id, updates)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
