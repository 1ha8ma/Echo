"use client";

import Link from "next/link";
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

type Comment = {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
};

// 投稿詳細ページ
export default function PostDetail() {
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [loading, setLoading] = useState(true);

  // ログイン中のユーザーID
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const getData = async () => {
      // ログインユーザーを取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      }

      // 投稿を取得
      const { data: postData, error: postError } = await supabase
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

      if (postError) {
        console.error(postError);
        setLoading(false);
        return;
      }

      setPost(postData);

      // コメントを取得
      const { data: commentData, error: commentError } =
        await supabase
          .from("comments")
          .select("*")
          .eq("post_id", Number(id))
          .order("created_at", { ascending: true });

      if (commentError) {
        console.error(commentError);
      } else {
        setComments(commentData);
      }

      setLoading(false);
    };

    getData();
  }, [id]);

  // 共感済みかどうか
  const hasEmpathy =
    post?.empathies.some(
      (empathy) => empathy.user_id === userId
    ) ?? false;

  // 共感ボタン
  const handleEmpathy = async () => {
    if (!userId) {
      alert("ログインしてください");
      return;
    }

    if (!post) {
      return;
    }

    if (hasEmpathy) {
      const { error } = await supabase
        .from("empathies")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", userId);

      if (error) {
        alert(error.message);
        return;
      }

      setPost({
        ...post,
        empathies: post.empathies.filter(
          (empathy) => empathy.user_id !== userId
        ),
      });
    } else {
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

      setPost({
        ...post,
        empathies: [...post.empathies, data],
      });
    }
  };

  // コメント投稿
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
        post_id: post?.id,
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

  // コメント削除
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

  if (loading) {
    return <p>読み込み中...</p>;
  }

  if (!post) {
    return <p>投稿が見つかりません。</p>;
  }

  return (
    <main>
      <h1>投稿詳細</h1>

      {/* 投稿内容 */}
      <p>{post.content}</p>

      {/* 投稿日時 */}
      <p>{post.created_at}</p>

      {/* 共感数 */}
      <p>共感数：{post.empathies.length}</p>

      {/* 共感ボタン */}
      <button onClick={handleEmpathy}>
        {hasEmpathy ? "共感を取り消す" : "共感する"}
      </button>

      {/* コメント */}
      <h2>コメント</h2>
      
      {comments.length === 0 ? (
        <p>まだコメントはありません。</p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id}>
            <p>{comment.content}</p>
            <small>{comment.created_at}</small>

            {comment.user_id === userId && (
              <button onClick={() => handleDeleteComment(comment.id)}>
                削除
              </button>
            )}
          </div>
        ))
      )}

      {/* コメント入力 */}
      <div>
        <textarea
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder="コメントを入力してください"
        />

        <button onClick={handleComment}>
          コメントする
        </button>
      </div>

      {/*投稿一覧へ戻るリンク */}
      <Link href="/">
        ← 投稿一覧へ戻る
      </Link>

    </main>
  );
}