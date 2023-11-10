import {
  Button,
  Col,
  Flex,
  Grid,
  InputNumber,
  InputRef,
  Modal,
  Row,
  Select,
  Space,
  Typography,
  message,
  theme,
} from "antd";
import { IOrder, IPayment, IPaymentMethod } from "../../../../interfaces";
import { useTranslate } from "@refinedev/core";
import { useEffect, useRef, useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { debounce } from "lodash";
import { NumberField } from "@refinedev/antd";

type PaymentModalProps = {
  open: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  paymentMethods: IPaymentMethod[] | undefined;
  payments: IPayment[] | undefined;
  initialPrice: number;
  totalPrice: number;
  setPayments: React.Dispatch<React.SetStateAction<IPayment[] | undefined>>;
  setCustomerPaid: React.Dispatch<React.SetStateAction<number>>;
  order: IOrder;
};

const { Text, Title } = Typography;
const { useToken } = theme;

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  handleOk,
  handleCancel,
  paymentMethods,
  initialPrice,
  totalPrice,
  payments,
  setPayments,
  setCustomerPaid,
  order,
}) => {
  const t = useTranslate();
  const { token } = useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const breakpoint = Grid.useBreakpoint();

  const [thisPayments, setThisPayments] = useState<IPayment[] | undefined>();

  useEffect(() => {
    setThisPayments(payments);
  }, [payments]);

  useEffect(() => {
    if (thisPayments) {
      const calculatedTotalMoney = thisPayments.reduce(
        (accumulator, payment) => {
          return accumulator + payment.totalMoney;
        },
        0
      );
      const newMoneyValue =
        totalPrice - calculatedTotalMoney >= 0
          ? totalPrice - calculatedTotalMoney
          : 0;

      setThisCustomerPaid(calculatedTotalMoney);
      setMoney(newMoneyValue);
    }
  }, [thisPayments]);

  const inputRef = useRef<any>(null);
  const [money, setMoney] = useState(0);
  const [customerPaid, setThisCustomerPaid] = useState<number>(initialPrice);
  const [change, setChange] = useState(initialPrice - totalPrice);

  const suggestedMoney = [0, 100000, 200000, 300000];

  const buttons = suggestedMoney.map((money, index) => {
    const totalMoney = totalPrice + money;
    return (
      <Col span={24 / suggestedMoney.length}>
        <Button
          size="large"
          shape="round"
          key={index}
          onClick={() => setMoney(totalMoney)}
          style={{ width: "100%" }}
        >
          {totalMoney.toLocaleString()}
        </Button>
      </Col>
    );
  });

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

  const handleFinish = () => {
    setPayments(thisPayments);
    handleOk();
  };

  const onCancel = () => {
    setThisCustomerPaid(initialPrice);
    setMoney(0);
    setThisPayments(payments);
    handleCancel();
  };

  const handleMoneyChange = debounce((value: number) => {
    setMoney(value);
  }, 500);

  const handleDeletePayment = (paymentMethodId: string) => {
    if (thisPayments) {
      const updatedPayments = thisPayments.filter((payment) => {
        return payment.paymentMethod.id !== paymentMethodId;
      });
      setThisPayments(updatedPayments);
    }
  };

  const handleAddPayment = (method: IPaymentMethod) => {
    if (money === 0) {
      inputRef.current!.focus({
        cursor: "all",
      });
    } else {
      if (!thisPayments) return;
      const existingPaymentIndex = thisPayments.findIndex(
        (payment) => payment.paymentMethod.id === method.id
      );

      if (existingPaymentIndex !== -1) {
        const updatedPayments = [...thisPayments];
        updatedPayments[existingPaymentIndex].totalMoney += money;
        setThisPayments(updatedPayments);
      } else {
        setThisPayments((prev: any) => [
          ...prev,
          {
            order: order,
            paymentMethod: method,
            totalMoney: money,
            transactionCode: "",
          },
        ]);
      }

      const newMoneyValue = totalPrice - money >= 0 ? totalPrice - money : 0;
      setMoney(newMoneyValue);
    }
  };

  return (
    <Modal
      title={t("payments.titles.multiple")}
      width={breakpoint.sm ? "700px" : "100%"}
      zIndex={1001}
      onOk={handleFinish}
      onCancel={onCancel}
      open={open}
    >
      {contextHolder}
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <Flex gap="middle" justify="space-between" align="center">
            <Space size="large" wrap>
              <Text strong>{t("payments.fields.money")}</Text>
            </Space>
            <InputNumber
              ref={inputRef}
              formatter={(value) =>
                `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value: string | undefined) => {
                const parsedValue = parseInt(
                  value!.replace(/₫\s?|(,*)/g, ""),
                  10
                );
                return isNaN(parsedValue) || parsedValue < 0 ? 0 : parsedValue;
              }}
              value={money}
              onChange={(value) => handleMoneyChange(value as number)}
              style={{
                width: "30%",
                borderBottom: `1px solid ${token.colorPrimary}`,
                borderRadius: "0",
              }}
              bordered={false}
            />
          </Flex>
        </Col>
        <Col span={24}>{renderCashMethod()}</Col>
        <Col span={24}>
          <Row gutter={10}>
            {paymentMethods && paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <Col span={24 / paymentMethods.length} key={method.id}>
                  <Button
                    size="large"
                    shape="round"
                    style={{ width: "100%", marginBottom: "10px" }}
                    onClick={() => handleAddPayment(method)}
                  >
                    {method.name}
                  </Button>
                </Col>
              ))
            ) : (
              <Text>No payment methods available</Text>
            )}
          </Row>
        </Col>
        <Col span={24}>
          <Flex gap="middle" justify="space-between" align="center">
            <Space size="large" wrap>
              <Text strong>{t("payments.fields.amountDue")}</Text>
            </Space>
            <Title level={4} style={{ color: `${token.colorPrimary}` }}>
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
          {thisPayments && thisPayments.length > 0 ? (
            thisPayments.map((payment) => (
              <Flex
                key={payment.id}
                gap="middle"
                justify="space-between"
                align="center"
                style={{
                  borderTop: `1px dashed ${token.colorPrimary}`,
                  borderBottom: `1px dashed ${token.colorPrimary}`,
                  paddingBottom: "0.5rem",
                  paddingTop: "0.5rem",
                }}
              >
                <Space size="large" wrap>
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      handleDeletePayment(payment.paymentMethod.id)
                    }
                  />
                  <Text strong>{payment.paymentMethod.name}</Text>
                  {payment.paymentMethod.name != "Cash" ? (
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
                  ) : null}
                </Space>
                <Text>
                  <NumberField
                    options={{
                      currency: "VND",
                      style: "currency",
                    }}
                    value={payment.totalMoney}
                  />
                </Text>
              </Flex>
            ))
          ) : (
            <Text>No payment available</Text>
          )}
        </Col>
        <Col span={24}>
          <Flex gap="middle" justify="space-between" align="center">
            <Space size="large" wrap>
              <Text strong>{t("payments.fields.customerPay")}</Text>
            </Space>
            <Title level={4}>
              <NumberField
                options={{
                  currency: "VND",
                  style: "currency",
                }}
                value={customerPaid}
              />
            </Title>
          </Flex>
        </Col>
      </Row>
    </Modal>
  );
};
