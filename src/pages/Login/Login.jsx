import {useNavigate} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import AuthContext from "../../contexts/AuthProvider";
import axios from "../../api/axios";


import techShopLogo from "../../assets/images/logo/techShopLogo.svg";
import {Login} from "../../services/User/User";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {setAuth} = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await Login(email, password);

            if (response.status === 200) {
                if (response.data.status === "inactive") {
                    alert("Tài khoản đã ngừng hoạt động");
                    return;
                } else {
                    setAuth({email, password});
                    sessionStorage.setItem("token", response.data.token);
                    sessionStorage.setItem("role", response.data.role);
                    sessionStorage.setItem("menu", "home");
                    sessionStorage.setItem("userEmail", email);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                    window.location.href = "/home";
                }
            }

        } catch (err) {
            console.log(err);
        }
    };

    return (
        <section className="bg-white h-screen w-screen">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
                <img
                    className="w-40 h-40 mr-2 flex items-center"
                    src={techShopLogo}
                    alt="logo"
                />
                <div
                    className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 ">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="flex flex-col items-center justify-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                            ADMIN DASHBOARD
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleLogin}>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block mb-2 text-sm font-medium text-gray-900"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={email}
                                    autoComplete="off"
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                    required=""
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block mb-2 text-sm font-medium text-gray-900"
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                    required=""
                                />
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <button
                                    className="block border border-black w-1/3 py-2.5 px-4 rounded-lg bg-primary-600 text-black font-semibold text-center hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 focus:ring-opacity-50"
                                    type="Submit"
                                >
                                    Login
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
