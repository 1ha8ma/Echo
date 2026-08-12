"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// 投稿データの型定義
type Post = {
  id: number;
  user_id: string;
  content: string;

  // 共感データの型定義
  empathies: {
    id: number;
    user_id: string;
  }[];

  // コメントデータの型定義
  comments: {
    id: number;
    user_id: string;
    content: string;
    created_at: string;
  }[];
};

// PostCardコンポーネントのプロパティ型定義
type Props = {
  post: Post;
  userId: string;
  onDelete: (postId: number) => void;
};

// PostCardコンポーネントの定義
export default function PostCard({
  post,
  userId,
  onDelete,
}: Props) {
  const [empathies, setEmpathies] = useState(post.empathies);

  // 共感済みかどうかを判定
  const hasEmpathy = empathies.some(
    (empathy) => empathy.user_id === userId
  );

  // 共感ボタンのクリックハンドラー
  const handleEmpathy = async () => {
    if (!userId) {
      alert("ログインしてください");
      return;
    }

    // 共感済みの場合は共感を解除、未共感の場合は共感を追加
    if (hasEmpathy) {
      // 共感解除
      const { error } = await supabase
        .from("empathies")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", userId);

      if (error) {
        alert(error.message);
        return;
      }

      // 共感解除後の状態を更新
      setEmpathies(
        empathies.filter(
          (empathy) => empathy.user_id !== userId
        )
      );
    } else {
      // 共感
      const { data, error } = await supabase
        .from("empathies")
        .insert({
          post_id: post.id,
          user_id: userId,
        })
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setEmpathies([...empathies, data]);
    }
  };

  return (
    <div>
        {/* 投稿内容 */}
      <p>{post.content}</p>

      <p>共感：{empathies.length}</p>

        {/* 共感ボタン */}
      <button onClick={handleEmpathy}>
        {hasEmpathy ? "共感を取り消す" : "共感する"}
      </button>

        {/* コメント */}
      <div>
        <h3>コメント</h3>
        {post.comments.map((comment) => (
            <div key={comment.id}>
            <p>{comment.content}</p>
            </div>
        ))}
        </div>

        {/* 削除ボタン */}
      {post.user_id === userId && (
        <button onClick={() => onDelete(post.id)}>
          削除
        </button>
      )}

      <hr />
    </div>
  );
}