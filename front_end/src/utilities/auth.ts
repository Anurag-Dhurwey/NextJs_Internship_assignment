import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import {client} from './sanityClient'
import { SanityAdapter, SanityCredentials } from 'next-auth-sanity';
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.NEXT_PUBLIC_EMAIL_SERVER_HOST,
        port: process.env.NEXT_PUBLIC_EMAIL_SERVER_PORT,
        auth: {
          user: process.env.NEXT_PUBLIC_EMAIL_SERVER_USER,
          pass: process.env.NEXT_PUBLIC_EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.NEXT_PUBLIC_EMAIL_FROM
    }),
    GitHubProvider({
      clientId: `${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`,
      clientSecret: `${process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET}`
    }),
    GoogleProvider({
      clientId: `${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET}`
    }),
  ],
  adapter: SanityAdapter(client,{
    schemas: {
      verificationToken: 'verification-token',
      account: 'account',
      user: 'user'
    }
  }),
  callbacks: {
    async jwt({ token, account }) {
   
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      (session as any).user.accessToken  = token.accessToken
      return session
    },
    // async signIn({ user, account, profile, email, credentials }) {
    //   const isAllowedToSignIn = true
    //   if (isAllowedToSignIn) {
    //     return true
    //   } else {
    //     // Return false to display a default error message
    //     return false
    //     // Or you can return a URL to redirect to:
    //     // return '/unauthorized'
    //   }
    // }
  }
};




