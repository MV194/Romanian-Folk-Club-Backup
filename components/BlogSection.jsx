import { useState } from 'react'
import { useBlog } from '../hooks/useBlog'
import { useT } from '../lib/i18n.jsx'
import { useAuth } from '../hooks/useAuth'
import { Heart, MessageCircle, User, Calendar, ArrowRight, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function BlogSection() {
  const t = useT()
  const { posts, loading, toggleLike, addComment } = useBlog()
  const [selectedPost, setSelectedPost] = useState(null)

  if (loading && posts.length === 0) {
    return (
      <section id="blog" style={{ padding: '100px 20px', background: 'var(--parchment)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', color: 'var(--ink)', marginBottom: '40px' }}>{t('nav.blog') || 'Blog'}</h2>
          <p style={{ color: 'var(--muted)' }}>Loading stories...</p>
        </div>
      </section>
    )
  }

  if (posts.length === 0) return null

  return (
    <section id="blog" style={{ padding: '100px 20px', background: 'var(--parchment)' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', color: 'var(--ink)', marginBottom: '16px' }}>
            {t('nav.blog') || 'Blog'}
          </h2>
          <div style={{ width: '80px', height: '4px', background: 'var(--gold)', margin: '0 auto 24px' }}></div>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Stories, traditions, and updates from our community.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
          gap: '32px' 
        }}>
          {posts.map(post => (
            <BlogCard key={post.id} post={post} onClick={() => setSelectedPost(post)} onLike={() => toggleLike(post.id)} />
          ))}
        </div>
      </div>

      {selectedPost && (
        <BlogModal 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)} 
          onLike={() => toggleLike(selectedPost.id)}
          onComment={(content) => addComment(selectedPost.id, content)}
        />
      )}
    </section>
  )
}

function BlogCard({ post, onClick, onLike }) {
  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: '16px', 
      overflow: 'hidden', 
      boxShadow: '0 10px 30px rgba(0,0,0,.05)',
      transition: 'transform .3s ease',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    onClick={onClick}
    >
      <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
        <img 
          src={post.cover_image || 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&q=80'} 
          alt={post.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ 
          position: 'absolute', top: '16px', right: '16px', 
          background: 'rgba(255,255,255,.9)', padding: '4px 12px', 
          borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: 'var(--ink)'
        }}>
          {post.tags?.[0] || 'Culture'}
        </div>
      </div>
      
      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontSize: '12px', color: 'var(--muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} /> {new Date(post.created_at).toLocaleDateString()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={14} /> {post.author?.name || 'Admin'}
          </span>
        </div>
        
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: 'var(--ink)', marginBottom: '12px', lineHeight: 1.3 }}>
          {post.title}
        </h3>
        
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
          {post.excerpt}
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); onLike(); }}
              style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: post.isLiked ? 'var(--red)' : 'var(--muted)', cursor: 'pointer', fontSize: '13px' }}
            >
              <Heart size={16} fill={post.isLiked ? 'currentColor' : 'none'} /> {post.likeCount}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '13px' }}>
              <MessageCircle size={16} /> {post.commentCount}
            </div>
          </div>
          <div style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600' }}>
            Read More <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  )
}

function BlogModal({ post, onClose, onLike, onComment }) {
  const { profile } = useAuth()
  const [comment, setComment] = useState('')

  return (
    <div style={{ 
      position: 'fixed', inset: 0, zIndex: 2000, 
      background: 'rgba(26,10,0,.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }} onClick={onClose}>
      <div style={{ 
        width: '100%', maxWidth: '900px', maxHeight: '90vh', 
        background: '#fff', borderRadius: '24px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', position: 'relative',
        animation: 'modalIn .3s ease'
      }} onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} style={{ 
          position: 'absolute', top: '20px', right: '20px', zIndex: 10,
          background: 'rgba(0,0,0,.5)', color: '#fff', border: 'none', 
          width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}><X size={20} /></button>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ height: '400px', width: '100%', position: 'relative' }}>
            <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ 
              position: 'absolute', inset: 0, 
              background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,.8))',
              display: 'flex', alignItems: 'flex-end', padding: '40px'
            }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {post.tags?.map(t => (
                    <span key={t} style={{ background: 'var(--gold)', color: 'var(--ink)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>{t}</span>
                  ))}
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', color: '#fff', margin: 0, lineHeight: 1.2 }}>{post.title}</h2>
              </div>
            </div>
          </div>

          <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: post.author?.avatar_color || 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700' }}>
                {post.author?.avatar_letters || 'AD'}
              </div>
              <div>
                <div style={{ fontWeight: '700', color: 'var(--ink)' }}>{post.author?.name || 'Admin'}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{new Date(post.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '20px' }}>
                <button onClick={onLike} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: post.isLiked ? 'var(--red)' : 'var(--muted)', cursor: 'pointer', fontWeight: '600' }}>
                  <Heart size={20} fill={post.isLiked ? 'currentColor' : 'none'} /> {post.likeCount}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontWeight: '600' }}>
                  <MessageCircle size={20} /> {post.commentCount}
                </div>
              </div>
            </div>

            <div className="prose" style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: '1.1rem' }}>
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '24px' }}>Comments ({post.commentCount})</h3>
              
              {profile ? (
                <div style={{ marginBottom: '40px' }}>
                  <textarea 
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1.5px solid var(--border)', fontFamily: 'inherit', minHeight: '100px', marginBottom: '12px', outline: 'none' }}
                  />
                  <button 
                    onClick={() => { onComment(comment); setComment(''); }}
                    style={{ background: 'var(--red)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                  >Post Comment</button>
                </div>
              ) : (
                <p style={{ background: 'var(--parchment)', padding: '16px', borderRadius: '12px', color: 'var(--muted)', textAlign: 'center', marginBottom: '40px' }}>
                  Please log in to join the conversation.
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {post.comments?.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: c.user?.avatar_color || 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                      {c.user?.avatar_letters || 'U'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--ink)' }}>{c.user?.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: 'var(--text)', lineHeight: 1.5 }}>{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .prose h1, .prose h2, .prose h3 { font-family: 'Playfair Display', serif; color: var(--ink); margin-top: 2em; }
        .prose p { margin-bottom: 1.5em; }
        .prose ul { padding-left: 1.5em; margin-bottom: 1.5em; }
        .prose li { margin-bottom: 0.5em; }
      `}</style>
    </div>
  )
}
