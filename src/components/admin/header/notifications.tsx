import React, { useContext, useEffect, useState } from "react";

import {
  BellOutlined,
  CheckOutlined,
  MoreOutlined,
  SelectOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Col,
  Divider,
  Flex,
  Popover,
  Row,
  Segmented,
  Skeleton,
  Space,
  Spin,
  Typography,
} from "antd";
import dayjs from "dayjs";

const { Text, Title } = Typography;

import { AxiosInstance } from "axios";
import { stringify } from "query-string";
import { Link } from "react-router-dom";
import { ColorModeContext } from "../../../contexts/color-mode";
import { INotification } from "../../../interfaces";
import { axiosInstance } from "../../../utils";
import { CustomAvatar } from "./custom-avatar";
import { NotificationMessage } from "./notifications-message";
import styled from "styled-components";
import { SegmentedValue } from "antd/es/segmented";
import { BellIcon } from "../../icons/icon-bell";

const httpClient: AxiosInstance = axiosInstance;

// const API_BASE_URL = import.meta.env.VITE_BACKEND_API_SSE_URL;
const API_SSE_URL = import.meta.env.VITE_BACKEND_API_LOCAL_SSE_URL;

export const Notifications: React.FC = () => {
  const { mode } = useContext(ColorModeContext);

  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [uneadCount, setUnreadCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [segment, setSegment] = useState("Tất cả");

  const query: {
    pageSize: number;
    sortBy?: string;
  } = {
    pageSize: 5,
    sortBy: "createdAt",
  };

  const url = "http://localhost:8080/admin/notifications";

  const getAllNotifs = () => {
    const path = segment === "Tất cả" ? "" : "/unread";
    return httpClient.get(`${url}${path}?${stringify(query)}`);
  };

  const changeNotifStatusToRead = (notifID: string) => {
    return httpClient.put(`${url}/read/` + notifID);
  };

  const readAll = () => {
    return httpClient.get(`${url}/read-all`);
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

  const handleReadAll = async () => {
    setLoading(true);
    await readAll();
    await fetchData();
    setLoading(false);
    setMoreOpen(false);
  };

  const onSegmentedChange = (value: SegmentedValue) => {
    setSegment(value.toString());
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
        <Button type="text" onClick={onLoadMore}>
          Xem thêm
        </Button>
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
    fetchData();
  }, [segment]);

  useEffect(() => {
    if (notifications) {
      const unreadNotifications = notifications.filter(
        (notification) => !notification.read && notification.id != null
      );
      setUnreadCount(unreadNotifications.length);
    }
  }, [notifications]);

  const moreContent = (
    <div className="more-content" style={{ width: "100%" }}>
      <MoreContent gutter={[16, 24]}>
        <Col span={3}>
          <CheckOutlined />
        </Col>
        <Col span={21} onClick={handleReadAll}>
          <Text strong>Đánh dấu là đã đọc</Text>
        </Col>
      </MoreContent>
      <MoreContent gutter={[16, 24]}>
        <Col span={3}>
          <SettingOutlined />
        </Col>
        <Col span={21}>
          <Text strong>Cài đặt thông báo</Text>
        </Col>
      </MoreContent>
      <MoreContent gutter={[16, 24]}>
        <Col span={3}>
          <SelectOutlined />
        </Col>
        <Col span={21}>
          <Text strong>Mở thông báo</Text>
        </Col>
      </MoreContent>
    </div>
  );

  const content = (
    <React.Fragment>
      <div className="noti-header" style={{ marginBottom: "1rem" }}>
        <Row align="middle" justify="space-between">
          <Text strong style={{ fontSize: "24px" }}>
            Thông báo
          </Text>
          <Popover
            placement="bottomRight"
            content={moreContent}
            trigger="click"
            open={moreOpen}
            onOpenChange={(newOpen) => {
              console.log("more", newOpen);

              setMoreOpen(newOpen);
            }}
            overlayStyle={{ width: 250 }}
            getPopupContainer={(triggerNode) =>
              triggerNode.parentNode as HTMLElement
            }
          >
            <Button
              shape="circle"
              icon={<MoreOutlined />}
              style={{
                border: 0,
                backgroundColor: mode === "light" ? "#F7F8F9" : undefined,
              }}
            />
          </Popover>
        </Row>
        <Row style={{ marginTop: "0.25rem" }}>
          <Segmented
            onChange={onSegmentedChange}
            options={["Tất cả", "Chưa đọc"]}
          />
        </Row>
      </div>
      <Space
        direction="vertical"
        split={<Divider style={{ margin: 0 }} />}
        style={{ width: "100%" }}
      >
        {notifications && notifications.length <= 0 && (
          <div style={{ textAlign: "center" }}>
            <BellIcon style={{ fontSize: "72px" }} />
            <p className="text-center">Bạn không có thông báo nào</p>
          </div>
        )}
        {notifications &&
          notifications.length > 0 &&
          notifications.map((noti, index) => (
            <Link
              to={noti.href}
              onClick={() => {
                readNotif(noti.id);
                setOpen(false);
              }}
              key={index}
            >
              <Skeleton
                avatar
                title={false}
                loading={!noti.id}
                active
                key={index}
              >
                <Flex justify="space-between" align="center" key={index}>
                  <Space key={index}>
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
                      <NotificationMessage
                        content={noti.content}
                        type={noti.notificationType}
                      />
                      <Text type="secondary">
                        {dayjs(new Date(noti.createdAt)).fromNow()}
                      </Text>
                    </Space>
                  </Space>
                  <div>{!noti.read && <Badge status="processing" />}</div>
                </Flex>
              </Skeleton>
            </Link>
          ))}
        {loadMore}
      </Space>
    </React.Fragment>
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
      onOpenChange={(newOpen) => {
        console.log(newOpen);

        setMoreOpen(false);
        setOpen(newOpen);
      }}
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

const MoreContent = styled(Row)`
  cursor: pointer;
  transition: background-color 0.3s ease;
  widows: 100%;
  padding: 5px;
  border-radius: 5px;
  &:hover {
    background-color: #fff2e8;
  }
`;
