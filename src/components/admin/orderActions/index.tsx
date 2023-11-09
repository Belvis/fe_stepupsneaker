import { useTranslate, useUpdate } from "@refinedev/core";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Menu, Space, Tooltip } from "antd";
import { IOrder } from "../../../interfaces";

type OrderActionProps = {
  record: IOrder;
};

export const OrderActions: React.FC<OrderActionProps> = ({ record }) => {
  const t = useTranslate();
  const { mutate } = useUpdate();

  return (
    <Space size="middle">
      <Tooltip title={t("buttons.accept")}>
        <Button
          key="accept"
          style={{
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            fontWeight: 500,
          }}
          disabled={record.status !== "PENDING"}
          icon={
            <CheckCircleOutlined
              style={{
                color: "#52c41a",
                fontSize: 17,
                fontWeight: 500,
              }}
            />
          }
          onClick={() => {
            mutate({
              resource: "orders",
              id: record.id,
              values: {
                status: {
                  id: 2,
                  text: "Ready",
                },
              },
            });
          }}
        >
          {t("buttons.accept")}
        </Button>
      </Tooltip>

      <Tooltip title={t("buttons.reject")}>
        <Button
          key="reject"
          style={{
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            fontWeight: 500,
          }}
          icon={
            <CloseCircleOutlined
              style={{
                color: "#EE2A1E",
                fontSize: 17,
              }}
            />
          }
          disabled={
            record.status === "COMPLETED" || record.status === "CANCELED"
          }
          onClick={() =>
            mutate({
              resource: "orders",
              id: record.id,
              values: {
                status: {
                  id: 5,
                  text: "Cancelled",
                },
              },
            })
          }
        >
          {t("buttons.reject")}
        </Button>
      </Tooltip>
    </Space>
  );
};
