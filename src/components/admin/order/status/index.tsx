import { useTranslate } from "@refinedev/core";
import { Tag } from "antd";
import { OrderStatus as OStatus } from "../../../../pages/interfaces";

type OrderStatusProps = {
  status: OStatus;
};

export const OrderStatus: React.FC<OrderStatusProps> = ({ status }) => {
  const t = useTranslate();
  let color;

  switch (status) {
    case "PENDING":
      color = "orange";
      break;
    case "WAIT_FOR_CONFIRMATION":
      color = "cyan";
      break;
    case "DELIVERING":
      color = "green";
      break;
    case "WAIT_FOR_DELIVERY":
      color = "lime";
      break;
    case "COMPLETED":
      color = "blue";
      break;
    case "CANCELED":
      color = "red";
      break;
    case "RETURNED":
      color = "purple";
      break;
    case "EXCHANGED":
      color = "green";
      break;
  }

  return <Tag color={color}>{t(`enum.orderStatuses.${status}`)}</Tag>;
};
