import { Typography } from "antd";
import { IOrder } from "../../../interfaces";

const { Text } = Typography;

type Props = {
  content: string;
};

export const NotificationMessage = ({ content }: Props) => {
  return (
    <Text>
      <Text strong>{content ?? "Một khách hàng"}</Text>
      {" vừa đặt đơn hàng "}
      {/* <Text strong>{order.code}</Text>. */}
    </Text>
  );
};
