import { DeleteOutlined } from "@ant-design/icons";
import { useTranslate } from "@refinedev/core";
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Typography,
  Image,
  theme,
} from "antd";
import { IProduct } from "../../../interfaces";
const { useToken } = theme;
const { Text, Title } = Typography;

type ProductItemProps = {
  product: IProduct;
  onClickFunction: (product: IProduct) => void;
};

export const ProductItem: React.FC<ProductItemProps> = ({
  product,
  onClickFunction,
}) => {
  const t = useTranslate();
  const { token } = useToken();

  const { id, name, image, code, productDetails } = product;

  const totalQuantity = productDetails.reduce((total, productDetail) => {
    return total + productDetail.quantity;
  }, 0);

  const handleProductItemClick = () => {
    onClickFunction(product);
  };

  return (
    <Col span={24} key={id}>
      <Card key={id} hoverable className="product-items">
        <Row gutter={[16, 24]} align="middle" justify="center">
          <Col span={6}>
            <Image src={image} />
          </Col>
          <Col span={18} onClick={handleProductItemClick}>
            <Row>
              <Title level={5}>
                {name} / #{code}
              </Title>
            </Row>
            <Row>
              <Text>Stock qty: x{totalQuantity}</Text>
            </Row>
          </Col>
        </Row>
      </Card>
    </Col>
  );
};
