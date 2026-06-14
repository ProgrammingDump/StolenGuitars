import { useEffect } from "react";
import { z } from "zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { setUser } from "../store/userStore";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const verified = searchParams.get("verified");

    useEffect(() => {
        if (verified === "true") {
            toast.success("Email verified successfully! You can now log in.");
        } else if (verified === "false") {
            toast.error("Email verification failed or link expired.");
        }
    }, [verified]);

    const onSubmit = async (data) => {
        try {
            const res = await axios.post(
                "http://localhost:5050/api/auth/login",
                data,
                { withCredentials: true }
            );

            setUser(res.data.user);

            toast.success("Logged in successfully")
            console.log(res.data)
            navigate("/");
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
        <div className="w-max min-h-screen flex items-center mx-auto">
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <div className="flex flex-col gap-4">

                    <div className="input-window mb-2">
                        <div className="border-b mb-5 w-52">
                            <input
                                type="email"
                                placeholder="Email"
                                className="focus:outline-none"
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
                        <div className="border-b mb-1 w-52">
                            <input
                                type="password"
                                placeholder="Password"
                                autoComplete="off"
                                className="focus:outline-none"
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
                        className="bg-violet-500/15 text-white p-2 rounded-md cursor-pointer"
                    >
                        Login
                    </button>

                    <Link
                        to="/signup"
                        className="text-white text-center no-underline hover:opacity-80 mt-1 cursor-pointer"
                    >
                        (need an account? register here)
                    </Link>

                </div>
            </form>
        </div>
    );
}

export default Login;