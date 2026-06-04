import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-hot-toast";

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

function SignUp() {
    const { register, handleSubmit } = useForm({
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

            toast.success("Signed up successfully");
            console.log("Signed up successfully", res.data);
        } catch (err) {
            toastError(err, "Sign up failed");
            console.error(err.response?.data);
        }
    };

    return (
        <div className="w-max min-h-screen flex items-center mx-auto">
            <form
                onSubmit={handleSubmit(
                    onSubmit,
                    (errors) => showValidationErrors(errors)
                )}
            >
                <div className="flex flex-col gap-4">
                    <div className="input-window">
                        <div className="border-b mb-1 w-52">
                            <input
                                type="text"
                                placeholder="Username"
                                className="focus:outline-none"
                                {...register("username")}
                            />
                        </div>
                    </div>

                    <div className="input-window">
                        <div className="border-b mb-1 w-52">
                            <input
                                type="email"
                                placeholder="Email"
                                className="focus:outline-none"
                                {...register("email")}
                            />
                        </div>
                    </div>

                    <div className="input-window">
                        <div className="border-b mb-1 w-52">
                            <input
                                type="password"
                                placeholder="Password"
                                className="focus:outline-none"
                                {...register("password")}
                            />
                        </div>
                    </div>

                    <div className="input-window">
                        <div className="border-b mb-1 w-52">
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                className="focus:outline-none"
                                {...register("confirmPassword")}
                            />
                        </div>
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