import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { LinkItem } from '../types';

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    if (!user) {
      await signInWithGoogle();
      return;
    }

    setIsCreating(true);
    try {
      const firstItem: LinkItem = {
        id: crypto.randomUUID(),
        url: trimmed.startsWith('http') ? trimmed : `https://${trimmed}`,
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        customTitle: null,
        customDescription: null,
        order: 0,
      };

      const docRef = await addDoc(collection(db, 'lists'), {
        ownerId: user.uid,
        slug: '',
        title: 'My Link List',
        description: '',
        items: [firstItem],
        published: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      navigate(`/edit/${docRef.id}`);
    } catch (err) {
      console.error('Failed to create list:', err);
      setIsCreating(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-haru-orange/10 blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-haru-cream/60 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-haru-red/5 blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-32 pb-20">
        <div className="text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-haru-orange/10 border border-haru-orange/20 text-haru-burnt text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Simple. Beautiful. Shareable.
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-haru-brown leading-tight tracking-tight">
            Curate & share your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-haru-orange via-haru-burnt to-haru-red">
              link collections
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-haru-brown/60 max-w-2xl mx-auto leading-relaxed">
            Paste your favorite links, we'll fetch the previews automatically.
            Arrange them, give them a custom URL, and share with anyone.
          </p>

          {/* URL Input */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 max-w-xl mx-auto"
          >
            <div className="flex gap-3 p-2 bg-white rounded-2xl shadow-lg shadow-haru-brown/5 border border-haru-cream ring-1 ring-haru-cream/50">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your first link here..."
                className="flex-1 px-4 py-3 bg-transparent text-haru-brown placeholder-haru-brown/30 focus:outline-none text-base sm:text-lg"
                disabled={isCreating}
              />
              <button
                type="submit"
                disabled={isCreating || !url.trim()}
                className="px-6 py-3 bg-gradient-to-r from-haru-orange to-haru-burnt text-white font-semibold rounded-xl hover:shadow-md hover:shadow-haru-orange/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                {isCreating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create List →'
                )}
              </button>
            </div>
            {!user && (
              <p className="mt-3 text-sm text-haru-brown/40">
                You'll be asked to sign in with Google to save your list.
              </p>
            )}
          </form>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              title: 'Auto Previews',
              desc: 'Paste a URL and we fetch the title, description, and image automatically.',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              ),
              title: 'Drag to Reorder',
              desc: 'Arrange your links in any order. Drag and drop to get them just right.',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
              ),
              title: 'Custom URL',
              desc: 'Choose a memorable slug for your list and share it with a clean URL.',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-haru-cream hover:shadow-md hover:shadow-haru-orange/10 transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-haru-orange/10 text-haru-orange flex items-center justify-center mb-4 group-hover:bg-haru-orange group-hover:text-white transition-colors">
                {feature.icon}
              </div>
              <h3 className="font-bold text-haru-brown text-lg mb-1">{feature.title}</h3>
              <p className="text-haru-brown/60 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
