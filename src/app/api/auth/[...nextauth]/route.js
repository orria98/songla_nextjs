import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// NextAuth config
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials?.username,
              password: credentials?.password,
            }),
          }
        );

        const user = await res.json();
        if (res.ok && user) {
          return user; // returned object is saved in JWT
        }
        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Only add accessToken if present in user object
      if (user?.accessToken) {
        token.accessToken = user.accessToken;
      }
      // You can also add other user info if needed
      return token;
    },
    async session({ session, token }) {
      // Only add accessToken if present in token
      if (token?.accessToken) {
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // optional: custom login page
  },
};

// Route handler for NextAuth
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
