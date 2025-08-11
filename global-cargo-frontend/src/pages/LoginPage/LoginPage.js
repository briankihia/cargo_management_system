import React from "react";
import LoginForm from "./LoginForm";



const LoginPage = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow flex items-center justify-center bg-gray-100">
                <LoginForm />
            </main>
        </div>
    )
}

export default LoginPage;