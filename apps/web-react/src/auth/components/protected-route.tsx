import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/hooks/use-auth";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface ProtectedRouteProps {
  allowedRoles?: ("OWNER" | "TENANT" | "SUPER_ADMIN")[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8F7F4]">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <Skeleton className="w-32 h-4 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
