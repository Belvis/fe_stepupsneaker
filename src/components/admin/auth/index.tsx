import React from "react";
import { CardProps, FormProps, LayoutProps } from "antd";
import { AuthPageProps } from "@refinedev/core";
import { RegisterPage } from "./register";
import { ForgotPasswordPage } from "./forgotPassword";
import { UpdatePasswordPage } from "./updatePassword";
import { LoginPage } from "./loginPage";

export type AuthProps = AuthPageProps<LayoutProps, CardProps, FormProps> & {
  renderContent?: (
    content: React.ReactNode,
    title: React.ReactNode
  ) => React.ReactNode;
  title?: React.ReactNode;
};

export const AuthPage: React.FC<AuthProps> = (props) => {
  const { type } = props;
  const renderView = () => {
    switch (type) {
      case "register":
        return <RegisterPage {...props} />;
      case "forgotPassword":
        return <ForgotPasswordPage {...props} />;
      case "updatePassword":
        return <UpdatePasswordPage {...props} />;
      default:
        return <LoginPage {...props} />;
    }
  };

  return <>{renderView()}</>;
};
