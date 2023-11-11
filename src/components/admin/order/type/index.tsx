import { useTranslate } from "@refinedev/core";
import { Tag } from "antd";

type OrderTypeProps = {
  type: "OFFLINE" | "ONLINE";
};

export const OrderType: React.FC<OrderTypeProps> = ({ type }) => {
  const t = useTranslate();
  let color;

  switch (type) {
    case "ONLINE":
      color = "#52c41a";
      break;
    case "OFFLINE":
      color = "#bfbfbf";
      break;
  }

  return <Tag color={color}>{t(`orders.fields.type.${type}`)}</Tag>;
};
