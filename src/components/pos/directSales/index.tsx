import {
  AutoComplete,
  Avatar,
  Button,
  Card,
  Col,
  Input,
  Pagination,
  PaginationProps,
  Row,
  Skeleton,
  Space,
  TablePaginationConfig,
  Typography,
  message,
  theme,
} from "antd";
import { CheckOutDrawer } from "../checkOutDrawer";
import { ProductItem } from "../productItem";
import {
  CloseOutlined,
  FilterOutlined,
  PictureOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  CloseButtonWrapper,
  CustomerInfor,
  CustomerName,
  TextContainer,
  UserIcon,
} from "./styled";
import { OrderItem } from "../orderItem";
import { ICustomer, IOption, IOrder, IProduct } from "../../../interfaces";
import { debounce } from "lodash";
import { HttpError, useList, useTranslate, useUpdate } from "@refinedev/core";
import { moneyFormatter } from "../../../utils/moneyFormatter";
import { useEffect, useState } from "react";
const { useToken } = theme;
const { Text, Title } = Typography;

type DirectSalesProps = {
  order: IOrder;
  callBack: () => void;
  isLoadingOrderCreate: boolean;
  setProductDetailModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedProduct: React.Dispatch<
    React.SetStateAction<IProduct | undefined>
  >;
};

