"use client";

import { useRouter } from "next/navigation";
import { Button, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

export default function LoginPage() {
  const router = useRouter();

  const loginOptions = [
    {
      icon: <UserOutlined className="text-3xl sm:text-4xl" />,
      title: "Foydalanuvchi",
      description: "Test ishlash uchun kirish",
      path: "/login/user",
      color: "from-blue-500 to-cyan-500",
      textColor: "text-blue-600",
    },
    {
      icon: <LockOutlined className="text-3xl sm:text-4xl" />,
      title: "Admin",
      description: "Savollarni boshqarish",
      path: "/login/admin",
      color: "from-slate-700 to-slate-900",
      textColor: "text-slate-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-2 sm:mb-3 tracking-tight">
            🎓 Quiz App
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-300 px-2">
            O'zingizni sinab ko'ring va bilimingizni oshiring
          </p>
        </div>

        {/* Cards Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {loginOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => router.push(option.path)}
              className="group w-full"
            >
              <Card
                className="
                  h-full border-0 shadow-lg sm:shadow-xl
                  hover:shadow-2xl transition-all duration-300
                  bg-white hover:-translate-y-1 sm:hover:-translate-y-2
                  cursor-pointer
                "
              >
                <div className="text-center py-4 sm:py-6">
                  {/* Icon Background */}
                  <div className={`
                    w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl
                    bg-gradient-to-br ${option.color}
                    flex items-center justify-center text-white
                    group-hover:scale-110 transition-transform duration-300
                  `}>
                    {option.icon}
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 ${option.textColor}`}>
                    {option.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-4 sm:mb-8 px-2">
                    {option.description}
                  </p>

                  {/* Button */}
                  <Button
                    type="primary"
                    size="large"
                    block
                    className={`
                      bg-gradient-to-r ${option.color}
                      border-0 font-semibold text-sm sm:text-base h-10 sm:h-12
                      hover:shadow-lg transition-all
                    `}
                  >
                    Kirish
                  </Button>
                </div>
              </Card>
            </button>
          ))}
        </div>

        {/* Footer */}
    
      </div>
    </div>
  );
}
