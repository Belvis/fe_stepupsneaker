import { AppstoreOutlined, DownOutlined } from "@ant-design/icons";
import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
import {
  useGetIdentity,
  useGetLocale,
  useSetLocale,
  useTranslate,
} from "@refinedev/core";
import {
  Avatar,
  Button,
  Dropdown,
  Layout as AntdLayout,
  MenuProps,
  Space,
  Switch,
  theme,
  Typography,
  Tooltip,
} from "antd";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ColorModeContext } from "../../../contexts/color-mode";
import { Link } from "react-router-dom";

const { Text } = Typography;
const { useToken } = theme;

type IUser = {
  id: number;
  name: string;
  avatar: string;
};

export const AdminHeader: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  sticky,
}) => {
  const t = useTranslate();
  const { token } = useToken();
  const { i18n } = useTranslation();
  const locale = useGetLocale();
  const changeLanguage = useSetLocale();
  const { data: user } = useGetIdentity<IUser>();
  const { mode, setMode } = useContext(ColorModeContext);

  const currentLocale = locale();

  const menuItems: MenuProps["items"] = [...(i18n.languages || [])]
    .sort()
    .map((lang: string) => ({
      key: lang,
      onClick: () => changeLanguage(lang),
      icon: (
        <span style={{ marginRight: 8 }}>
          <Avatar size={16} src={`/images/flags/${lang}.svg`} />
        </span>
      ),
      label: lang === "en" ? "English" : "Tiếng Việt",
    }));

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
  };

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  return (
    <AntdLayout.Header style={headerStyles}>
      <Space>
        <Dropdown
          menu={{
            items: menuItems,
            selectedKeys: currentLocale ? [currentLocale] : [],
          }}
        >
          <Button type="text">
            <Space>
              <Avatar size={16} src={`/images/flags/${currentLocale}.svg`} />
              {currentLocale === "en" ? "English" : "Tiếng Việt"}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          defaultChecked={mode === "dark"}
        />
        <Space style={{ marginLeft: "8px" }} size="middle">
          {user?.name && <Text strong>{user.name}</Text>}
          {user?.avatar && <Avatar src={user?.avatar} alt={user?.name} />}
        </Space>
      </Space>
    </AntdLayout.Header>
  );
};
