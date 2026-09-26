"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import PostCard from "@/components/PostCard";

export default function Home() {
  const [email, setEmail] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // ログインユーザーの取得
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // ユーザーが存在する場合、メールアドレスとユーザーIDを状態に設定
      if (user) {
        setEmail(user.email ?? "");
        setUserId(user.id);
      }
    };

    // 投稿一覧の取得
    const getPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPosts(data);
      }
    };

    // コンポーネントのマウント時にユーザー情報と投稿一覧を取得
    getUser();
    getPosts();
  }, []);

  // 投稿削除のハンドラー
  const handleDelete = async (postId: number) => {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)

    if (error) {
      alert("削除に失敗しました");
      return;
    }

    setPosts(posts.filter(post => post.id !== postId));
  };

  return (
    <main>
      <h1>Echo</h1>

      <p>{email ? `ログイン中: ${email}` : "未ログイン"}</p>

      {/* 投稿ページへのリンク */}
      <Link href="/post">
        投稿する
      </Link>

      <h2>投稿一覧</h2>

      {/* 投稿を表示 */}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          userId={userId}
          onDelete={handleDelete}
        />
      ))}
    </main>
  );
}