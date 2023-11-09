import {
  HttpError,
  useCreateMany,
  useList,
  useNavigation,
  useTranslate,
  useUpdate,
} from "@refinedev/core";
import {
  Drawer,
  Input,
  Select,
  Space,
  Typography,
  Grid,
  Button,
  Row,
  Col,
  Divider,
  theme,
  Flex,
  Radio,
  RadioChangeEvent,
  QRCode,
  Avatar,
  AutoComplete,
  message,
} from "antd";
import {
  CloseOutlined,
  CreditCardFilled,
  PlusSquareFilled,
  SearchOutlined,
} from "@ant-design/icons";
import {
  IEmployee,
  IOption,
  IOrder,
  IPayment,
  IPaymentConvertedPayload,
  IPaymentMethod,
} from "../../../interfaces";
import { useEffect, useState } from "react";
import { moneyFormatter } from "../../../utils/moneyFormatter";
import { PaymentModal } from "../paymentModal";
import { formatTimestamp } from "../../../utils/timestampFormatter";
import { debounce } from "lodash";
import {
  CloseButtonWrapper,
  CustomerInfor,
  CustomerName,
  TextContainer,
  UserIcon,
} from "../deliverySales/styled";

const { Text, Title } = Typography;
const { useToken } = theme;

type CheckOutDrawerProps = {
  open: boolean;
  onClose: () => void;
  callBack: () => void;
  order: IOrder;
};

