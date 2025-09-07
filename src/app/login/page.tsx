"use client";

import { useState } from "react";
import { Loader2, User, Phone, LogIn } from "lucide-react";
import Particles from "@/ReactBits/Particles";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    
    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      if (!digits.startsWith("998")) {
        setFormData({
          ...formData,
          [name]: `+998${digits.slice(3)}`,
        });
        return;
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      console.log("Yig'ilgan ma'lumotlar:", formData);
      alert("Ro'yxatdan o'tish muvaffaqiyatli!");

      setFormData({ firstName: "", lastName: "", phone: "" });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      
      <div className="absolute inset-0 w-full h-full bg-gray-950">
        <Particles
          particleColors={["#03d803", "#03d803"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>

      
      <div className="relative w-[90%] sm:w-[400px] p-6 sm:p-8 rounded-2xl shadow-2xl bg-white/80 backdrop-blur-md border border-purple-200/40">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-purple-700 mb-6">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="relative">
            <label
              htmlFor="firstName"
              className="block text-gray-700 font-medium mb-1 text-sm sm:text-base"
            >
              Ism
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Ismingizni kiriting"
                className="w-full pl-10 pr-4 py-2 border-purple-600 border-2 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                required
                aria-label="Ism"
              />
            </div>
          </div>

          
          <div>
            <label
              htmlFor="lastName"
              className="block text-gray-700 font-medium mb-1 text-sm sm:text-base"
            >
              Familiya
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Familiyangizni kiriting"
                className="w-full pl-10 pr-4 py-2 border-2 border-purple-600 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                required
                aria-label="Familiya"
              />
            </div>
          </div>

          
          <div>
            <label
              htmlFor="phone"
              className="block text-gray-700 font-medium mb-1 text-sm sm:text-base"
            >
              Telefon raqam
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+998 ** *** ** **"
                pattern="^\+998[0-9]{9}$"
                className="w-full pl-10 pr-4 py-2 border-2 border-purple-600 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                required
                aria-label="Telefon raqam"
                aria-describedby="phoneHelp"
              />
            </div>
          </div>

          
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg text-sm sm:text-base transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" /> Yuborilmoqda...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Kirish
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        {/* <p className="text-center text-xs text-gray-500 mt-4">
          &copy; {new Date().getFullYear()} QuizApp. Barcha huquqlar himoyalangan.
        </p> */}
      </div>
    </div>
  );
}
