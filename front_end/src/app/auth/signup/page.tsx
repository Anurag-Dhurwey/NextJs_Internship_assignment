"use client";
import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { signIn, useSession } from "next-auth/react";
import { signUp } from "next-auth-sanity/client";
import { message } from "antd";
import { redirect } from "next/navigation";
const SignUp = () => {
  const { data: session } = useSession();
  const [form, setForm] = useState<{
    name: string;
    email: string;
    password: string;
    confirm_password: string;
  }>({ name: "", email: "", password: "", confirm_password: "" });

  async function onSubmitHnadler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      alert("both password and confirm password are not same");
      return;
    }
    try {
      await signUp({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      await signIn("sanity-login", {
        callbackUrl: "/",
        email: form.email,
        password: form.password,
      });
    } catch (error) {
      message.error("something went wrong");
      console.error(error);
    }
  }

  function onChangeHandler(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  }

  useEffect(() => {
    function validateReq() {
      !session && redirect("/");
    }
    validateReq();
  }, [session]);

  return (
    <section className="bg-slate-600 h-screen flex justify-center items-center flex-col gap-2">
      <form
        onSubmit={(e) => onSubmitHnadler(e)}
        className="bg-slate-400 rounded-md max-w-[600px] w-full p-5 flex justify-center items-center flex-col gap-2"
      >
        <p className="">
          Already have an account ={">"}{" "}
          <Button variant="text" onClick={() => signIn()}>
            SignIn
          </Button>
        </p>
        <TextField
          required
          fullWidth
          label="Name"
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={(e) => onChangeHandler(e)}
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          id="email"
          name="email"
          onChange={(e) => onChangeHandler(e)}
          value={form.email}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          id="password"
          name="password"
          onChange={(e) => onChangeHandler(e)}
          value={form.password}
        />
        <TextField
          fullWidth
          label="Confirme password"
          type="password"
          id="confirm_password"
          name="confirm_password"
          onChange={(e) => onChangeHandler(e)}
          value={form.confirm_password}
        />
        <Button type="submit" variant="contained">
          SignUp
        </Button>
      </form>
    </section>
  );
};

export default SignUp;
