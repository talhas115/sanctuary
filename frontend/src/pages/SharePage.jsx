import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Globe, Clock, Book } from 'lucide-react';
import axios from 'axios';
import { decryptContent } from '../utils/crypto';

// Use a separate axios instance to avoid needing an auth token
const publicApi = axios.create({
  baseURL: 'http://localhost:5028/api'
});

const SharePage = () => {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedEntry = async () => {
      setIsLoading(true);
      try {
        const response = await publicApi.get(`/public/${id}`);
        let data = response.data;

        // If the shared entry is encrypted, we attempt decryption with default key.
        if (data.isEncrypted && data.content) {
          data.content = decryptContent(data.content);
        }

        setEntry(data);
      } catch (err) {
        console.error('Failed to fetch shared entry', err);
        setError('This shared entry does not exist or the link has expired.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedEntry();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-low p-4">
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 text-center max-w-md w-full">
          <Globe className="w-12 h-12 text-outline mx-auto mb-4" />
          <h1 className="text-headline-md font-bold text-on-surface mb-2">Entry Unavailable</h1>
          <p className="text-body-standard text-on-surface-variant mb-6">{error}</p>
          <Link to="/login" className="text-primary font-medium hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-low p-4 sm:p-8 flex flex-col">
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Book className="w-6 h-6" />
          Sanctuary Journal
        </div>
        <Link to="/login" className="text-body-standard font-medium text-on-surface-variant hover:text-on-surface">
          Sign In
        </Link>
      </header>

      <main className="max-w-3xl w-full mx-auto flex-1 animate-in fade-in pb-24">
        <article className="bg-surface-container-lowest p-6 sm:p-10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30">
          <header className="mb-8 border-b border-outline-variant/30 pb-6">
            <h1 className="text-display-xl text-on-surface mb-4 leading-tight">{entry.title || 'Untitled'}</h1>

            <div className="flex flex-wrap items-center gap-4 text-label-caps text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {new Date(entry.date || entry.createdAt).toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 text-secondary">
                <Globe className="w-4 h-4" />
                Public Shared View
              </div>
            </div>

            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {entry.tags.map(t => {
                  const tagName = typeof t === 'object' ? t.name : t;
                  return (
                    <span key={tagName} className="px-2.5 py-1 bg-surface-container rounded-md text-body-standard text-on-surface">
                      #{tagName}
                    </span>
                  )
                })}
              </div>
            )}
          </header>

          <div
            className="prose prose-p:text-body-journal prose-p:text-on-surface prose-p:mb-4 prose-headings:font-bold prose-headings:text-on-surface prose-a:text-primary max-w-none"
            dangerouslySetInnerHTML={{ __html: entry.content || '<p class="text-on-surface-variant italic">No content</p>' }}
          />
        </article>
      </main>
    </div>
  );
};

export default SharePage;
