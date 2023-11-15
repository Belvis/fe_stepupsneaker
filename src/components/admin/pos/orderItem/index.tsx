import { DeleteOutlined } from "@ant-design/icons";
import { useDelete, useTranslate } from "@refinedev/core";
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  InputNumber,
  Row,
  Typography,
  message,
  theme,
} from "antd";
import { IOrderDetail } from "../../../../interfaces";
import { NumberField } from "@refinedev/antd";
import "./style.css";
const { useToken } = theme;
const { Text } = Typography;

type OrderItemProps = {
  orderDetail: IOrderDetail;
  count: number;
  callBack: () => void;
};

export const OrderItem: React.FC<OrderItemProps> = ({
  orderDetail,
  callBack,
  count,
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
            content: t("orders.notification.orderDetail.remove.error"),
          });
        },
        onSuccess: (data, variables, context) => {
          messageApi
            .open({
              type: "success",
              content: t("orders.notification.orderDetail.remove.success"),
              duration: 0.2,
            })
            .then(() => callBack());
        },
      }
    );
  }

  const { quantity, productDetail, price, totalPrice } = orderDetail;
  const { product, color, size } = productDetail;

  return (
    <Card
      style={{
        background: token.colorPrimaryBg,
        boxShadow: "0 4px 4px rgba(0, 0, 0, 0.1)",
      }}
      className="order-items"
    >
      {contextHolder}
      <Row align="middle" justify="center">
        <Col span={2}>
          <Text>{count + 1}</Text>
        </Col>
        <Col span={8}>
          <Flex gap={15}>
            <Avatar
              shape="square"
              size={64}
              src={orderDetail.productDetail.image}
            />
            <Flex vertical>
              <Text>{product.name}</Text>
              <Text>Size: {size.name}</Text>
              <Text>Color: {color.name}</Text>
            </Flex>
          </Flex>
        </Col>
        <Col span={3}>
          <InputNumber
            className="order-tab-quantity"
            bordered={false}
            style={{
              width: "100%",
              borderBottom: `1px solid ${token.colorPrimary}`,
              borderRadius: 0,
            }}
            value={quantity}
            // onChange={(value) => handleQuantityChange(value as number, record)}
          />
        </Col>
        <Col span={4} style={{ textAlign: "end" }}>
          <Text>
            <NumberField
              options={{
                currency: "VND",
                style: "currency",
              }}
              value={price}
            />
          </Text>
        </Col>
        <Col span={4} style={{ textAlign: "end" }}>
          <Text>
            <NumberField
              options={{
                currency: "VND",
                style: "currency",
              }}
              value={totalPrice}
            />
          </Text>
        </Col>
        <Col span={3} style={{ textAlign: "center" }}>
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
