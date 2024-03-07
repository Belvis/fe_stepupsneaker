import { DeleteOutlined } from "@ant-design/icons";
import { useDelete, useTranslate, useUpdate } from "@refinedev/core";
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
import { debounce, isNumber } from "lodash";
import { orderDetailToPayload } from "../../../../utils";
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
  const { mutate: updateQuantity } = useUpdate();

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

  const handleQuantityChange = (value: number | null) => {
    if (isNumber(value) && value > 0) {
      if (value > orderDetail.productDetail.quantity) {
        return messageApi.open({
          type: "info",
          content: "Rất tiếc, đã đạt giới hạn số lượng sản phẩm",
        });
      }

      if (value > 5) {
        return messageApi.open({
          type: "info",
          content: "Bạn chỉ có thể mua tối da 5 sản phẩm",
        });
      }

      if (value !== orderDetail.quantity) {
        const payLoad = orderDetailToPayload([orderDetail])[0];
        updateQuantity(
          {
            resource: "order-details",
            values: {
              ...payLoad,
              quantity: value,
            },
            id: orderDetail.id,
            errorNotification: false,
            successNotification: false,
          },
          {
            onError: (error, variables, context) => {
              messageApi.open({
                type: "error",
                content: error.message,
              });
            },
            onSuccess: (data, variables, context) => {
              messageApi.open({
                type: "success",
                content: "Cập nhật đơn hàng thành công",
              });
              callBack();
            },
          }
        );
      }
    }
  };

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
              <Text strong>{product.name}</Text>
              <Text>Kích cỡ: {size.name}</Text>
              <Text>Màu sắc: {color.name}</Text>
            </Flex>
          </Flex>
        </Col>
        <Col span={3}>
          <InputNumber
            min={1}
            className="order-tab-quantity"
            bordered={false}
            style={{
              width: "100%",
              borderBottom: `1px solid ${token.colorPrimary}`,
              borderRadius: 0,
            }}
            value={quantity}
            onChange={debounce(
              (value) => handleQuantityChange(value as number),
              300
            )}
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
              locale={"vi"}
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
              locale={"vi"}
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
