import React, { useContext, useEffect, useState } from "react";

import { useList, useMany } from "@refinedev/core";

import { BellOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Divider,
  Flex,
  Popover,
  Skeleton,
  Space,
  Spin,
  Typography,
} from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

import { CustomAvatar } from "./custom-avatar";
import { NotificationMessage } from "./notifications-message";
import { AxiosInstance } from "axios";
import { axiosInstance } from "../../../utils";
import { INotification } from "../../../interfaces";
import { Link } from "react-router-dom";
import { stringify } from "query-string";
import { ColorModeContext } from "../../../contexts/color-mode";

const httpClient: AxiosInstance = axiosInstance;

// const API_BASE_URL = import.meta.env.VITE_BACKEND_API_SSE_URL;
const API_SSE_URL = import.meta.env.VITE_BACKEND_API_LOCAL_SSE_URL;

export const Notifications: React.FC = () => {
  const { mode } = useContext(ColorModeContext);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [uneadCount, setUnreadCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const query: {
    pageSize: number;
    sortBy?: string;
  } = {
    pageSize: 5,
    sortBy: "createdAt",
  };

  const url = "http://localhost:8080/admin/notifications";

  const getAllNotifs = () => {
    return httpClient.get(`${url}?${stringify(query)}`);
  };

  const changeNotifStatusToRead = (notifID: string) => {
    return httpClient.put(`${url}/read/` + notifID);
  };

  const fetchData = async () => {
    const data = await (await getAllNotifs()).data;
    setTotalCount(data.content.totalElements);
    setNotifications(data.content.data);
  };

  const readNotif = async (id: string) => {
    await changeNotifStatusToRead(id);
    fetchData();
  };

  const onLoadMore = () => {
    setLoading(true);
    setNotifications((prev) =>
      prev.concat([...new Array(3)].map(() => ({} as INotification)))
    );
    query.pageSize += 5;
    fetchData().then(() => {
      setLoading(false);
      window.dispatchEvent(new Event("resize"));
    });
  };

  const loadMore =
    !initLoading && !loading && notifications.length != totalCount ? (
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          height: 32,
          lineHeight: "32px",
        }}
      >
        <Button onClick={onLoadMore}>xem thêm</Button>
      </div>
    ) : null;

  useEffect(() => {
    fetchData().then(() => {
      setInitLoading(false);
    });
    const eventSource = new EventSource(API_SSE_URL);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data && data.length > 0) {
        setNotifications((prev) => [...data, ...prev]);
      }
    };

    eventSource.addEventListener("close", () => {
      console.log("Connection closed");
    });

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    if (notifications) {
      const unreadNotifications = notifications.filter(
        (notification) => !notification.read && notification.id != null
      );
      setUnreadCount(unreadNotifications.length);
    }
  }, [notifications]);

  const content = (
    <Space
      direction="vertical"
      split={<Divider style={{ margin: 0 }} />}
      style={{ width: "100%" }}
    >
      {notifications &&
        notifications.length > 0 &&
        notifications.map((noti) => (
          <Link
            to={noti.href}
            onClick={() => {
              readNotif(noti.id);
              setOpen(false);
            }}
          >
            <Skeleton avatar title={false} loading={!noti.id} active>
              <Flex justify="space-between" align="center">
                <Space key={noti.id}>
                  <CustomAvatar
                    size={48}
                    shape="square"
                    src={
                      noti.customer
                        ? noti.customer.image
                        : "https://res.cloudinary.com/dwoxggxq7/image/upload/w_400,h_400,c_scale/su1bf6xpowuscnuuerwm.jpg"
                    }
                    name={noti.content}
                  />
                  <Space direction="vertical" size={0}>
                    <NotificationMessage content={noti.content} />
                    <Text type="secondary">
                      {dayjs(new Date(noti.createdAt)).fromNow()}
                    </Text>
                  </Space>
                </Space>
                <div>
                  {!noti.read && !noti.id && <Badge status="processing" />}
                </div>
              </Flex>
            </Skeleton>
          </Link>
        ))}
      {loadMore}
    </Space>
  );

  const loadingContent = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 20,
      }}
    >
      <Spin />
    </div>
  );

  return (
    <Popover
      placement="bottomRight"
      content={initLoading ? loadingContent : content}
      trigger="click"
      open={open}
      onOpenChange={(newOpen) => setOpen(newOpen)}
      overlayStyle={{ width: 400, maxHeight: "500px", overflow: "auto" }}
    >
      <Badge count={uneadCount} size="small">
        <Button
          shape="circle"
          icon={<BellOutlined />}
          style={{
            border: 0,
            backgroundColor: mode === "light" ? "#F7F8F9" : undefined,
          }}
        />
      </Badge>
    </Popover>
  );
};