export const DirectSales: React.FC<DirectSalesProps> = ({
  order,
  callBack,
  isLoadingOrderCreate,
  setProductDetailModalVisible,
  setSelectedProduct,
}) => {
  const t = useTranslate();
  const { token } = useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const [value, setValue] = useState<string>("");
  const [customerOptions, setCustomerOptions] = useState<IOption[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
  });

  const { mutate: mutateUpdate } = useUpdate();
  const {
    data,
    isLoading: isLoadingProduct,
    isError,
    refetch,
  } = useList<IProduct, HttpError>({
    resource: "products",
    config: {
      filters: [
        {
          field: "minQuantity",
          operator: "eq",
          value: 1,
        },
      ],
    },
    pagination: pagination,
  });
  const { refetch: refetchCustomer } = useList<ICustomer>({
    resource: "customers",
    config: {
      filters: [{ field: "q", operator: "contains", value }],
    },
    pagination: {
      pageSize: 1000,
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data) => {
        const customerOptions = data.data.map((item) =>
          renderItem(`${item.fullName} - ${item.email}`, item.image, item)
        );
        if (customerOptions.length > 0) {
          setCustomerOptions(customerOptions);
        }
      },
    },
  });

  useEffect(() => {
    if (pagination) {
      refetch();
    }
  }, [pagination]);

  useEffect(() => {
    if (data && data.data) {
      const fetchedProduct: IProduct[] = [...data.data];
      setProducts(fetchedProduct);
    }
  }, [data]);

  useEffect(() => {
    setCustomerOptions([]);
    refetchCustomer();
  }, [value]);

  const orderDetails = order?.orderDetails || [];
  const totalQuantity = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.quantity;
  }, 0);
  const totalPrice = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.totalPrice;
  }, 0);
  const onChange: PaginationProps["onChange"] = (page) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      current: page,
    }));
  };
  const handleProductClick = (product: IProduct) => {
    setSelectedProduct(product);
    setProductDetailModalVisible(true);
  };

  const [drawerOpen, setDrawerOpen] = useState(false);

  const showDrawer = () => {
    setDrawerOpen(true);
  };

  const onDrawerClose = () => {
    setDrawerOpen(false);
  };

  function editOrderNote(value: string): void {
    if (value !== order.note)
      mutateUpdate(
        {
          resource: "orders",
          values: {
            ...order,
            note: value,
          },
          id: order.id,
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
              content: "Failed to edit order note.",
            });
          },
          onSuccess: (data, variables, context) => {
            callBack();
            messageApi.open({
              type: "success",
              content: "Edited order note successfully.",
            });
          },
        }
      );
  }

  function editOrderCustomer(value: string | null): void {
    mutateUpdate(
      {
        resource: "orders",
        values: {
          ...order,
          customer: value,
        },
        id: order.id,
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
            content: "Failed to edit order customer.",
          });
        },
        onSuccess: (data, variables, context) => {
          callBack();
          messageApi.open({
            type: "success",
            content: "Edited order note customer.",
          });
        },
      }
    );
  }

  return (
    <Row gutter={[16, 24]} style={{ height: "100%" }}>
      {contextHolder}
      <Col
        span={14}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: orderDetails.length ? "space-between" : "flex-end",
        }}
      >
        <Space
          direction="vertical"
          style={{
            overflow: "auto",
            width: "100%",
            maxHeight: "350px",
          }}
        >
          <Skeleton
            active
            loading={isLoadingOrderCreate}
            paragraph={{ rows: 9 }}
          >
            {orderDetails.map((orderItem) => (
              <OrderItem
                key={orderItem.id}
                orderDetail={orderItem}
                callBack={callBack}
                isLoading={isLoadingOrderCreate}
              />
            ))}
          </Skeleton>
        </Space>
        <Card style={{ background: token.colorPrimaryBg }}>
          <Row gutter={[16, 24]} style={{ height: "100%" }}>
            <Col span={14}>
              <Space>
                <Text
                  editable={{
                    onChange: debounce(editOrderNote, 300),
                    text: order?.note,
                  }}
                >
                  {order?.note || t("orders.fields.note")}
                </Text>
              </Space>
            </Col>
            <Col span={5}>
              <Space>
                <Text>{t("orders.fields.totalPrice")}</Text>
                <Text>x{totalQuantity}</Text>
              </Space>
            </Col>
            <Col span={5} style={{ textAlign: "end" }}>
              <Text>{moneyFormatter.format(totalPrice)}</Text>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col span={10}>
        <Card
          style={{ background: token.colorPrimaryBg, height: "100%" }}
          bodyStyle={{ height: "100%" }}
          loading={isLoadingProduct}
        >
          <Row
            gutter={[16, 24]}
            style={{
              height: "100%",
            }}
          >
            <Col span={24}>
              {/* Header */}
              <Row gutter={[16, 24]} style={{ height: "100%" }}>
                <Col span={18} style={{ height: "100%" }}>
                  {order.customer == null && order.customer == undefined ? (
                    <AutoComplete
                      style={{
                        width: "100%",
                      }}
                      options={customerOptions}
                      onSelect={(_, option: any) => {
                        editOrderCustomer(option.customer.id);
                      }}
                      filterOption={false}
                      onSearch={debounce(
                        (value: string) => setValue(value),
                        300
                      )}
                    >
                      <Input
                        placeholder={t("search.placeholder.customer")}
                        suffix={<SearchOutlined />}
                      />
                    </AutoComplete>
                  ) : (
                    <CustomerInfor span={24}>
                      <TextContainer>
                        <UserIcon color={token.colorBgMask} />
                        <CustomerName color={token.colorPrimary}>
                          {order.customer?.fullName} - {order.customer.email}
                        </CustomerName>
                      </TextContainer>
                      <CloseButtonWrapper>
                        <Button
                          shape="circle"
                          type="link"
                          icon={
                            <CloseOutlined
                              style={{
                                fontSize: token.fontSize,
                                color: token.colorBgMask,
                              }}
                            />
                          }
                          onClick={() => editOrderCustomer(null)}
                        />
                      </CloseButtonWrapper>
                    </CustomerInfor>
                  )}
                </Col>
                <Col span={6} style={{ height: "100%" }}>
                  <Space>
                    <Button
                      shape="circle"
                      type="text"
                      icon={<UnorderedListOutlined />}
                    />
                    <Button
                      shape="circle"
                      type="text"
                      icon={<FilterOutlined />}
                    />
                    <Button
                      shape="circle"
                      type="text"
                      icon={<PictureOutlined />}
                    />
                  </Space>
                </Col>
              </Row>
            </Col>
            <Col
              span={24}
              style={{
                maxHeight: "300px",
                overflow: "auto",
                minHeight: "300px",
              }}
            >
              {/* Content */}
              <Row gutter={[16, 24]}>
                {products.map((product) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    onClickFunction={handleProductClick}
                  />
                ))}
              </Row>
            </Col>
            <Col span={24}>
              {/* Footer */}
              <Row
                gutter={[16, 24]}
                style={{
                  height: "100%",
                }}
              >
                <Col
                  span={10}
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Pagination
                    simple
                    current={pagination.current}
                    onChange={onChange}
                    pageSize={pagination.pageSize}
                    total={data?.total}
                  />
                </Col>
                <Col span={14} style={{ padding: 0, height: "100%" }}>
                  <Button
                    type="primary"
                    size={"large"}
                    style={{ width: "100%", fontWeight: "500" }}
                    onClick={showDrawer}
                  >
                    {t("actions.proceedPay")}
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      </Col>
      <CheckOutDrawer
        open={drawerOpen}
        onClose={onDrawerClose}
        order={order}
        callBack={callBack}
      />
    </Row>
  );
};

const renderItem = (title: string, imageUrl: string, customer: ICustomer) => ({
  value: title,
  label: (
    <Row style={{ display: "flex", alignItems: "center" }}>
      <Col span={4}>
        <Avatar size={48} src={imageUrl} style={{ minWidth: "48px" }} />
      </Col>
      <Col span={20}>
        <Text style={{ marginLeft: "16px" }}>{title}</Text>
      </Col>
    </Row>
  ),
  customer: customer,
});
