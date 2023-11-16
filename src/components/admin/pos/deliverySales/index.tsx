import {
  CheckOutlined,
  CloseOutlined,
  CreditCardFilled,
  PlusSquareFilled,
  SearchOutlined,
} from "@ant-design/icons";
import {
  HttpError,
  useCreateMany,
  useCustom,
  useCustomMutation,
  useList,
  useNavigation,
  useTranslate,
  useUpdate,
} from "@refinedev/core";
import {
  AutoComplete,
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  PaginationProps,
  Row,
  Select,
  Skeleton,
  Space,
  Switch,
  TablePaginationConfig,
  Typography,
  message,
  theme,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import InputMask from "react-input-mask";
import {
  ICustomer,
  IDistrict,
  IEmployee,
  IOption,
  IOrder,
  IPayment,
  IPaymentConvertedPayload,
  IPaymentMethod,
  IProduct,
  IProvince,
  ITransportAddress,
  IWard,
} from "../../../../interfaces";
import { formatTimestamp } from "../../../../utils";
import { OrderItem } from "../orderItem";
import {
  CloseButtonWrapper,
  CustomerInfor,
  CustomerName,
  TextContainer,
  UserIcon,
} from "./styled";
import { PaymentModal } from "../paymentModal";
import { NumberField } from "@refinedev/antd";
import { DiscountModal } from "../discountModal";
import ShoppingCartHeader from "../cartHeader";
const { useToken } = theme;
const { Text, Title } = Typography;

const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const GHN_SHOP_ID = import.meta.env.VITE_GHN_SHOP_ID;
const GHN_TOKEN = import.meta.env.VITE_GHN_USER_TOKEN;

const filterOption = (
  input: string,
  option?: { label: string; value: number }
) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

type DeliverySalesProps = {
  order: IOrder;
  callBack: () => void;
  setProductDetailModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedProduct: React.Dispatch<
    React.SetStateAction<IProduct | undefined>
  >;
};

export const DeliverySales: React.FC<DeliverySalesProps> = ({
  order,
  callBack,
}) => {
  const t = useTranslate();
  const { token } = useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const [value, setValue] = useState<string>("");
  const [customerOptions, setCustomerOptions] = useState<IOption[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<IOption[]>([]);
  const [valueEmployee, setValueEmployee] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>();
  const [payments, setPayments] = useState<IPayment[]>();

  const [form] = Form.useForm<ITransportAddress>();
  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [wards, setWards] = useState<IWard[]>([]);
  const provinceId = Form.useWatch("provinceId", form);
  const districtId = Form.useWatch("districtId", form);
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");
  const [shippingMoney, setShippingMoney] = useState(0);

  const { list } = useNavigation();
  const { mutate: calculateFeeMutate } = useCustomMutation<any>();
  const { mutate: paymentMutateCreateMany } = useCreateMany();

  const { mutate: mutateUpdate } = useUpdate();
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
          renderItemCustomer(
            `${item.fullName} - ${item.email}`,
            item.image,
            item
          )
        );
        if (customerOptions.length > 0) {
          setCustomerOptions(customerOptions);
        }
      },
    },
  });

  const { refetch: refetchEmployees } = useList<IEmployee>({
    resource: "employees",
    config: {
      filters: [{ field: "q", operator: "contains", value: valueEmployee }],
    },
    pagination: {
      pageSize: 1000,
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data) => {
        const employeeOptions = data.data.map((item) =>
          renderItemEmployee(item.fullName, item.phoneNumber, item.image, item)
        );
        if (employeeOptions.length > 0) {
          setEmployeeOptions(employeeOptions);
        }
      },
    },
  });

  const { data, isLoading } = useList<IPaymentMethod, HttpError>({
    resource: "payment-methods",
    sorters: [
      {
        field: "createdAt",
        order: "asc",
      },
    ],
  });

  const { isLoading: isLoadingProvince, refetch: refetchProvince } = useCustom<
    IProvince[]
  >({
    url: `${GHN_API_BASE_URL}/master-data/province`,
    method: "get",
    config: {
      headers: {
        token: GHN_TOKEN,
      },
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data) => {
        setProvinces(data.data);
      },
    },
  });

  const { isLoading: isLoadingDistrict, refetch: refetchDistrict } = useCustom<
    IDistrict[]
  >({
    url: `${GHN_API_BASE_URL}/master-data/district`,
    method: "get",
    config: {
      headers: {
        token: GHN_TOKEN,
      },
      query: {
        province_id: provinceId,
      },
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data) => {
        setDistricts(data.data);
      },
    },
  });

  const { isLoading: isLoadingWard, refetch: refetchWard } = useCustom<IWard[]>(
    {
      url: `${GHN_API_BASE_URL}/master-data/ward`,
      method: "get",
      config: {
        headers: {
          token: GHN_TOKEN,
        },
        query: {
          district_id: districtId,
        },
      },
      queryOptions: {
        enabled: false,
        onSuccess: (data) => {
          setWards(data.data);
        },
      },
    }
  );

  useEffect(() => {
    setProvinces([]);
    refetchProvince();
  }, []);

  useEffect(() => {
    if (provinceId) {
      setDistricts([]);
      refetchDistrict();
    }
  }, [provinceId]);

  useEffect(() => {
    if (districtId) {
      setWards([]);
      refetchWard();
    }
  }, [districtId]);

  useEffect(() => {
    setCustomerOptions([]);
    refetchCustomer();
  }, [value]);

  useEffect(() => {
    setEmployeeOptions([]);
    refetchEmployees();
  }, [valueEmployee]);

  useEffect(() => {
    if (data && data.data && data.data.length > 0) {
      setPaymentMethods(data.data);
      setPayments([
        {
          id: "",
          order: order,
          paymentMethod: data.data[0],
          transactionCode: "",
          totalMoney: totalPrice,
          description: "",
          createdAt: 0,
        },
      ]);
    }
  }, [data]);

  useEffect(() => {}, [order]);

  const orderDetails = order?.orderDetails || [];
  const initialPrice = orderDetails.length > 0 ? orderDetails[0].price : 0;
  const totalQuantity = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.quantity;
  }, 0);
  const totalPrice = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.totalPrice;
  }, 0);
  const [change, setChange] = useState(initialPrice - totalPrice);
  const [discount, setDiscount] = useState(0);

  const [isDiscountModalVisible, setIsDiscountModalVisible] = useState(false);

  const showDiscountModal = () => {
    setIsDiscountModalVisible(true);
  };

  const handleDiscountModalOk = () => {
    setIsDiscountModalVisible(false);
  };

  const handleDiscountModalCancel = () => {
    setIsDiscountModalVisible(false);
  };

  useEffect(() => {
    if (payments) {
      const customerPaid = payments.reduce(
        (acc, payment) => acc + payment.totalMoney,
        0
      );
      const changeAmount = customerPaid - (totalPrice - discount);
      setChange(changeAmount);
    }
  }, [payments]);

  useEffect(() => {
    if (order.voucher && order.voucher.type) {
      if (order.voucher.type === "PERCENTAGE") {
        setDiscount((order.voucher.value / 100) * totalPrice);
      } else {
        setDiscount(order.voucher.value);
      }
    }
  }, [order.voucher]);

  const handleProvinceChange = (value: number, option: any) => {
    setProvinceName(option.label);
  };

  const handleDistrictChange = (value: number, option: any) => {
    setDistrictName(option.label);
  };

  const handleWardChange = (value: number, option: any) => {
    setWardName(option.label);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  if (order.customer) {
    const defaultAddress = order?.customer.addressList.find(
      (address) => address.isDefault === true
    );

    if (defaultAddress) {
      form.setFieldsValue({
        phoneNumber: defaultAddress.phoneNumber,
        provinceId: Number(defaultAddress.provinceId),
        districtId: Number(defaultAddress.districtId),
        wardCode: defaultAddress.wardCode,
        more: defaultAddress.more,
      });
    }
  }

  function editOrderNote(value: string): void {
    if (value !== order.note)
      mutateUpdate(
        {
          resource: "orders",
          values: {
            ...order,
            customer: order.customer ? order.customer.id : null,
            employee: order.employee ? order.employee.id : null,
            voucher: order.voucher ? order.voucher.id : null,
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
              content: t("orders.notification.note.edit.error"),
            });
          },
          onSuccess: (data, variables, context) => {
            callBack();
            messageApi.open({
              type: "success",
              content: t("orders.notification.note.edit.success"),
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
          employee: order.employee ? order.employee.id : null,
          voucher: order.voucher ? order.voucher.id : null,
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

  function editOrderEmployee(value: string | null): void {
    mutateUpdate(
      {
        resource: "orders",
        values: {
          ...order,
          employee: value,
          customer: order.customer ? order.customer.id : null,
          voucher: order.voucher ? order.voucher.id : null,
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
            content: t("orders.notification.employee.edit.error"),
          });
        },
        onSuccess: (data, variables, context) => {
          callBack();
          messageApi.open({
            type: "success",
            content: t("orders.notification.employee.edit.siccess"),
          });
        },
      }
    );
  }

  function calculateShippingFee(): void {
    calculateFeeMutate(
      {
        url: `${GHN_API_BASE_URL}/v2/shipping-order/fee`,
        method: "post",
        values: {
          from_district_id: 1542,
          service_id: 53321,
          to_district_id: form.getFieldValue("districtId"),
          to_ward_code: form.getFieldValue("wardCode"),
          height: form.getFieldValue("height"),
          length: form.getFieldValue("length"),
          weight: form.getFieldValue("weight"),
          width: form.getFieldValue("width"),
          insurance_value: 500000,
        },
        config: {
          headers: {
            "Content-Type": "application/json",
            Token: GHN_TOKEN,
            ShopId: GHN_SHOP_ID,
          },
        },
      },
      {
        onError: (error, variables, context) => {
          // An error occurred!
        },
        onSuccess: (data, variables, context) => {
          setShippingMoney(data?.data.total);
        },
      }
    );
  }

  function submitOrder(): void {
    const submitData = {
      ...order,
      customer: order.customer ? order.customer.id : null,
      employee: order.employee ? order.employee.id : null,
      voucher: order.voucher ? order.voucher.id : null,
      fullName: form.getFieldValue("fullName"),
      shippingMoney: shippingMoney,
      type: "ONLINE",
      totalMoney: totalPrice - discount + shippingMoney,
      status: "WAIT_FOR_CONFIRMATION",
    };

    mutateUpdate(
      {
        resource: "orders",
        values: submitData,
        id: order.id,
      },
      {
        onError: (error, variables, context) => {
          // An error occurred!
        },
        onSuccess: (data, variables, context) => {
          callBack();
          const convertedPayload: IPaymentConvertedPayload[] =
            convertToPayload(payments);
          paymentMutateCreateMany(
            {
              resource: "payments",
              values: convertedPayload,
            },
            {
              onError: (error, variables, context) => {},
              onSuccess: (data, variables, context) => {
                list("orders");
              },
            }
          );
        },
      }
    );
  }

  return (
    <Row gutter={[16, 24]} style={{ height: "100%" }}>
      <Col
        span={12}
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
            <Col span={10}>
              <Col span={24}>
                <Flex gap="middle" justify="space-between" align="center">
                  <Space size="large" wrap>
                    <Text>{t("orders.fields.totalPrice")}</Text>
                    <Text>{totalQuantity}</Text>
                  </Space>
                  <Title level={5}>
                    <NumberField
                      options={{
                        currency: "VND",
                        style: "currency",
                      }}
                      value={totalPrice}
                    />
                  </Title>
                </Flex>
              </Col>
              <Col span={24}>
                <Flex gap="middle" justify="space-between" align="center">
                  <Space size="large" wrap>
                    <Text>{t("orders.tab.discount")}</Text>
                    <Button
                      disabled={!order.customer}
                      type="text"
                      size="small"
                      icon={
                        <PlusSquareFilled
                          style={{ color: token.colorPrimary }}
                        />
                      }
                      onClick={showDiscountModal}
                    />
                  </Space>
                  <Title level={5}>
                    <NumberField
                      options={{
                        currency: "VND",
                        style: "currency",
                      }}
                      value={discount}
                    />
                  </Title>
                </Flex>
              </Col>
              <Col span={24}>
                <Flex gap="middle" justify="space-between" align="center">
                  <Space size="large" wrap>
                    <Text>{t("orders.tab.shippingMoney")}</Text>
                  </Space>
                  <Title level={5} style={{ color: `${token.colorPrimary}` }}>
                    <NumberField
                      options={{
                        currency: "VND",
                        style: "currency",
                      }}
                      value={shippingMoney}
                    />
                  </Title>
                </Flex>
              </Col>
              <Col span={24}>
                <Flex gap="middle" justify="space-between" align="center">
                  <Space size="large" wrap>
                    <Text strong>{t("orders.tab.amountDue")}</Text>
                  </Space>
                  <Title level={5} style={{ color: `${token.colorPrimary}` }}>
                    <NumberField
                      options={{
                        currency: "VND",
                        style: "currency",
                      }}
                      value={totalPrice - discount + shippingMoney}
                    />
                  </Title>
                </Flex>
              </Col>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col span={12}>
        <Card
          style={{ background: token.colorPrimaryBg, height: "100%" }}
          bodyStyle={{ height: "100%" }}
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
            <Row gutter={[10, 10]} style={{ height: "100%" }}>
              <Col span={24}>
                <Row>
                  <Col span={16}>
                    {order.employee == null && order.employee == undefined ? (
                      <AutoComplete
                        style={{
                          width: "100%",
                        }}
                        options={employeeOptions}
                        onSelect={(_, option: any) => {
                          editOrderEmployee(option.employee.id);
                        }}
                        filterOption={false}
                        onSearch={debounce(
                          (value: string) => setValueEmployee(value),
                          300
                        )}
                      >
                        <Input
                          placeholder={t("search.placeholder.employee")}
                          suffix={<SearchOutlined />}
                        />
                      </AutoComplete>
                    ) : (
                      <CustomerInfor span={24}>
                        <TextContainer>
                          <UserIcon color={token.colorBgMask} />
                          <CustomerName color={token.colorPrimary}>
                            {order.employee?.fullName} -{" "}
                            {order.employee.phoneNumber}
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
                            onClick={() => editOrderEmployee(null)}
                          />
                        </CloseButtonWrapper>
                      </CustomerInfor>
                    )}
                  </Col>
                  <Col span={8} style={{ textAlign: "end" }}>
                    <Space wrap>
                      <Text>{formatTimestamp(order.createdAt).dateFormat}</Text>
                      <Text>{formatTimestamp(order.createdAt).timeFormat}</Text>
                    </Space>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row>
                  <Col span={16} style={{ height: "100%" }}>
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
                </Row>
              </Col>
            </Row>
            <Row
              gutter={[16, 24]}
              style={{
                height: "100%",
              }}
            >
              {/* Content */}
              <Col
                span={24}
                style={{
                  maxHeight: "208.4px",
                  overflow: "auto",
                }}
              >
                <Row gutter={[16, 24]}>
                  <Col span={24}>
                    <Flex gap="middle" justify="space-between" align="center">
                      <Space size="large" wrap>
                        <Text strong>{t("orders.tab.customerPay")}</Text>
                        <Button
                          size="small"
                          type="text"
                          icon={
                            <CreditCardFilled
                              style={{ color: token.colorPrimary }}
                            />
                          }
                          onClick={showModal}
                        />
                      </Space>
                      <Title level={4}>
                        {payments ? (
                          <NumberField
                            options={{
                              currency: "VND",
                              style: "currency",
                            }}
                            value={payments.reduce(
                              (acc, payment) => acc + payment.totalMoney,
                              0
                            )}
                          />
                        ) : (
                          "Loading..."
                        )}
                      </Title>
                    </Flex>
                  </Col>
                  <Col span={24}>
                    <Flex gap="middle" justify="space-between" align="center">
                      <Space size="large" wrap>
                        <Text strong>{t("orders.tab.cod")}</Text>
                        <Switch
                          checkedChildren={<CheckOutlined />}
                          unCheckedChildren={<CloseOutlined />}
                          size="small"
                        />
                      </Space>
                      <Text strong>
                        <NumberField
                          options={{
                            currency: "VND",
                            style: "currency",
                          }}
                          value={0}
                        />
                      </Text>
                    </Flex>
                  </Col>
                  <Col span={24}>
                    <Flex gap="middle" justify="space-between" align="center">
                      <Space size="large" wrap>
                        <Text strong>{t("orders.tab.change")}</Text>
                      </Space>
                      <Text strong>
                        <NumberField
                          options={{
                            currency: "VND",
                            style: "currency",
                          }}
                          value={change}
                        />
                      </Text>
                    </Flex>
                  </Col>
                  <Col span={24} style={{ padding: 0 }}>
                    <Form form={form} layout="vertical" autoComplete="off">
                      <Col span={24}>
                        <Form.Item
                          name="fullName"
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                          style={{ width: "100%" }}
                        >
                          <Input
                            placeholder="Recipient's name"
                            bordered={false}
                            style={{
                              width: "100%",
                              borderBottom: `1px solid ${token.colorPrimary}`,
                              borderRadius: 0,
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="phoneNumber"
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                        >
                          <InputMask
                            bordered={false}
                            style={{
                              width: "100%",
                              borderBottom: `1px solid ${token.colorPrimary}`,
                              borderRadius: 0,
                            }}
                            placeholder="Phone number"
                            mask="(+84) 999 999 999"
                            // value={phoneInputValue}
                            // onChange={(e) => setPhoneInputValue(e.target.value)}
                          >
                            {/* 
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore */}
                            {(props: InputProps) => <Input {...props} />}
                          </InputMask>
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="provinceId"
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            bordered={false}
                            style={{
                              width: "100%",
                              borderBottom: `1px solid ${token.colorPrimary}`,
                              borderRadius: 0,
                            }}
                            placeholder={t(
                              "customers.fields.province.placeholder"
                            )}
                            loading={isLoadingProvince}
                            onChange={handleProvinceChange}
                            filterOption={filterOption}
                            options={provinces.map((province) => ({
                              label: province.ProvinceName,
                              value: province.ProvinceID,
                            }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="districtId"
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            bordered={false}
                            style={{
                              width: "100%",
                              borderBottom: `1px solid ${token.colorPrimary}`,
                              borderRadius: 0,
                            }}
                            placeholder={t(
                              "customers.fields.district.placeholder"
                            )}
                            loading={isLoadingDistrict}
                            onChange={handleDistrictChange}
                            filterOption={filterOption}
                            options={districts.map((district) => ({
                              label: district.DistrictName,
                              value: district.DistrictID,
                            }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="wardCode"
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            bordered={false}
                            style={{
                              width: "100%",
                              borderBottom: `1px solid ${token.colorPrimary}`,
                              borderRadius: 0,
                            }}
                            placeholder={t("customers.fields.ward.placeholder")}
                            loading={isLoadingWard}
                            onChange={handleWardChange}
                            filterOption={filterOption}
                            options={wards.map((ward) => ({
                              label: ward.WardName,
                              value: ward.WardCode,
                            }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="more"
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                        >
                          <TextArea
                            bordered={false}
                            style={{
                              width: "100%",
                              borderBottom: `1px solid ${token.colorPrimary}`,
                              borderRadius: 0,
                            }}
                            placeholder="Address line"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Row align="middle" gutter={5}>
                          <Col span={4}>
                            <Form.Item
                              name="weight"
                              rules={[
                                {
                                  required: true,
                                },
                              ]}
                              initialValue={900}
                            >
                              <InputNumber
                                bordered={false}
                                style={{
                                  width: "100%",
                                  borderBottom: `1px solid ${token.colorPrimary}`,
                                  borderRadius: 0,
                                }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item
                              name="weightUnit"
                              rules={[
                                {
                                  required: true,
                                },
                              ]}
                              initialValue="gram"
                            >
                              <Select
                                showSearch
                                bordered={false}
                                style={{
                                  width: "100%",
                                }}
                                options={[
                                  { value: "gram", label: "gram" },
                                  { value: "kg", label: "kg" },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={3}>
                            <Form.Item
                              name="length"
                              rules={[
                                {
                                  required: true,
                                },
                              ]}
                              initialValue={1}
                            >
                              <InputNumber
                                bordered={false}
                                style={{
                                  width: "100%",
                                  borderBottom: `1px solid ${token.colorPrimary}`,
                                  borderRadius: 0,
                                }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={3}>
                            <Form.Item
                              name="witdth"
                              rules={[
                                {
                                  required: true,
                                },
                              ]}
                              initialValue={1}
                            >
                              <InputNumber
                                bordered={false}
                                style={{
                                  width: "100%",
                                  borderBottom: `1px solid ${token.colorPrimary}`,
                                  borderRadius: 0,
                                }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={3}>
                            <Form.Item
                              name="height"
                              rules={[
                                {
                                  required: true,
                                },
                              ]}
                              initialValue={1}
                            >
                              <InputNumber
                                bordered={false}
                                style={{
                                  width: "100%",
                                  borderBottom: `1px solid ${token.colorPrimary}`,
                                  borderRadius: 0,
                                }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={7} style={{ textAlign: "center" }}>
                            <Text style={{ fontSize: "12px" }}>
                              length x width x height (cm)
                            </Text>
                            <Button
                              type="primary"
                              size={"small"}
                              style={{ width: "100%" }}
                              onClick={calculateShippingFee}
                            >
                              {t("actions.calculateShipping")}
                            </Button>
                          </Col>
                        </Row>
                      </Col>
                    </Form>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row gutter={[16, 24]}>
              <Col span={24}>
                {/* Footer */}
                <Button
                  type="primary"
                  size={"large"}
                  style={{ width: "100%", fontWeight: "500" }}
                  onClick={submitOrder}
                >
                  {t("actions.pay")}
                </Button>
              </Col>
            </Row>
          </Space>
        </Card>
      </Col>
      <PaymentModal
        open={isModalVisible}
        handleOk={handleModalOk}
        handleCancel={handleModalCancel}
        paymentMethods={paymentMethods}
        payments={payments}
        initialPrice={initialPrice}
        totalPrice={totalPrice}
        setPayments={setPayments}
        order={order}
      />
      <DiscountModal
        open={isDiscountModalVisible}
        handleOk={handleDiscountModalOk}
        handleCancel={handleDiscountModalCancel}
        customer={order.customer}
        order={order}
        callBack={callBack}
      />
    </Row>
  );
};

const renderItemCustomer = (
  title: string,
  imageUrl: string,
  customer: ICustomer
) => ({
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

const renderItemEmployee = (
  name: string,
  phoneNumber: string,
  imageUrl: string,
  employee: IEmployee
) => ({
  value: name,
  label: (
    <Row style={{ display: "flex", alignItems: "center" }}>
      <Col span={6}>
        <Avatar size={32} src={imageUrl} style={{ minWidth: "32px" }} />
      </Col>
      <Col span={18}>
        <Flex vertical>
          <Text>{name}</Text>
          <Text>{phoneNumber}</Text>
        </Flex>
      </Col>
    </Row>
  ),
  employee: employee,
});

function convertToPayload(
  payments: IPayment[] | undefined
): IPaymentConvertedPayload[] {
  if (!payments) return [];
  return payments.map((payment) => ({
    order: payment.order.id,
    paymentMethod: payment.paymentMethod.id,
    totalMoney: payment.totalMoney,
    transactionCode: payment.transactionCode,
  }));
}
