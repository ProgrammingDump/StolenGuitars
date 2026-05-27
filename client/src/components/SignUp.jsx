import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

const schema = z
    .object({
        username: z.string().min(3, "Username must be at least 3 characters"),
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

function SignUp() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

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

            console.log("Signed up successfully", res.data);
        } catch (err) {
            console.error(err.response?.data);
        }
    };

    return (
        <div className="w-max min-h-screen flex items-center mx-auto">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-4">

                    <div className="input-window">
                        <div className="border-b-2 mb-1 w-52">
                            <input
                                type="text"
                                placeholder="Username"
                                className="focus:outline-none"
                                {...register("username")}
                            />
                        </div>
                        {errors.username && (
                            <p className="text-red-500 text-sm">
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    <div className="input-window">
                        <div className="border-b-2 mb-1 w-52">
                            <input
                                type="email"
                                placeholder="Email"
                                className="focus:outline-none"
                                {...register("email")}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-500 text-sm">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="input-window">
                        <div className="border-b-2 mb-1 w-52">
                            <input
                                type="password"
                                placeholder="Password"
                                className="focus:outline-none"
                                {...register("password")}
                            />
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-sm">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div className="input-window">
                        <div className="border-b-2 mb-1 w-52">
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                className="focus:outline-none"
                                {...register("confirmPassword")}
                            />
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="bg-violet-500/15 text-white p-2 rounded-md"
                    >
                        Sign Up
                    </button>

                </div>
            </form>
        </div>
    );
}

export default SignUp;