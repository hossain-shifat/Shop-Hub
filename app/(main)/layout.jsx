import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";


export default function MainLayout({ children }) {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-base-100 my-20 overflow-hidden">
                {children}
            </main>
            <Footer />
        </>
    )
}
