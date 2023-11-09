import { DeleteOutlined } from "@ant-design/icons";
import { useDelete, useTranslate } from "@refinedev/core";
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Typography,
  message,
  theme,
} from "antd";
import { IOrderDetail } from "../../../interfaces";
import { moneyFormatter } from "../../../utils/moneyFormatter";
const { useToken } = theme;
const { Text } = Typography;

type OrderItemProps = {
  orderDetail: IOrderDetail;
  callBack: () => void;
  isLoading: boolean;
};

export const OrderItem: React.FC<OrderItemProps> = ({
  orderDetail,
  callBack,
  isLoading,
}) => {
  const t = useTranslate();
  const { token } = useToken();

  const [messageApi, contextHolder] = message.useMessage();
  const { mutate } = useDelete();

  function handleDelete() {
    mutate(
      {
        resource: "order-details",
        id: orderDetail.id,
        successNotification: () => {
          return false;
        },
        errorNotification: () => {
          return false;
        },
      },
      {
        onError: (error, variables, context) => {
          messageApi.open({
            type: "error",
            content: "Failed to remove product from cart.",
          });
        },
        onSuccess: (data, variables, context) => {
          callBack();
          success();
        },
      }
    );
  }

  const success = () => {
    messageApi.open({
      type: "success",
      content: "Removed product from cart successfully.",
    });
  };
  const { quantity, productDetail, price, totalPrice } = orderDetail;
  const { product, color, size } = productDetail;

  return (
    <Card
      style={{
        background: token.colorPrimaryBg,
        boxShadow: "0 4px 4px rgba(0, 0, 0, 0.1)",
      }}
      className="order-items"
      loading={isLoading}
    >
      {contextHolder}
      <Row align="middle" justify="center">
        <Col span={2}>
          <Text>{quantity}</Text>
        </Col>
        <Col span={4}>
          <Avatar
            shape="square"
            size={48}
            src={orderDetail.productDetail.image}
          />
        </Col>
        <Col span={10}>
          <Flex vertical>
            <Text>{product.name}</Text>
            <Text>Size: {size.name}</Text>
            <Text>Color: {color.name}</Text>
          </Flex>
        </Col>
        <Col span={3}>
          <Text>{moneyFormatter.format(price)}</Text>
        </Col>
        <Col span={3}>
          <Text>{moneyFormatter.format(totalPrice)}</Text>
        </Col>
        <Col span={2}>
          <Button
            shape="circle"
            type="text"
            onClick={handleDelete}
            icon={<DeleteOutlined />}
          />
        </Col>
      </Row>
    </Card>
  );
};
