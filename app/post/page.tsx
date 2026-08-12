"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function PostPage() {
  const [content, setContent] = useState("");
  const router=useRouter();

  const handlePost = async () => {
    // ログインユーザー取得
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("ログインしてください");
      return;
    }

    const { error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content: content,
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("投稿しました");

    // 投稿後にトップページにリダイレクト
    router.push("/");
  };



  return (
    <main>
      <h1>投稿作成</h1>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="今の気持ちを書いてみよう..."
        rows={5}
      />

      <br />

      <button onClick={handlePost}>
        投稿
      </button>
    </main>
  );
}