export const CheckOutDrawer: React.FC<CheckOutDrawerProps> = ({
  open,
  onClose,
  order,
  callBack,
}) => {
  const t = useTranslate();
  const { token } = useToken();
  const { mutate: mutateUpdate } = useUpdate();
  const { mutate: paymentMutateCreateMany } = useCreateMany();
  const { list } = useNavigation();
  const [messageApi, contextHolder] = message.useMessage();
  const breakpoint = Grid.useBreakpoint();

  const orderDetails = order?.orderDetails || [];
  const totalQuantity = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.quantity;
  }, 0);
  const totalPrice = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.totalPrice;
  }, 0);

  const initialPrice = orderDetails.length > 0 ? orderDetails[0].price : 0;
  const [customerPaid, setCustomerPaid] = useState(initialPrice);
  const [change, setChange] = useState(initialPrice - totalPrice);

  useEffect(() => {
    const changeAmount = customerPaid - totalPrice;
    setChange(changeAmount);
  }, [customerPaid, totalPrice]);

  const suggestedMoney = [0, 100000, 200000, 300000];

  const buttons = suggestedMoney.map((money, index) => {
    const totalMoney = totalPrice + money;
    return (
      <Col span={24 / suggestedMoney.length} key={index}>
        <Button
          size="large"
          shape="round"
          key={index}
          onClick={() => setCustomerPaid(totalMoney)}
          style={{ width: "100%" }}
        >
          {totalMoney.toLocaleString()}
        </Button>
      </Col>
    );
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

  const [employeeOptions, setEmployeeOptions] = useState<IOption[]>([]);
  const [value, setValue] = useState<string>("");

  const { refetch: refetchEmployees } = useList<IEmployee>({
    resource: "employees",
    config: {
      filters: [{ field: "q", operator: "contains", value }],
    },
    pagination: {
      pageSize: 1000,
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data) => {
        const employeeOptions = data.data.map((item) =>
          renderItem(item.fullName, item.phoneNumber, item.image, item)
        );
        if (employeeOptions.length > 0) {
          setEmployeeOptions(employeeOptions);
        }
      },
    },
  });

  useEffect(() => {
    setEmployeeOptions([]);
    refetchEmployees();
  }, [value]);

  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>();
  const [payments, setPayments] = useState<IPayment[]>();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    if (data && data.data && data.data.length > 0) {
      setPaymentMethods(data.data);
      setPayments([
        {
          id: "",
          order: order,
          paymentMethod: data.data[0],
          transactionCode: "string",
          totalMoney: totalPrice,
          description: "string",
          createdAt: 0,
        },
      ]);
    }
  }, [data]);

  function handleRadioChange(e: RadioChangeEvent): void {
    setPayments([
      {
        id: "",
        order: order,
        paymentMethod: e.target.value,
        transactionCode: "string",
        totalMoney: totalPrice,
        description: "string",
        createdAt: 0,
      },
    ]);
  }

  function submitOrder(): void {
    mutateUpdate(
      {
        resource: "orders",
        values: {
          ...order,
          customer: order.customer ? order.customer.id : null,
          employee: order.employee ? order.employee.id : null,
          voucher: order.voucher ? order.voucher.id : null,
          address: order.address ? order.address.id : null,
          totalMoney: totalPrice,
          status: "COMPLETED",
        },
        id: order.id,
      },
      {
        onError: (error, variables, context) => {
          // An error occurred!
        },
        onSuccess: (data, variables, context) => {
          callBack();
          onClose();
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

  const renderSingleMethod = (methodName: string) => {
    switch (methodName) {
      case "Cash":
        return renderCashMethod();
      case "Transfer":
        return renderTransferMethod();
      case "Card":
        return renderCardMethod();
      default:
        return null;
    }
  };

  const renderCashMethod = () => (
    <Row
      gutter={10}
      style={{
        background: "#f5f5f5",
        padding: "10px",
        borderRadius: "0.5rem",
      }}
    >
      {buttons}
    </Row>
  );

  const renderTransferMethod = () => (
    <Row gutter={[16, 24]}>
      <Col span={8}>
        <QRCode
          errorLevel="H"
          value="00020101021138570010A00000072701270006970436011306910004415480208QRIBFTTA53037045802VN63042141"
          icon="https://cdn.haitrieu.com/wp-content/uploads/2022/02/Icon-Vietcombank.png"
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
            margin: "0 auto",
          }}
        />
      </Col>
      <Col span={16}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Col span={24}>
            <Select
              showSearch
              placeholder="Select a person"
              optionFilterProp="children"
              style={{ width: "100%" }}
              defaultValue="0691000441548"
              disabled
              options={[
                {
                  value: "0691000441548",
                  label: "VCB - 0691000441548 - NGUYEN ANH TUAN",
                },
              ]}
            />
          </Col>
          <Col span={24}>
            <Input placeholder="Transaction code" />
          </Col>
          <Col span={24}>
            <Button
              type="primary"
              size={"large"}
              style={{ width: "100%" }}
              // onClick={submitOrder}
            >
              {t("actions.payConfirm")}
            </Button>
          </Col>
        </Space>
      </Col>
    </Row>
  );
  const renderCardMethod = () => (
    <Row gutter={[16, 24]} align="middle">
      <Col span={24}>
        <Select
          showSearch
          placeholder="Select a person"
          optionFilterProp="children"
          style={{ width: "100%" }}
          defaultValue="0691000441548"
          disabled
          options={[
            {
              value: "0691000441548",
              label: "VCB - 0691000441548 - NGUYEN ANH TUAN",
            },
          ]}
        />
      </Col>
      <Col span={12}>
        <Input placeholder="Transaction code" />
      </Col>
      <Col span={12}>
        <Button
          type="primary"
          style={{ width: "100%" }}
          // onClick={submitOrder}
        >
          {t("actions.payConfirm")}
        </Button>
      </Col>
    </Row>
  );
  const renderMultipleMethods = (payments: IPayment[]) => {
    if (!payments || payments.length === 0) {
      return null;
    }

    const paymentMethodNames = payments.map(
      (payment) => payment.paymentMethod.name
    );
    const methodsString = paymentMethodNames.join(", ");

    return (
      <Flex gap="middle" justify="space-between" align="center">
        <Space size="large" wrap>
          <Text>Payment methods: </Text>
        </Space>
        <Text strong style={{ color: token.colorPrimary }}>
          {methodsString}
        </Text>
      </Flex>
    );
  };

  const renderMethodGroup = (payments: IPayment[]) => {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Radio.Group
          name="radiogroup"
          defaultValue={
            paymentMethods && paymentMethods.length > 0
              ? paymentMethods[0]
              : null
          }
          onChange={handleRadioChange}
        >
          {paymentMethods && paymentMethods.length > 0 ? (
            paymentMethods.map((method) => (
              <Radio key={method.id} value={method}>
                {method.name}
              </Radio>
            ))
          ) : (
            <p>No payment methods available</p>
          )}
        </Radio.Group>

        <Col span={24}>
          {renderSingleMethod(payments[0].paymentMethod.name)}
        </Col>
      </Space>
    );
  };

  function editOrderEmployee(value: string | null): void {
    mutateUpdate(
      {
        resource: "orders",
        values: {
          ...order,
          employee: value,
          customer: order.customer ? order.customer.id : "",
          voucher: order.voucher ? order.voucher.id : "",
          address: order.address ? order.address.id : "",
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
            content: "Failed to edit order employee.",
          });
        },
        onSuccess: (data, variables, context) => {
          callBack();
          messageApi.open({
            type: "success",
            content: "Edited order note employee.",
          });
        },
      }
    );
  }

  return (
    <Drawer
      width={breakpoint.sm ? "700px" : "100%"}
      zIndex={1001}
      onClose={onClose}
      open={open}
      style={{ borderTopLeftRadius: "1rem", borderBottomLeftRadius: "1rem" }}
      closable={false}
      footer={
        <Button
          type="primary"
          size={"large"}
          style={{ width: "100%", fontWeight: "500" }}
          onClick={submitOrder}
        >
          {t("actions.pay")}
        </Button>
      }
    >
      {contextHolder}
      <Row>
        <Col span={24}>
          <Row>
            <Col span={14}>
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
                  onSearch={debounce((value: string) => setValue(value), 300)}
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
                      {order.employee?.fullName} - {order.employee.phoneNumber}
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
            <Col span={10} style={{ textAlign: "end" }}>
              <Space wrap>
                <Text>{formatTimestamp(order.createdAt).dateFormat}</Text>
                <Text>{formatTimestamp(order.createdAt).timeFormat}</Text>
                <Button
                  type="text"
                  onClick={onClose}
                  icon={<CloseOutlined />}
                />
              </Space>
            </Col>
          </Row>
          <Divider dashed />
        </Col>
        <Col span={24}>
          {order.customer ? (
            <Title level={3} style={{ color: token.colorPrimary }}>
              {order.customer.fullName}
            </Title>
          ) : (
            <Title level={3}>{t("orders.tab.retailCustomer")}</Title>
          )}
        </Col>
        <Col span={24}>
          <Flex gap="middle" justify="space-between" align="center">
            <Space size="large" wrap>
              <Text>{t("orders.fields.totalPrice")}</Text>
              <Text>{totalQuantity}</Text>
            </Space>
            <Title level={4}>{moneyFormatter.format(totalPrice)}</Title>
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
                  <PlusSquareFilled style={{ color: token.colorPrimary }} />
                }
                onClick={() => {}}
              />
            </Space>
            <Title level={4}>{moneyFormatter.format(0)}</Title>
          </Flex>
        </Col>
        <Divider />
        <Col span={24}>
          <Flex gap="middle" justify="space-between" align="center">
            <Space size="large" wrap>
              <Text strong>{t("orders.tab.amountDue")}</Text>
            </Space>
            <Title level={4} style={{ color: `${token.colorPrimary}` }}>
              {moneyFormatter.format(totalPrice)}
            </Title>
          </Flex>
        </Col>
        <Col span={24}>
          <Flex gap="middle" justify="space-between" align="center">
            <Space size="large" wrap>
              <Text strong>{t("orders.tab.customerPay")}</Text>
              <Button
                size="small"
                type="text"
                icon={
                  <CreditCardFilled style={{ color: token.colorPrimary }} />
                }
                onClick={showModal}
              />
            </Space>
            <Title level={4}>
              {payments
                ? moneyFormatter.format(
                    payments.reduce(
                      (acc, payment) => acc + payment.totalMoney,
                      0
                    )
                  )
                : "Loading..."}
            </Title>
          </Flex>
        </Col>
        <Divider />
        <Col span={24}>
          {payments?.length === 1 && renderMethodGroup(payments)}
          {payments?.length &&
            payments.length > 1 &&
            renderMultipleMethods(payments)}
        </Col>
        <Col span={24}>
          <Flex gap="middle" justify="space-between" align="center">
            <Space size="large" wrap>
              <Text strong>{t("orders.tab.change")}</Text>
            </Space>
            <Title level={4}>{moneyFormatter.format(change)}</Title>
          </Flex>
        </Col>
      </Row>
      <PaymentModal
        open={isModalVisible}
        handleOk={handleModalOk}
        handleCancel={handleModalCancel}
        paymentMethods={paymentMethods}
        payments={payments}
        initialPrice={initialPrice}
        totalPrice={totalPrice}
        setPayments={setPayments}
        setCustomerPaid={setCustomerPaid}
        order={order}
      />
    </Drawer>
  );
};

const renderItem = (
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
