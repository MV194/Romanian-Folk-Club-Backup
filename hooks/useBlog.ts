import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useBlog() {
  const { profile } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:profiles(name, avatar_letters, avatar_color),
        likes:blog_likes(user_id),
        comments:blog_comments(
          id,
          content,
          created_at,
          user:profiles(name, avatar_letters, avatar_color)
        )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (!error) {
      const processed = data.map(post => ({
        ...post,
        likeCount: post.likes?.length || 0,
        isLiked: post.likes?.some(l => l.user_id === profile?.id),
        commentCount: post.comments?.length || 0
      }))
      setPosts(processed)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [profile?.id])

  const toggleLike = async (postId: string) => {
    if (!profile) return false

    const post = posts.find(p => p.id === postId)
    if (!post) return false

    if (post.isLiked) {
      await supabase.from('blog_likes').delete().eq('post_id', postId).eq('user_id', profile.id)
    } else {
      await supabase.from('blog_likes').insert({ post_id: postId, user_id: profile.id })
    }
    
    fetchPosts()
    return true
  }

  const addComment = async (postId: string, content: string) => {
    if (!profile || !content.trim()) return false
    const { error } = await supabase.from('blog_comments').insert({
      post_id: postId,
      user_id: profile.id,
      content: content.trim()
    })
    if (!error) {
      fetchPosts()
      return true
    }
    return false
  }

  return { posts, loading, toggleLike, addComment, refresh: fetchPosts }
}
