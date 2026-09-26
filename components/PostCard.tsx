"use client";

import Link from "next/link";
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
  const [empathies, setEmpathies] = useState(post.empathies);    // 共感データの状態管理
  const [commentContent, setCommentContent] = useState("");      // コメント入力の状態管理
  const [comments, setComments] = useState(post.comments);       // コメントデータの状態管理
  const [isEditing, setIsEditing] = useState(false);             // 編集モードの状態管理
  const [editContent, setEditContent] = useState(post.content);  // 編集用の投稿内容の状態管理

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

      // 共感追加後の状態を更新
      setEmpathies([...empathies, data]);
    }
  };

  // コメント投稿ボタンのクリックハンドラー
  const handleComment = async () => {
    if (!userId) {
      alert("ログインしてください");
      return;
    }

    if (!commentContent.trim()) {
      alert("コメントを入力してください");
      return;
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        user_id: userId,
        post_id: post.id,
        content: commentContent.trim(),
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setComments([...comments, data]);
    setCommentContent("");
  };

  // コメント削除ボタンのクリックハンドラー
  const handleDeleteComment = async (commentId: number) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      alert(error.message);
      return;
    }

    setComments(
      comments.filter((comment) => comment.id !== commentId)
    );
  };

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

      <p>共感：{empathies.length}</p>

      {/* 共感ボタン */}
      <button onClick={handleEmpathy}>
        {hasEmpathy ? "[共感を取り消す]" : "[共感する]"}
      </button>

      {/* コメント */}
      <div>
        <h3>[コメント]</h3>

        {/* コメントリスト */}
        {comments.map((comment) => (
          <div key={comment.id}>
            <p>{comment.content}</p>

            {/* 投稿者本人のみが編集・削除できる */}
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
          </div>
        ))}

        {/* コメント入力 */}
        <textarea
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder="コメントを書く..."
          rows={3}
        />

        <button onClick={handleComment}>
          [コメントする]
        </button>
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