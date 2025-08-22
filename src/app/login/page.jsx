
"use client";
import styles from "./page.module.css";
import { useState } from "react";
import { loginUser, signUpUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";


const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await signIn("credentials", {
        redirect: false, 
        username,
        password,
        });

        if (result?.error) {
        console.error("Login failed:", result.error);
        } else {
        console.log("Login success:", result);
        router.push("/admin");
        }
    };
    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const user = await signUpUser(username, password);
            console.log("Signed up user:", user);
        } catch (error) {
            console.error("Signup failed:", error);
        }
    };


    return (
        <div className={styles.body}>
            <main className={styles.main}>
                <div>
                    <input className={styles.chk} type="checkbox" id="chk" aria-hidden="true"></input>
                    <div className={styles.signup}>
                        <form onSubmit={handleSignup}>
                        <label className={styles.label} htmlFor="chk" aria-hidden="true">Sign up</label>
                        <input className={styles.input} type="text" name="txt" placeholder="Notandanafn" required value={username}
          onChange={(e) => setUsername(e.target.value)}/>
                        <input className={styles.input} type="email" name="email" placeholder="Netfang" required />
                        <input className={styles.input} type="password" name="pswd" placeholder="Lykilorð" required value={password}
          onChange={(e) => setPassword(e.target.value)}/>
                        <input className={styles.input} type="password" name="pswdc" placeholder="Staðfesta lykilorð" required />
                        <button className={styles.button}>Sign up</button>
                    </form>
                </div>

                <div className={styles.login}>
                    <form onSubmit={handleLogin}>
                        <label className={styles.label} htmlFor="chk" aria-hidden="true">Login</label>
                        <input className={styles.input} type="text" name="email" placeholder="Notandanafn" required value={username}
          onChange={(e) => setUsername(e.target.value)}/>
                        <input className={styles.input} type="password" name="pswd" placeholder="Lykilorð" required value={password}
          onChange={(e) => setPassword(e.target.value)}/>
                        <button className={styles.button}>Login</button>
                    </form>
                </div>
            </div>
        </main>
        </div>
    );
}
export default Login;