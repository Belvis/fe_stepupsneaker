import { HttpError, useCreate, useOne, useTranslate } from "@refinedev/core";
import { Modal, Image, Grid, Row, Col, Flex, Typography, Space, Tag, InputNumber, Button, message, Badge } from "antd";
import {
  IColor,
  IDiscountInfo,
  IProduct,
  IProductClient,
  IProductDetail,
  IPromotionProductDetailResponse,
  ISize,
  ISizeClient,
  IVariation,
} from "../../../../interfaces";
import { Fragment, useEffect, useState } from "react";
import { Quantity } from "./styled";
import { AiFillPlusCircle, AiFillMinusCircle } from "react-icons/ai";
import { NumberField } from "@refinedev/antd";
import { SaleIcon } from "../../../icons/icon-sale";
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
    if (qty <= 1) {
      return messageApi.open({
        type: "error",
        content: "Đã đạt số lượng nhỏ nhất",
      });
    }
    setQty(qty - 1);
  };

  const increaseQty = () => {
    if (qty >= 5) {
      return messageApi.open({
        type: "error",
        content: "Chỉ có thể mua tối da 5 sản phẩm",
      });
    }

    if (qty >= productStock) {
      return messageApi.open({
        type: "error",
        content: "Rất tiếc, đã đạt giới hạn số lượng sản phẩm",
      });
    }
    setQty(qty + 1);
  };

  const [productData, setProductData] = useState(initializeProductClient(product));

  const { productClient, initialSelectedColor, initialSelectedSize, initialProductStock } = productData;

  const [selectedProductColor, setSelectedProductColor] = useState(initialSelectedColor);

  const [selectedProductSize, setSelectedProductSize] = useState(initialSelectedSize);

  const [selectedVariant, setSelectedVariant] = useState(productClient.variation[0]);

  const [productStock, setProductStock] = useState(initialProductStock);

  const { mutate: mutateCreate, isLoading } = useCreate();

  const handleFinish = () => {
    if (selectedVariant) {
      const price = discountedPrice !== null ? finalDiscountedPrice : finalProductPrice;
      mutateCreate(
        {
          resource: "order-details",
          values: [
            {
              productDetail: selectedProductSize.productDetailId,
              order: orderId,
              quantity: qty,
              price: price,
              totalPrice: price * qty,
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
              content: error.message,
            });
          },
          onSuccess: (data, variables, context) => {
            handleOk();
            callBack();
            messageApi.open({
              type: "success",
              content: t("orders.notification.product.add.success"),
            });
          },
        }
      );
    } else {
      messageApi.open({
        type: "error",
        content: t("orders.notification.product.add.notFound"),
      });
    }
  };

  useEffect(() => {
    const selectedVariant = productClient.variation.find((variation) => variation.color.id === selectedProductColor.id);
    if (selectedVariant) setSelectedVariant(selectedVariant);
  }, [selectedProductColor]);

  useEffect(() => {
    if (open && product) {
      const initData = initializeProductClient(product);
      setProductData(initData);

      setSelectedProductColor(initData.initialSelectedColor);
      setSelectedProductSize(initData.initialSelectedSize);
      setProductStock(initData.initialProductStock);
    }
  }, [open]);

  const getDiscountPrice = (price: number, discount: number) => {
    return discount && discount > 0 ? price - price * (discount / 100) : null;
  };
  const discountedPrice = getDiscountPrice(selectedProductSize.price, selectedProductSize.discount);
  const finalProductPrice = +(selectedProductSize.price * 1);
  const finalDiscountedPrice = +((discountedPrice ?? selectedProductSize.discount) * 1);

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
          <Image src={productClient.image[0]} />
        </Col>
        <Col span={12}>
          <Flex gap="middle" vertical>
            <Col span={24}>
              <Title level={3}>
                {productClient.name} / #{productClient.code}
              </Title>
            </Col>
            <Col span={24}>
              <Title level={4} style={{ color: "red" }}>
                {discountedPrice !== null ? (
                  <Fragment>
                    <NumberField
                      options={{
                        currency: "VND",
                        style: "currency",
                      }}
                      value={finalDiscountedPrice}
                      locale={"vi"}
                    />
                    <NumberField
                      className="old"
                      options={{
                        currency: "VND",
                        style: "currency",
                      }}
                      value={finalProductPrice}
                      locale={"vi"}
                    />
                  </Fragment>
                ) : (
                  <NumberField
                    options={{
                      currency: "VND",
                      style: "currency",
                    }}
                    value={finalProductPrice}
                    locale={"vi"}
                  />
                )}
              </Title>
            </Col>
            <Col span={24}>
              <Space direction="vertical">
                <Text strong>Mô tả</Text>
                <Paragraph>{productClient.description}</Paragraph>
              </Space>
            </Col>
            <Col span={24}>
              <Space direction="vertical">
                <Space>
                  <Text strong>Màu sắc</Text>
                  <Text>{selectedProductColor.name}</Text>
                </Space>
                <Space>
                  {productClient.variation && (
                    <>
                      {productClient.variation.map((single, key) => {
                        const hasSale = single.size.some(
                          (size) => typeof size.discount === "number" && size.discount > 0
                        );

                        return (
                          <Badge
                            offset={[20, 0]}
                            key={key}
                            count={
                              hasSale ? (
                                <SaleIcon
                                  style={{
                                    color: "red",
                                    fontSize: "24px",
                                    zIndex: 2,
                                  }}
                                />
                              ) : (
                                0
                              )
                            }
                          >
                            <Tag.CheckableTag
                              key={key}
                              checked={selectedProductColor.id === single.color.id}
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                backgroundColor: "#" + single.color.code,
                                border:
                                  selectedProductColor.id === single.color.id
                                    ? "2px solid #fb5231"
                                    : "2px solid transparent",
                              }}
                              onChange={() => {
                                setSelectedProductColor(single.color);
                                setSelectedProductSize(single.size[0]);
                                setProductStock(single.size[0].stock);
                                setQty(1);
                              }}
                            />
                          </Badge>
                        );
                      })}
                    </>
                  )}
                </Space>
              </Space>
            </Col>
            <Col span={24}>
              <Space direction="vertical">
                <Space>
                  <Text strong>Kích cỡ</Text>
                  <Text>{selectedProductSize.name}</Text>
                  <Text strong>Số lượng tồn</Text>
                  <Text style={{ color: productStock <= 0 ? "red" : "" }}>
                    {productStock} {productStock <= 0 ? "Sản phẩm này đã hết hàng" : ""}
                  </Text>
                </Space>
                <Space>
                  {productClient.variation && (
                    <>
                      {productClient.variation.map((single) => {
                        return single.color.id === selectedProductColor.id
                          ? single.size.map((singleSize, key) => {
                              const hasSale = singleSize.discount > 0;
                              return (
                                <Badge
                                  count={
                                    hasSale ? (
                                      <SaleIcon
                                        style={{
                                          color: "red",
                                          fontSize: "24px",
                                          zIndex: 2,
                                        }}
                                      />
                                    ) : (
                                      0
                                    )
                                  }
                                >
                                  <Tag.CheckableTag
                                    key={key}
                                    checked={selectedProductSize.id === singleSize.id}
                                    style={{
                                      border:
                                        selectedProductSize.id === singleSize.id
                                          ? "1px solid #fb5231"
                                          : "1px solid #000000",
                                      borderRadius: "0",
                                      padding: "6px 12px",
                                    }}
                                    onChange={() => {
                                      setSelectedProductSize(singleSize);
                                      setProductStock(singleSize.stock);
                                      setQty(1);
                                    }}
                                  >
                                    {singleSize.name}
                                  </Tag.CheckableTag>
                                </Badge>
                              );
                            })
                          : "";
                      })}
                    </>
                  )}
                </Space>
              </Space>
            </Col>
            <Row align="middle">
              <Col span={12}>
                <Quantity>
                  <button onClick={decreaseQty} disabled={productStock <= 0}>
                    <AiFillMinusCircle />
                  </button>
                  <InputNumber min={1} value={qty} disabled={productStock <= 0} />
                  <button onClick={increaseQty} disabled={productStock <= 0}>
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
                  disabled={productStock <= 0}
                >
                  Thêm vào giỏ
                </Button>
              </Col>
            </Row>
          </Flex>
        </Col>
      </Row>
    </Modal>
  );
};

