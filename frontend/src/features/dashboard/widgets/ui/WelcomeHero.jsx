import React from "react";
import { BookOpen, Users, BarChart3, User, MapPin } from "lucide-react";
import { WELCOME_MESSAGES } from "../../../../components/common/constants/index";

const WelcomeHero = ({ user }) => {
  const getWelcomeMessage = (role) => {
    return WELCOME_MESSAGES[role] || WELCOME_MESSAGES.default;
  };
  const getRoleIcon = (role) => {
    switch (role) {
      case "student":
        return <BookOpen className="h-8 w-8" />;
      case "organizer":
        return <Users className="h-8 w-8" />;
      case "admin":
        return <BarChart3 className="h-8 w-8" />;
      default:
        return <User className="h-8 w-8" />;
    }
  };

  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return "Good morning, ";
    if (currentHour < 17) return "Good afternoon, ";
    return "Good evening, ";
  };
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 dark:from-primary-600 dark:via-primary-700 dark:to-secondary-800 border border-primary-200 dark:border-primary-700">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-primary-50/50 dark:bg-black/10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='0.08'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="text-secondary-700 dark:text-white">
                {getRoleIcon(user?.role)}
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-800 dark:text-white">
                  {getGreeting()}
                  {user?.role && (
                    <span className="capitalize">{user.role}</span>
                  )}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-secondary-800 dark:text-white">
                  {user?.name || "Welcome"}!
                </h1>
              </div>
            </div>
            <p className="text-secondary-700 dark:text-white text-sm md:text-base max-w-lg">
              {getWelcomeMessage(user?.role)}
            </p>
          </div>

          {/* Decorative elements */}
          <div className="hidden md:flex items-center space-x-4 text-primary-300 dark:text-white/20">
            <div className="w-20 h-20 rounded-full border-2 border-primary-300 dark:border-white/20 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary-200 dark:bg-white/10" />
            </div>
            <div className="w-16 h-16 rounded-full border-2 border-primary-200 dark:border-white/10 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-white/5" />
            </div>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="mt-6 flex items-center space-x-6 text-sm text-secondary-700 dark:text-white">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>SNSU Campus</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHero;
