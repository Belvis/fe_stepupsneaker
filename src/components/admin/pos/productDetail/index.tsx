import { HttpError, useCreate, useOne, useTranslate } from "@refinedev/core";
import {
  Modal,
  Image,
  Grid,
  Row,
  Col,
  Flex,
  Typography,
  Space,
  Tag,
  InputNumber,
  Button,
  message,
} from "antd";
import {
  IColor,
  IProduct,
  IProductDetail,
  ISize,
} from "../../../../interfaces";
import { useEffect, useState } from "react";
import { Quantity } from "./styled";
import { AiFillPlusCircle, AiFillMinusCircle } from "react-icons/ai";
import { NumberField } from "@refinedev/antd";
const { Text, Title, Paragraph } = Typography;

type ProductDetailProps = {
  open: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  orderId?: string;
  product: IProduct;
  callBack: () => void;
};

export const ProductDetail: React.FC<ProductDetailProps> = ({
  open,
  handleOk,
  handleCancel,
  orderId,
  product,
  callBack,
}) => {
  const t = useTranslate();
  const [messageApi, contextHolder] = message.useMessage();
  const breakpoint = Grid.useBreakpoint();

  const [qty, setQty] = useState(1);

  const decreaseQty = () => {
    if (qty > 1) {
      setQty(qty - 1);
    }
  };

  const increaseQty = () => {
    setQty(qty + 1);
  };

  const [selectedColor, setSelectedColor] = useState<IColor>();
  const [selectedSize, setSelectedSize] = useState<ISize>();
  const [selectedProductDetail, setSelectedProductDetail] =
    useState<IProductDetail>();

  const { mutate: mutateCreate, isLoading } = useCreate();

  useEffect(() => {
    if (open) {
      setSelectedColor(undefined);
      setSelectedSize(undefined);
      setSelectedProductDetail(undefined);
    }
  }, [open]);

  const productDetails = product.productDetails ?? [];

  const lowestPrice =
    productDetails.length > 0
      ? productDetails.reduce((minPrice, productDetail) => {
          const currentPrice = productDetail.price;
          return currentPrice < minPrice ? currentPrice : minPrice;
        }, productDetails[0].price)
      : 0;

  const colors: IColor[] = Object.values(
    productDetails.reduce((uniqueColorMap: any, productDetail) => {
      const colorCode = productDetail.color.code;
      if (!uniqueColorMap[colorCode]) {
        uniqueColorMap[colorCode] = productDetail.color;
      }
      return uniqueColorMap;
    }, {})
  );

  const sizes: ISize[] = Object.values(
    productDetails.reduce((uniqueSizeMap: any, productDetail) => {
      const sizeId = productDetail.size.id;
      if (!uniqueSizeMap[sizeId]) {
        uniqueSizeMap[sizeId] = productDetail.size;
      }
      return uniqueSizeMap;
    }, {})
  );

  const handleColorChange = (color: IColor, checked: boolean) => {
    setSelectedColor(checked ? color : undefined);
  };

  const handleSizeChange = (size: ISize, checked: boolean) => {
    setSelectedSize(checked ? size : undefined);
  };

  useEffect(() => {
    const selectedProductDetail = product.productDetails.find(
      (productDetail) => {
        return (
          productDetail.color.id === selectedColor?.id &&
          productDetail.size.id === selectedSize?.id
        );
      }
    );
    setSelectedProductDetail(selectedProductDetail);
  }, [selectedColor, selectedSize]);

  const handleFinish = () => {
    if (selectedProductDetail) {
      mutateCreate(
        {
          resource: "order-details",
          values: [
            {
              productDetail: selectedProductDetail?.id,
              order: orderId,
              quantity: qty,
              price: selectedProductDetail?.price,
              totalPrice: selectedProductDetail?.price * qty,
              status: "COMPLETED",
            },
          ],
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
              content: "Failed to add product to cart.",
            });
          },
          onSuccess: (data, variables, context) => {
            handleOk();
            callBack();
            messageApi.open({
              type: "success",
              content: "Added product to cart successfully.",
            });
          },
        }
      );
    } else {
      messageApi.open({
        type: "error",
        content: "No suitable products were found.",
      });
    }
  };

  return (
    <Modal
      title={t("productDetails.productDetails")}
      width={breakpoint.sm ? "1000px" : "100%"}
      zIndex={1001}
      onCancel={handleCancel}
      open={open}
      footer={(_, { OkBtn }) => <></>}
    >
      {contextHolder}
      <Row gutter={[16, 24]}>
        <Col span={12}>
          <Image.PreviewGroup>
            <Image src={product.image} />
          </Image.PreviewGroup>
        </Col>
        <Col span={12}>
          <Flex gap="middle" vertical>
            <Col span={24}>
              <Title level={3}>
                {product.name} / #{product.code}
              </Title>
            </Col>
            <Col span={24}>
              <Title level={4} style={{ color: "red" }}>
                <NumberField
                  options={{
                    currency: "VND",
                    style: "currency",
                  }}
                  value={
                    selectedProductDetail
                      ? selectedProductDetail.price
                      : lowestPrice
                  }
                />
              </Title>
            </Col>
            <Col span={24}>
              <Space direction="vertical">
                <Text strong>Description</Text>
                <Paragraph>{product.description}</Paragraph>
              </Space>
            </Col>
            <Col span={24}>
              <Space direction="vertical">
                <Space>
                  <Text strong>Color</Text>
                  <Text>{selectedColor?.name}</Text>
                </Space>
                <Space>
                  {colors.length > 0 && (
                    <>
                      {colors.map((color, index) => (
                        <Tag.CheckableTag
                          key={index}
                          checked={selectedColor === color}
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor: "#" + color.code,
                            border:
                              selectedColor === color
                                ? "2px solid #fb5231"
                                : "2px solid transparent",
                          }}
                          onChange={(checked) =>
                            handleColorChange(color, checked)
                          }
                        />
                      ))}
                    </>
                  )}
                </Space>
              </Space>
            </Col>
            <Col span={24}>
              <Space direction="vertical">
                <Space>
                  <Text strong>Size</Text>
                  <Text>{selectedSize?.name}</Text>
                </Space>
                <Space>
                  {sizes.length > 0 && (
                    <>
                      {sizes.map((size, index) => (
                        <Tag.CheckableTag
                          key={index}
                          checked={selectedSize === size}
                          style={{
                            border:
                              selectedSize === size
                                ? "1px solid #fb5231"
                                : "1px solid #000000",
                            borderRadius: "0",
                            padding: "6px 12px",
                          }}
                          onChange={(checked) =>
                            handleSizeChange(size, checked)
                          }
                        >
                          {size.name}
                        </Tag.CheckableTag>
                      ))}
                    </>
                  )}
                </Space>
              </Space>
            </Col>
            <Row align="middle">
              <Col span={12}>
                <Quantity>
                  <span>Quantity</span>
                  <button onClick={decreaseQty}>
                    <AiFillMinusCircle />
                  </button>
                  <InputNumber value={qty} />
                  <button onClick={increaseQty}>
                    <AiFillPlusCircle />
                  </button>
                </Quantity>
              </Col>
              <Col span={12}>
                <Button
                  loading={isLoading}
                  type="primary"
                  onClick={handleFinish}
                  style={{ width: "100%" }}
                  disabled={productDetails.length <= 0}
                >
                  Add To Cart
                </Button>
              </Col>
            </Row>
          </Flex>
        </Col>
      </Row>
    </Modal>
  );
};
