"use client";

import {useState} from 'react';
import {supabase} from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function RegisterPage(){
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const router = useRouter(); //ページ遷移のためのフック

    //ユーザー登録処理
    const handleRegister=async()=>{
        //supabaseのauth.signUpを使用してユーザー登録
        const {error}=await supabase.auth.signUp({
            email,
            password
        });

        //エラーの場合エラー表示し終了
        if(error){
            alert(error.message);
            return;
        }

        //成功した場合はログインページへ遷移
        router.push("/login");
    };

    return(
        <main>
            <h1>ユーザー登録</h1>

            <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
            />

            <br />

            <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
            />

            <br />

            <button onClick={handleRegister}>登録</button>
        </main>
    );
}