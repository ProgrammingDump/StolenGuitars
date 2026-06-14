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
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <div className="flex flex-col gap-4">
                    <div className="input-window mb-2">
                        <div className="border-b mb-5 w-full">
                            <input
                                type="email"
                                placeholder="Email"
                                className="focus:outline-none w-full bg-black text-white"
                                {...register("email")}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-500 p-0 m-0 text-xs">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="input-window mb-5">
                        <div className="border-b mb-1 w-full">
                            <input
                                type="password"
                                placeholder="Password"
                                autoComplete="off"
                                className="focus:outline-none w-full bg-black text-white"
                                {...register("password")}
                            />
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="bg-violet-500/15 text-white p-2 rounded-md cursor-pointer hover:bg-violet-500/25 transition-colors"
                    >
                        Login
                    </button>
                </div>
            </form>
        </Modal>
    );
}
