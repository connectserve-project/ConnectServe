import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { postService } from '../services/postService';
import { PostCard } from '../components/posts/PostCard';
import { PostCardSkeleton } from '../components/common/Skeleton';
import toast from 'react-hot-toast';

export const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await postService.getPostById(id);
        if (res.success && res.data) {
          setPost(res.data.post);
        } else {
          toast.error('Post not found.');
        }
      } catch (err) {
        toast.error('Failed to load post.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fadeIn">
      {loading ? (
        <PostCardSkeleton />
      ) : post ? (
        <PostCard post={post} />
      ) : (
        <div className="text-center text-slate-400 py-12">Post not found.</div>
      )}
    </div>
  );
};