const mapProductResponseToClient = (productResponse: IProduct): IProductClient => {
  const variations: IVariation[] = [];
  const images: string[] = [productResponse.image];
  let minPrice = Number.MAX_SAFE_INTEGER;
  let maxPrice = Number.MIN_SAFE_INTEGER;
  let discountInfo = {
    value: 0,
    endDate: 0,
  } as IDiscountInfo;
  const thresholdInMilliseconds = 7 * 24 * 60 * 60 * 1000;
  const currentTime = new Date().getTime();
  const isNew = currentTime - productResponse.createdAt < thresholdInMilliseconds;

  productResponse.productDetails.forEach((productDetail) => {
    images.push(productDetail.image);
    const existingVariation = variations.find((v) => v.color.id === productDetail.color.id);
    if (existingVariation) {
      existingVariation.size.push(mapSizeToSizeClient(productDetail));
      existingVariation.image.push(productDetail.image);

      minPrice = Math.min(minPrice, productDetail.price);
      maxPrice = Math.max(maxPrice, productDetail.price);
    } else {
      const newVariation: IVariation = {
        color: productDetail.color,
        image: [productDetail.image],
        size: [mapSizeToSizeClient(productDetail)],
      };
      variations.push(newVariation);

      minPrice = Math.min(minPrice, productDetail.price);
      maxPrice = Math.max(maxPrice, productDetail.price);
    }

    const currentDiscountInfo = getDiscountInfo(productDetail.promotionProductDetails ?? []);

    if (currentDiscountInfo) {
      if (!discountInfo || currentDiscountInfo.value > discountInfo.value) {
        discountInfo = currentDiscountInfo;
      }
    }
  });

  if (productResponse.productDetails.length === 0) {
    minPrice = 0;
    maxPrice = 0;
  }

  return {
    id: productResponse.id,
    code: productResponse.code,
    name: productResponse.name,
    price: {
      min: minPrice,
      max: maxPrice,
    },
    discount: discountInfo.value,
    saleCount: productResponse.saleCount,
    offerEnd: discountInfo.endDate,
    new: isNew,
    variation: variations,
    image: images,
    description: productResponse.description,
  };
};

