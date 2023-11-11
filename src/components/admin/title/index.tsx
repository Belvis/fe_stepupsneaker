import React from "react";
import { useRouterContext, useRouterType, useLink } from "@refinedev/core";
import { Typography, theme, Space } from "antd";
import { RefineLayoutThemedTitleProps } from "@refinedev/antd";
import { AppIcon } from "../../app-icon";

const { useToken } = theme;

const defaultText = "Sunsneaker";

const defaultIcon = <AppIcon />;

export const ThemedTitleV2: React.FC<RefineLayoutThemedTitleProps> = ({
  collapsed,
  icon = defaultIcon,
  text = defaultText,
  wrapperStyles,
}) => {
  const { token } = useToken();
  const routerType = useRouterType();
  const Link = useLink();
  const { Link: LegacyLink } = useRouterContext();

  const ActiveLink = routerType === "legacy" ? LegacyLink : Link;

  return (
    <ActiveLink
      to="/"
      style={{
        display: "inline-block",
        textDecoration: "none",
      }}
    >
      <Space
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: "inherit",
          ...wrapperStyles,
        }}
      >
        <div
          style={{
            height: "48px",
            width: "48px",
            color: token.colorPrimary,
          }}
        >
          {icon}
        </div>

        {!collapsed && (
          <Typography.Title
            style={{
              fontSize: "inherit",
              marginBottom: 0,
              fontWeight: 700,
            }}
          >
            {text}
          </Typography.Title>
        )}
      </Space>
    </ActiveLink>
  );
};
