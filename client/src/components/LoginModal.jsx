import { useEffect } from "react";
import { z } from "zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { setUser } from "../store/userStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "./Modal";
import { useSearchParams } from "react-router-dom";

const schema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export function LoginModal({ isOpen, onClose }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(schema),
    });
    
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (isOpen) {
            reset();
            const verified = searchParams.get("verified");
            if (verified === "true") {
                toast.success("Email verified successfully! You can now log in.");
            } else if (verified === "false") {
                toast.error("Email verification failed or link expired.");
            }
        }
    }, [isOpen, reset, searchParams]);

    const onSubmit = async (data) => {
        try {
            const res = await axios.post(
                "http://localhost:5050/api/auth/login",
                data,
                { withCredentials: true }
            );

            setUser(res.data.user);
            toast.success("Logged in successfully");
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
        }
    };

    const onError = (errors) => {
        Object.values(errors).forEach((err) => {
            toast.error(err.message);
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Login" size="sm">
            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
                <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
                    <input
                        type="email"
                        placeholder="your@email.com"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1.5">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        autoComplete="off"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1.5">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer text-center mt-6"
                >
                    Login
                </button>
            </form>
        </Modal>
    );
}