const mapSizeToSizeClient = (detail: IProductDetail): ISizeClient => {
  const discountInfo = getDiscountInfo(detail.promotionProductDetails ?? []);

  return {
    id: detail.size?.id || "",
    name: detail.size?.name || "",
    stock: detail.quantity || 0,
    price: detail.price,
    discount: discountInfo?.value ?? 0,
    offerEnd: discountInfo?.endDate ?? 0,
    saleCount: 0,
    productDetailId: detail.id,
  };
};

export const getDiscountInfo = (promotionProductDetails: IPromotionProductDetailResponse[]): IDiscountInfo | null => {
  if (!promotionProductDetails || promotionProductDetails.length === 0) {
    return null;
  }

  const activePromotions = promotionProductDetails
    .map((detail) => detail.promotion)
    .filter((promotion) => promotion.status === "ACTIVE");

  if (activePromotions.length === 0) {
    return null;
  }

  const maxPromotion = activePromotions.reduce((max, promotion) => {
    return promotion.value > max.value ? promotion : max;
  });

  const discountInfo: IDiscountInfo = {
    value: maxPromotion.value,
    endDate: maxPromotion.endDate,
  };

  return discountInfo;
};

const mapProductToClient = (product: IProduct): IProductClient => {
  const mappedProduct = mapProductResponseToClient(product);

  mappedProduct.image.sort();

  mappedProduct.variation.sort((a, b) => a.color.name.localeCompare(b.color.name));

  mappedProduct.variation.forEach((variation) => {
    variation.size.sort((a, b) => a.name.localeCompare(b.name));
  });

  mappedProduct.variation.forEach((variation) => {
    variation.image.sort();
  });

  return mappedProduct;
};

const initializeProductClient = (product: IProduct) => {
  const productClient = mapProductToClient(product);

  const initialSelectedColor =
    productClient.variation && productClient.variation.length > 0 ? productClient.variation[0].color : ({} as IColor);
  const initialSelectedSize =
    productClient.variation && productClient.variation.length > 0
      ? productClient.variation[0].size[0]
      : ({} as ISizeClient);
  const initialProductStock =
    productClient.variation && productClient.variation.length > 0 ? productClient.variation[0].size[0].stock : 0;

  return {
    productClient,
    initialSelectedColor,
    initialSelectedSize,
    initialProductStock,
  };
};
