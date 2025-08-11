import React from "react";
import RegistrationForm from "./RegistrationForm";
import Header from "../Header";
import Footer from "../Footer";


const RegistrationPage = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex items-center justify-center bg-gray-100">
                <RegistrationForm />
            </main>
            <Footer />
        </div>
    )
}

export default RegistrationPage;