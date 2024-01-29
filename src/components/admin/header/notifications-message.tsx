import { useTranslate } from "@refinedev/core";
import { Typography } from "antd";

const { Text } = Typography;

type Props = {
  content: string;
  type:
    | "ORDER_PLACED"
    | "ORDER_PENDING"
    | "ORDER_CHANGED"
    | "PRODUCT_LOW_STOCK";
};

export const NotificationMessage = ({ content, type }: Props) => {
  const t = useTranslate();

  return (
    <Text>
      <Text strong>{content ?? "Một khách hàng"}</Text>
      {t(`sse.message.${type}`)}
    </Text>
  );
};
