"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Post = {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  empathies: {
    id: number;
    user_id: string;
  }[];
};

export default function PostDetail() {
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          empathies (
            id,
            user_id
          )
        `)
        .eq("id", Number(id))
        .single();

      console.log("ID:", id);
      console.log("取得した投稿:", data);
      console.log("エラー:", error);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setPost(data);
      setLoading(false);
    };

    getPost();
  }, [id]);

  if (loading) {
    return <p>読み込み中...</p>;
  }

  if (!post) {
    return <p>投稿が見つかりません。</p>;
  }

  return (
    <main>
      <h1>投稿詳細</h1>

      <p>{post.content}</p>

      <p>{post.created_at}</p>

      <p>共感数：{post.empathies.length}</p>
    </main>
  );
}