import {
  AppstoreOutlined,
  CloseOutlined,
  FilterOutlined,
  PictureOutlined,
  PlusOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { NumberField } from "@refinedev/antd";
import { HttpError, useList, useTranslate, useUpdate } from "@refinedev/core";
import {
  AutoComplete,
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Input,
  Pagination,
  PaginationProps,
  Row,
  Skeleton,
  Space,
  Spin,
  TablePaginationConfig,
  Tooltip,
  Typography,
  message,
  theme,
} from "antd";
import { debounce } from "lodash";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { ICustomer, IOption, IOrder, IProduct } from "../../../../interfaces";
import { CheckOutDrawer } from "../checkOutDrawer";
import { OrderItem } from "../orderItem";
import { ProductItem } from "../productItem";
import {
  CloseButtonWrapper,
  CustomerInfor,
  CustomerName,
  TextContainer,
  UserIcon,
} from "./styled";
import { PosFilter } from "../filterDrawer";
import { ColorModeContext } from "../../../../contexts/color-mode";
import ShoppingCartHeader from "../cartHeader";
const { useToken } = theme;
const { Text, Title } = Typography;

type DirectSalesProps = {
  order: IOrder;
  callBack: () => void;
  setProductDetailModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedProduct: React.Dispatch<
    React.SetStateAction<IProduct | undefined>
  >;
  showCreateCustomerModal: () => void;
  showEditCustomerModal: () => void;
  customerOptions: IOption[];
  setCustomerSearch: Dispatch<SetStateAction<string>>;
};

export const DirectSales: React.FC<DirectSalesProps> = ({
  order,
  customerOptions,
  callBack,
  setProductDetailModalVisible,
  setSelectedProduct,
  showCreateCustomerModal,
  showEditCustomerModal,
  setCustomerSearch,
}) => {
  const t = useTranslate();
  const { token } = useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const { mode } = useContext(ColorModeContext);
  const [pLayout, setpLayout] = useState<"horizontal" | "vertical">(
    "horizontal"
  );
  const [products, setProducts] = useState<IProduct[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
  });

  const [brandFilter, setBrandFilter] = useState("");
  const [MaterialFilter, setMaterialFilter] = useState("");
  const [SoleFilter, setSoleFilter] = useState("");
  const [StyleFilter, setStyleFilter] = useState("");
  const [TradeMarkFilter, setTradeMarkFilter] = useState("");
  const [ColorFilter, setColorFilter] = useState("");
  const [SizeFilter, setSizeFilter] = useState("");

  const { mutate: mutateUpdate, isLoading: isLoadingOrderUpdate } = useUpdate();
  const {
    data,
    isLoading: isLoadingProduct,
    refetch,
  } = useList<IProduct, HttpError>({
    resource: "products",
    filters: [
      {
        field: "minQuantity",
        operator: "eq",
        value: 1,
      },
      {
        field: "brands",
        operator: "eq",
        value: brandFilter,
      },
    ],
    pagination: pagination,
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

  const [checkOutDrawerOpen, setCheckOutDrawerOpen] = useState(false);

  const showCheckOutDrawer = () => {
    setCheckOutDrawerOpen(true);
  };

  const onCheckOutDrawerClose = () => {
    setCheckOutDrawerOpen(false);
  };

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const showFilterDrawer = () => {
    setFilterDrawerOpen(true);
  };

  const onFilterDrawerClose = () => {
    setFilterDrawerOpen(false);
  };

  const handleToggleLayout = () => {
    setpLayout((prevLayout) =>
      prevLayout === "horizontal" ? "vertical" : "horizontal"
    );
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
              content: t("orders.notification.editNote.error"),
            });
          },
          onSuccess: (data, variables, context) => {
            callBack();
            messageApi.open({
              type: "success",
              content: t("orders.notification.editNote.success"),
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
            content: t("orders.notification.customer.edit.error"),
          });
        },
        onSuccess: (data, variables, context) => {
          callBack();
          messageApi.open({
            type: "success",
            content: t("orders.notification.customer.edit.success"),
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
          justifyContent: "space-between",
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
          <ShoppingCartHeader />
          {orderDetails.map((orderItem, index) => (
            <OrderItem
              key={orderItem.id}
              orderDetail={orderItem}
              callBack={callBack}
              count={index}
            />
          ))}
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
          </Row>
        </Card>
      </Col>
      <Col span={10}>
        <Card
          style={{
            background: token.colorPrimaryBg,
            height: "100%",
          }}
          bodyStyle={{
            height: "100%",
          }}
        >
          <Space
            direction="vertical"
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Header */}
            <Row gutter={[16, 24]}>
              <Col span={18}>
                <Spin spinning={isLoadingOrderUpdate} style={{ width: "100%" }}>
                  {order.customer == null && order.customer == undefined ? (
                    <>
                      <AutoComplete
                        style={{
                          width: "90%",
                        }}
                        options={customerOptions}
                        onSelect={(_, option: any) => {
                          editOrderCustomer(option.customer.id);
                        }}
                        filterOption={false}
                        onSearch={debounce(
                          (value: string) => setCustomerSearch(value),
                          300
                        )}
                      >
                        <Input
                          prefix={<SearchOutlined />}
                          placeholder={t("search.placeholder.customer")}
                        />
                      </AutoComplete>
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        shape="circle"
                        onClick={showCreateCustomerModal}
                      ></Button>
                    </>
                  ) : (
                    <CustomerInfor
                      color={mode === "light" ? "#f5f5f5" : ""}
                      span={24}
                    >
                      <TextContainer>
                        <UserIcon
                          color={
                            mode === "light" ? token.colorBgMask : "#ffffff"
                          }
                        />
                        <CustomerName
                          color={token.colorPrimary}
                          onClick={showEditCustomerModal}
                        >
                          {order.customer?.fullName}
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
                                color:
                                  mode == "light"
                                    ? token.colorBgMask
                                    : "#ffffff",
                              }}
                            />
                          }
                          onClick={() => editOrderCustomer(null)}
                        />
                      </CloseButtonWrapper>
                    </CustomerInfor>
                  )}
                </Spin>
              </Col>
              <Col span={2}>
                <Button
                  shape="circle"
                  type="text"
                  icon={<UnorderedListOutlined />}
                />
              </Col>
              <Col span={2}>
                <Button
                  shape="circle"
                  type="text"
                  icon={<FilterOutlined />}
                  onClick={showFilterDrawer}
                />
              </Col>
              <Col span={2}>
                <Button
                  shape="circle"
                  type="text"
                  icon={
                    pLayout === "horizontal" ? (
                      <AppstoreOutlined />
                    ) : (
                      <PictureOutlined />
                    )
                  }
                  onClick={handleToggleLayout}
                />
              </Col>
            </Row>
            {/* Content */}
            <Row gutter={[16, 24]} style={{ height: "100%", overflow: "auto" }}>
              <Col
                span={24}
                style={{
                  maxHeight: "250px",
                }}
              >
                <Skeleton active loading={isLoadingProduct}>
                  <Row gutter={[16, 24]}>
                    {products.map((product) => (
                      <ProductItem
                        layout={pLayout}
                        key={product.id}
                        product={product}
                        onClickFunction={handleProductClick}
                      />
                    ))}
                  </Row>
                </Skeleton>
              </Col>
            </Row>
            {/* Footer */}
            <Row gutter={[16, 24]} align="middle" justify="center">
              <Col span={8} flex="auto">
                <Pagination
                  current={pagination.current}
                  onChange={onChange}
                  pageSize={pagination.pageSize}
                  total={data?.total}
                  itemRender={itemRender}
                />
              </Col>
              <Col span={16} style={{ padding: 0 }}>
                <Tooltip
                  title={
                    orderDetails.length <= 0
                      ? "Vui lòng thêm sản phẩm vào trước."
                      : ""
                  }
                >
                  <Button
                    type="primary"
                    size={"large"}
                    style={{ width: "100%", fontWeight: "500" }}
                    onClick={showCheckOutDrawer}
                    disabled={orderDetails.length <= 0}
                  >
                    {t("actions.proceedPay")}
                  </Button>
                </Tooltip>
              </Col>
            </Row>
          </Space>
        </Card>
      </Col>
      <CheckOutDrawer
        open={checkOutDrawerOpen}
        onClose={onCheckOutDrawerClose}
        order={order}
        callBack={callBack}
      />
      <PosFilter
        open={filterDrawerOpen}
        onClose={onFilterDrawerClose}
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

const itemRender = (
  page: number,
  type: "page" | "prev" | "next" | "jump-prev" | "jump-next",
  element: ReactNode
) => {
  if (type === "prev") {
    return element;
  }
  if (type === "next") {
    return element;
  }
};
