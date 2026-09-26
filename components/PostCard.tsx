"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

// 投稿データの型定義
type Post = {
  id: number;
  user_id: string;
  content: string;
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
  // 編集モードの状態管理
  const [isEditing, setIsEditing] = useState(false);

  // 編集用の投稿内容の状態管理
  const [editContent, setEditContent] = useState(post.content);

  // 投稿編集ボタンのクリックハンドラー
  const handleUpdate = async () => {
    if (!editContent.trim()) {
      alert("投稿内容を入力してください");
      return;
    }

    const { error } = await supabase
      .from("posts")
      .update({
        content: editContent.trim(),
      })
      .eq("id", post.id);

    if (error) {
      alert(error.message);
      return;
    }

    post.content = editContent.trim();
    setIsEditing(false);
  };

  return (
    <div>
      {/* 投稿内容 */}
      {isEditing ? (
        <>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
          />

          <button onClick={handleUpdate}>
            保存
          </button>

          <button onClick={() => setIsEditing(false)}>
            キャンセル
          </button>
        </>
      ) : (
        <Link href={`/post/${post.id}`}>
          <p>{post.content}</p>
        </Link>
      )}

      {/* 投稿者本人のみ編集・削除できる */}
      {post.user_id === userId && (
        <>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)}>
              [編集]
            </button>
          )}

          <button onClick={() => onDelete(post.id)}>
            [削除]
          </button>
        </>
      )}

      <hr />
    </div>
  );
}