import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Modal } from "./Modal";

const schema = z
    .object({
        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .regex(/^\S+$/, "Username must be a single word without spaces")
            .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

function toastError(error, message = "Something went wrong") {
    if (error.response?.data?.message) {
        toast.error(error.response.data.message);
    } else {
        toast.error(message);
    }
}

function showValidationErrors(errors) {
    Object.values(errors).forEach((error) => {
        if (error?.message) {
            toast.error(error.message);
        }
    });
}

export function SignUpModal({ isOpen, onClose, onSwitchToLogin }) {
    const { register, handleSubmit, reset } = useForm({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    const onSubmit = async (data) => {
        try {
            const res = await axios.post(
                "http://localhost:5050/api/auth/signup",
                {
                    username: data.username,
                    email: data.email,
                    password: data.password,
                },
                { withCredentials: true }
            );

            toast.success(res.data?.message || "Signed up successfully! Check your email to verify.");
            onClose();
            onSwitchToLogin();
        } catch (err) {
            toastError(err, "Sign up failed");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Sign Up" size="sm">
            <form
                onSubmit={handleSubmit(
                    onSubmit,
                    (errors) => showValidationErrors(errors)
                )}
                className="space-y-4"
            >
                <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Username</label>
                    <input
                        type="text"
                        placeholder="Choose a username"
                        autoComplete="off"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                        {...register("username")}
                    />
                </div>

                <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
                    <input
                        type="email"
                        placeholder="your@email.com"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                        {...register("email")}
                    />
                </div>

                <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
                    <input
                        type="password"
                        placeholder="Create a password"
                        autoComplete="new-password"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                        {...register("password")}
                    />
                </div>

                <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Confirm Password</label>
                    <input
                        type="password"
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                        {...register("confirmPassword")}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer text-center mt-6"
                >
                    Sign Up
                </button>

                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="w-full text-white text-sm hover:opacity-80 transition-opacity py-2"
                >
                    Already have an account? Log in here
                </button>
            </form>
        </Modal>
    );
}
