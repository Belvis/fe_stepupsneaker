import { DeleteOutlined } from "@ant-design/icons";
import { NumberField } from "@refinedev/antd";
import { useTranslate } from "@refinedev/core";
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
import { IProductDetail } from "../../../../interfaces";
import { isNumber } from "lodash";
const { useToken } = theme;
const { Text } = Typography;

type ProductDetailItemProps = {
  productDetail: IProductDetail;
  count: number;
  callBack: (productId: string, newQuantity: number) => void;
  onRemove: (productId: string) => void;
};

export const ProductDetailItem: React.FC<ProductDetailItemProps> = ({
  productDetail,
  callBack,
  count,
  onRemove,
}) => {
  const t = useTranslate();
  const { token } = useToken();

  const [messageApi, contextHolder] = message.useMessage();

  const { quantity, product, price, color, size } = productDetail;

  const handleQuantityChange = (value: number | null) => {
    if (value !== null) callBack(productDetail.id, value);
    if (isNumber(value) && value <= 0) onRemove(productDetail.id);
  };

  return (
    <Card
      style={{
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
            <Avatar shape="square" size={64} src={productDetail.image} />
            <Flex vertical>
              <Text strong>{product.name}</Text>
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
            onChange={handleQuantityChange}
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
              value={price * quantity}
            />
          </Text>
        </Col>
        <Col span={3} style={{ textAlign: "center" }}>
          <Button
            shape="circle"
            type="text"
            onClick={() => onRemove(productDetail.id)}
            icon={<DeleteOutlined />}
          />
        </Col>
      </Row>
    </Card>
  );
};
