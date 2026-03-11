import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { LinkItem } from '../types';

interface Props {
  item: LinkItem;
  onUpdate: (updates: Partial<LinkItem>) => void;
  onDelete: () => void;
}

export default function SortableLinkCard({ item, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.customTitle ?? item.ogTitle);
  const [editDesc, setEditDesc] = useState(item.customDescription ?? item.ogDescription);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as const,
  };

  const displayTitle = item.customTitle ?? item.ogTitle ?? '';
  const displayDesc = item.customDescription ?? item.ogDescription ?? '';
  const isLoading = !item.ogTitle && !item.customTitle;

  const handleSaveEdit = () => {
    onUpdate({
      customTitle: editTitle || null,
      customDescription: editDesc || null,
    });
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border border-haru-cream overflow-hidden group hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div className="flex">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center px-2 cursor-grab active:cursor-grabbing text-haru-brown/20 hover:text-haru-brown/40 transition-colors"
          title="拖曳以重新排序"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 112 0 2 2 0 01-2 0zm6 0a2 2 0 112 0 2 2 0 01-2 0zM8 12a2 2 0 112 0 2 2 0 01-2 0zm6 0a2 2 0 112 0 2 2 0 01-2 0zM8 18a2 2 0 112 0 2 2 0 01-2 0zm6 0a2 2 0 112 0 2 2 0 01-2 0z" />
          </svg>
        </div>

        {/* OG Image */}
        {item.ogImage && (
          <div className="w-24 h-24 sm:w-32 sm:h-24 flex-shrink-0">
            <img
              src={item.ogImage}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-3 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="標題"
                className="w-full px-2 py-1 text-sm border border-haru-cream rounded-lg focus:border-haru-orange outline-none text-haru-brown"
                autoFocus
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="描述"
                rows={2}
                className="w-full px-2 py-1 text-sm border border-haru-cream rounded-lg focus:border-haru-orange outline-none text-haru-brown/70 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-xs font-medium bg-haru-brown text-white rounded-lg hover:bg-haru-burnt transition-colors cursor-pointer"
                >
                  儲存
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1 text-xs font-medium text-haru-brown/50 hover:text-haru-brown transition-colors cursor-pointer"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <>
              {isLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-haru-cream rounded w-3/4" />
                  <div className="h-3 bg-haru-cream rounded w-full" />
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-sm text-haru-brown truncate">
                    {displayTitle || '未命名'}
                  </h3>
                  {displayDesc && (
                    <p className="text-xs text-haru-brown/50 mt-0.5 line-clamp-2">{displayDesc}</p>
                  )}
                </>
              )}
              <p className="text-xs text-haru-orange/70 mt-1 truncate">{item.url}</p>
            </>
          )}
        </div>

        {/* Actions */}
        {!editing && (
          <div className="flex flex-col justify-center gap-1 pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                setEditTitle(item.customTitle ?? item.ogTitle);
                setEditDesc(item.customDescription ?? item.ogDescription);
                setEditing(true);
              }}
              className="p-1.5 text-haru-brown/30 hover:text-haru-orange transition-colors cursor-pointer"
              title="編輯"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-haru-brown/30 hover:text-haru-red transition-colors cursor-pointer"
              title="刪除"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
