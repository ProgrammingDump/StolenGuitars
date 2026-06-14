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
            >
                <div className="flex flex-col gap-4">
                    <div className="input-window">
                        <div className="border-b mb-1 w-full">
                            <input
                                type="text"
                                placeholder="Username"
                                autoComplete="off"
                                className="focus:outline-none w-full bg-black text-white"
                                {...register("username")}
                            />
                        </div>
                    </div>

                    <div className="input-window">
                        <div className="border-b mb-1 w-full">
                            <input
                                type="email"
                                placeholder="Email"
                                className="focus:outline-none w-full bg-black text-white"
                                {...register("email")}
                            />
                        </div>
                    </div>

                    <div className="input-window">
                        <div className="border-b mb-1 w-full">
                            <input
                                type="password"
                                placeholder="Password"
                                autoComplete="new-password"
                                className="focus:outline-none w-full bg-black text-white"
                                {...register("password")}
                            />
                        </div>
                    </div>

                    <div className="input-window">
                        <div className="border-b mb-1 w-full">
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                autoComplete="new-password"
                                className="focus:outline-none w-full bg-black text-white"
                                {...register("confirmPassword")}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-violet-500/15 text-white p-2 rounded-md hover:bg-violet-500/25 transition-colors"
                    >
                        Sign Up
                    </button>

                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-white text-sm hover:opacity-80 transition-opacity"
                    >
                        Already have an account? Log in here
                    </button>
                </div>
            </form>
        </Modal>
    );
}
