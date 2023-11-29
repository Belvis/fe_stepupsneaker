import { ReactChild, ReactNode, useEffect, useState } from "react";
import {
  useShow,
  IResourceComponentsProps,
  useTranslate,
  useUpdate,
  useList,
  HttpError,
  useParsed,
} from "@refinedev/core";
import { DateField, List, NumberField } from "@refinedev/antd";
import {
  CarOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  DropboxOutlined,
  FileProtectOutlined,
  LoadingOutlined,
  MailOutlined,
  MobileOutlined,
  QuestionOutlined,
} from "@ant-design/icons";
import {
  Row,
  Col,
  Button,
  Steps,
  Grid,
  Space,
  Avatar,
  Typography,
  Card,
  Table,
  Skeleton,
  DescriptionsProps,
  Descriptions,
  Badge,
  Empty,
} from "antd";
import dayjs from "dayjs";

// import { Map, MapMarker } from "../../components";
import { OrderHistoryTimeLine } from "../../../components";
// import { useOrderCustomKbarActions } from "../../hooks";
import {
  IEvent,
  IOrder,
  IOrderDetail,
  IOrderHistory,
  IProduct,
  OrderStatus,
} from "../../../interfaces";

import {
  Employee,
  EmployeeBoxContainer,
  EmployeeInfoBox,
  EmployeeInfoBoxText,
  EmployeeInfoText,
  PageHeader,
  Product,
  ProductFooter,
  ProductText,
} from "./styled";
import { ColumnsType } from "antd/es/table";

const { useBreakpoint } = Grid;
const { Text } = Typography;

const InitialEventData: IEvent[] = [
  {
    date: undefined,
    status: "PLACE_ORDER",
  },
  {
    date: undefined,
    status: "WAIT_FOR_CONFIRMATION",
  },
  {
    date: undefined,
    status: "WAIT_FOR_DELIVERY",
  },
  {
    date: undefined,
    status: "DELIVERING",
  },
  {
    date: undefined,
    status: "COMPLETED",
  },
];

export const OrderShow: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const screens = useBreakpoint();
  const { queryResult } = useShow<IOrder>();
  const { data } = queryResult;
  const { mutate } = useUpdate();
  const record = data?.data;
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (record && record.voucher && record.voucher.type) {
      if (record.voucher.type === "PERCENTAGE") {
        setDiscount((record.voucher.value / 100) * record.totalMoney);
      } else {
        setDiscount(record.voucher.value);
      }
      setTotal(record.totalMoney + record.shippingMoney - discount);
    }
  }, [record]);

  const { id } = useParsed();

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
    refetchOrderHistory();
  }, []);

  const [events, setEvents] = useState<IEvent[]>(InitialEventData);

  const { refetch: refetchOrderHistory } = useList<IOrderHistory, HttpError>({
    resource: "order-histories",
    pagination: {
      pageSize: 10,
    },
    filters: [
      {
        field: "order",
        operator: "eq",
        value: id,
      },
    ],
    queryOptions: {
      enabled: false,
      onSuccess: (data) => {
        const updatedEvents = InitialEventData.map((event) => {
          switch (event.status) {
            case "PLACE_ORDER":
              return {
                ...event,
                date: data.data[0].createdAt,
              };
            case "COMPLETED":
              const canceledReturnedOrExchangedOrder = data.data.find(
                (orderHistory) =>
                  ["CANCELED", "RETURNED", "EXCHANGED"].includes(
                    orderHistory.actionStatus
                  )
              );
              if (canceledReturnedOrExchangedOrder) {
                return {
                  ...event,
                  status: canceledReturnedOrExchangedOrder.actionStatus,
                  date: canceledReturnedOrExchangedOrder.createdAt,
                };
              }
              {
                const matchedOrderHistory = data.data.find(
                  (orderHistory) => orderHistory.actionStatus === event.status
                );
                if (matchedOrderHistory) {
                  return {
                    ...event,
                    date: matchedOrderHistory.createdAt,
                  };
                }
              }
              break;
            default:
              const matchedOrderHistory = data.data.find(
                (orderHistory) => orderHistory.actionStatus === event.status
              );
              if (matchedOrderHistory) {
                return {
                  ...event,
                  date: matchedOrderHistory.createdAt,
                };
              }
              break;
          }
          return event;
        });

        setEvents(updatedEvents);
      },
    },
  });

  const canAcceptOrder = record?.status === "WAIT_FOR_CONFIRMATION";
  const canRejectOrder =
    record?.status === "PENDING" ||
    record?.status === "WAIT_FOR_CONFIRMATION" ||
    record?.status === "WAIT_FOR_DELIVERY" ||
    record?.status === "DELIVERING";

  const currentBreakPoints = Object.entries(screens)
    .filter((screen) => !!screen[1])
    .map((screen) => screen[0]);

  const renderOrderSteps = () => {
    const notFinishedCurrentStep = (event: IEvent, index: number) =>
      event.status !== "CANCELED" &&
      event.status !== "COMPLETED" &&
      events.findIndex((el) => el.status === record?.status) === index;

    const stepStatus = (event: IEvent, index: number) => {
      if (!event.date) return "wait";
      if (event.status === "CANCELED") return "error";
      if (notFinishedCurrentStep(event, index)) return "process";
      return "finish";
    };

    const handleMutate = (status: OrderStatus | null) => {
      if (record && status) {
        mutate(
          {
            resource: "orders",
            id: record.id,
            values: {
              status: status,
            },
          },
          {
            onError: (error, variables, context) => {},
            onSuccess: (data, variables, context) => {
              refetchOrderHistory();
            },
          }
        );
      }
    };

    // useOrderCustomKbarActions(record);

    return (
      <PageHeader
        ghost={false}
        onBack={() => window.history.back()}
        title={t("orders.fields.code")}
        subTitle={`#${record?.code.toUpperCase() ?? ""}`}
        extra={[
          <Button
            disabled={!canRejectOrder}
            key="accept"
            icon={<CheckCircleOutlined />}
            type="primary"
            onClick={() =>
              handleMutate(getNextStatus(record?.status ?? "PENDING"))
            }
          >
            {t("buttons.forceConfirm")}
          </Button>,
          <Button
            disabled={!canAcceptOrder}
            key="accept"
            icon={<CheckCircleOutlined />}
            type="primary"
            onClick={() => handleMutate("WAIT_FOR_DELIVERY")}
          >
            {t("buttons.accept")}
          </Button>,
          <Button
            disabled={!canRejectOrder}
            key="reject"
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => handleMutate("CANCELED")}
          >
            {t("buttons.reject")}
          </Button>,
        ]}
      >
        <Card>
          {record && (
            <Steps
              direction={
                currentBreakPoints.includes("lg") ? "horizontal" : "vertical"
              }
              current={events.findIndex((el) => el.status === record?.status)}
            >
              {events.map((event: IEvent, index: number) => (
                <Steps.Step
                  status={stepStatus(event, index)}
                  key={index}
                  title={t(`enum.orderStatuses.${event.status}`)}
                  icon={
                    notFinishedCurrentStep(event, index) ? (
                      <LoadingOutlined />
                    ) : (
                      getIconByStatus(event.status)
                    )
                  }
                  description={
                    event.date && dayjs(new Date(event.date)).format("L LT")
                  }
                />
              ))}
            </Steps>
          )}
          {!record && <Skeleton paragraph={{ rows: 1 }} />}
        </Card>
      </PageHeader>
    );
  };

  const employeeInfoBox = (text: string, icon: ReactNode, value?: string) => (
    <EmployeeInfoBox>
      {icon}
      <EmployeeInfoBoxText>
        <Text style={{ color: "#ffffff" }}>{text.toUpperCase()}</Text>
        <Text style={{ color: "#ffffff" }}>{value}</Text>
      </EmployeeInfoBoxText>
    </EmployeeInfoBox>
  );

  const renderEmployeeInfo = () => (
    <Card loading={!record}>
      <Row justify="center">
        <Col xl={12} lg={10}>
          <Employee>
            <Avatar
              size={108}
              src={
                record && record.employee && record.employee.image
                  ? record.employee.image
                  : "URL_OF_DEFAULT_IMAGE"
              }
            />

            <EmployeeInfoText>
              <Text style={{ fontSize: 16 }}>
                {t("orders.fields.employee").toUpperCase()}
              </Text>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                }}
              >
                {record && record.employee && record.employee.fullName
                  ? record.employee.fullName
                  : "N/A"}
              </Text>
              <Text>
                Role:{" "}
                {record && record.employee && record.employee.role
                  ? record.employee.role.name
                  : "N/A"}
              </Text>
            </EmployeeInfoText>
          </Employee>
        </Col>

        <EmployeeBoxContainer xl={12} lg={14} md={24}>
          {employeeInfoBox(
            t("employees.fields.phoneNumber"),
            <MobileOutlined style={{ color: "#ffff", fontSize: 32 }} />,
            record && record.employee && record.employee.phoneNumber
              ? record.employee.phoneNumber
              : "N/A"
          )}
          {employeeInfoBox(
            t("employees.fields.email"),
            <MailOutlined style={{ color: "#ffff", fontSize: 32 }} />,
            record && record.employee && record.employee.email
              ? record.employee.email
              : "N/A"
          )}
        </EmployeeBoxContainer>
      </Row>
    </Card>
  );

  const columns: ColumnsType<IOrderDetail> = [
    {
      title: "#",
      key: "index",
      width: "0.5rem",
      align: "center",
      render: (text, record, index) => index + 1,
    },
    {
      title: t("orders.deliverables.fields.items"),
      key: "name",
      dataIndex: "name",
      defaultSortOrder: "descend",
      sorter: (a: IOrderDetail, b: IOrderDetail) =>
        a.productDetail.product.name > b.productDetail.product.name ? 1 : -1,
      render: (_, record) => {
        return (
          <Product>
            <Avatar
              size={{
                md: 60,
                lg: 108,
                xl: 108,
                xxl: 108,
              }}
              src={record.productDetail.image || "URL_OF_DEFAULT_IMAGE"}
            />
            <ProductText>
              <Text style={{ fontSize: 22, fontWeight: 800 }}>
                {record.productDetail.product.name}
              </Text>
              <Text>#{record.productDetail.product.code}</Text>
            </ProductText>
          </Product>
        );
      },
    },
    {
      title: t("orders.deliverables.fields.quantity"),
      key: "quantity",
      dataIndex: "quantity",
      render: (_, { quantity }) => {
        return <Text style={{ fontWeight: 800 }}>x{quantity}</Text>;
      },
    },
    {
      title: t("orders.deliverables.fields.price"),
      key: "price",
      dataIndex: "price",
      defaultSortOrder: "descend",
      sorter: (a: IOrderDetail, b: IOrderDetail) => a.price - b.price,
      render: (_, { price }) => (
        <NumberField
          options={{
            currency: "VND",
            style: "currency",
          }}
          style={{ fontWeight: 800 }}
          value={price}
        />
      ),
    },
    {
      title: t("orders.deliverables.fields.total"),
      key: "amount",
      dataIndex: "amount",
      width: "10%",
      align: "end",
      defaultSortOrder: "descend",
      sorter: (a: IOrderDetail, b: IOrderDetail) =>
        a.price * a.quantity - b.price * b.quantity,
      render: (_, { price, quantity }) => (
        <NumberField
          options={{
            currency: "VND",
            style: "currency",
          }}
          value={price * quantity}
        />
      ),
    },
  ];

  const renderDeliverables = () => (
    <List
      headerProps={{ style: { marginTop: 20 } }}
      title={
        <Text style={{ fontSize: 22, fontWeight: 800 }}>
          {t("orders.deliverables.deliverables")}
        </Text>
      }
      headerButtons={() => (
        <>
          <Button type="primary" onClick={showModal}>
            Xem lịch sử
          </Button>
        </>
      )}
    >
      <Table
        pagination={false}
        dataSource={record?.orderDetails}
        loading={!record}
        columns={columns}
        rowKey="id"
        footer={(_data) => (
          <ProductFooter>
            <Text>{t("orders.deliverables.mainTotal")}</Text>
            <NumberField
              options={{
                currency: "VND",
                style: "currency",
              }}
              style={{ fontWeight: 800 }}
              value={record?.totalMoney as ReactChild}
            />
          </ProductFooter>
        )}
      />
    </List>
  );

  const items: DescriptionsProps["items"] = [
    {
      key: "1",
      label: t("orders.deliverables.fields.items"),
      span: 2,
      children: (
        <ul>
          {record?.orderDetails.map((orderDetail) => (
            <li key={orderDetail.id}>
              {orderDetail.productDetail.product.name} -{" "}
              {orderDetail.productDetail.color.name} -{" "}
              {orderDetail.productDetail.size.name} - x{orderDetail.quantity}
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "2",
      label: t("orders.fields.status"),
      span: 1,
      children: (
        <Badge
          status="processing"
          text={t(`enum.orderStatuses.${record?.status}`)}
        />
      ),
    },
    {
      key: "3",
      label: t("orders.fields.type.title"),
      span: 1,
      children: "Offline",
    },
    {
      key: "4",
      label: t("orders.fields.createdAt"),
      children: (
        <DateField
          value={dayjs(new Date(record?.createdAt || 0))}
          format="LLL"
        />
      ),
    },
    {
      key: "5",
      label: t("orders.fields.code"),
      span: 1,
      children: record?.code,
    },
    {
      key: "6",
      label: t("orders.fields.note"),
      span: 2,
      children: record?.note,
    },
    {
      key: "7",
      label: t("orders.deliverables.fields.total"),
      children: (
        <NumberField
          options={{
            currency: "VND",
            style: "currency",
          }}
          value={total}
        />
      ),
    },
    {
      key: "8",
      label: t("orders.tab.discount"),
      children: (
        <NumberField
          options={{
            currency: "VND",
            style: "currency",
          }}
          value={discount}
        />
      ),
    },
    {
      key: "9",
      label: t("orders.tab.shippingMoney"),
      children: (
        <NumberField
          options={{
            currency: "VND",
            style: "currency",
          }}
          value={record?.shippingMoney as ReactChild}
        />
      ),
    },
    {
      key: "10",
      label: t("orders.deliverables.receipt"),
      children: (
        <NumberField
          options={{
            currency: "VND",
            style: "currency",
          }}
          value={record?.totalMoney as ReactChild}
        />
      ),
    },
    {
      key: "11",
      label: t("orders.deliverables.fields.payment"),
      span: 3,
      children: (
        <>
          {record?.payments &&
            record.payments.map((payment) => (
              <div key={payment.id}>
                <NumberField
                  options={{
                    currency: "VND",
                    style: "currency",
                  }}
                  value={payment.totalMoney}
                />
                {` - `}
                <DateField
                  value={dayjs(new Date(payment.createdAt))}
                  format="LLL"
                />
                {` - `}
                {t("payments.fields.transactionCode")}
                {`: ${payment.transactionCode}`}
                <br />
              </div>
            ))}
        </>
      ),
    },
    {
      key: "12",
      label: t("orders.deliverables.fields.paymentMethod"),
      children: (
        <>
          {record?.payments &&
            record.payments
              .map((payment, index) =>
                t(`paymentMethods.options.${payment.paymentMethod.name}`)
              )
              .join(", ")}
        </>
      ),
    },

    {
      key: "13",
      label: t("orders.fields.customer"),
      span: 2,
      children: (
        <>
          {record?.customer ? (
            <>
              <div>
                <strong>{t("customers.fields.fullName")}</strong>:{" "}
                {record.customer.fullName}
              </div>
              <div>
                <strong>{t("customers.fields.email")}</strong>:{" "}
                {record.customer.email}
              </div>
              <div>
                <strong>{t("customers.fields.dateOfBirth")}</strong>:{" "}
                <DateField
                  value={dayjs(new Date(record.customer.dateOfBirth))}
                  format="LL"
                />
              </div>
              <div>
                <strong>{t("customers.fields.gender.label")}</strong>:{" "}
                {t(`customers.fields.gender.options.${record.customer.gender}`)}
              </div>
              <div>
                {record.customer.addressList.length > 0 ? (
                  <>
                    <strong>{t("customers.fields.address")}</strong>:{" "}
                    {record.customer.addressList.map((address) => (
                      <span key={address.id}>
                        {address.isDefault && (
                          <>
                            {address.more}, {address.wardName},{" "}
                            {address.districtName}, {address.provinceName}
                          </>
                        )}
                      </span>
                    ))}
                  </>
                ) : (
                  "N/A"
                )}
              </div>
            </>
          ) : (
            <div>
              <Empty />
            </div>
          )}
        </>
      ),
    },
    {
      key: "14",
      label: t("orders.fields.employee"),
      span: 2,
      children: (
        <>
          {record?.employee ? (
            <>
              <div>
                <strong>{t("employees.fields.fullName")}</strong>:{" "}
                {record.employee.fullName}
              </div>
              <div>
                <strong>{t("employees.fields.email")}</strong>:{" "}
                {record.employee.email}
              </div>
              <div>
                <strong>{t("employees.fields.phoneNumber")}</strong>:{" "}
                {record.employee.phoneNumber}
              </div>
              <div>
                <strong>{t("employees.fields.gender.label")}</strong>:{" "}
                {t(`employees.fields.gender.options.${record.employee.gender}`)}
              </div>
              <div>
                <strong>{t("employees.fields.address")}</strong>:{" "}
                {record.employee.address}
              </div>
            </>
          ) : (
            <div>
              <Empty />
            </div>
          )}
        </>
      ),
    },
  ];

  const renderOrderInfor = () => (
    <Skeleton loading={!record} active paragraph>
      <Descriptions
        title="Thông tin đơn hàng"
        bordered
        column={4}
        layout="vertical"
        items={items}
      />
    </Skeleton>
  );

  return (
    <>
      <Space size={20} direction="vertical" style={{ width: "100%" }}>
        {renderOrderSteps()}
        {renderEmployeeInfo()}
        {renderDeliverables()}
        {renderOrderInfor()}
      </Space>
      <OrderHistoryTimeLine
        id={id as string}
        open={isModalVisible}
        handleOk={handleModalOk}
        handleCancel={handleModalCancel}
      />
    </>
  );
};

const getIconByStatus = (status: OrderStatus) => {
  switch (status) {
    case "PLACE_ORDER":
      return <DropboxOutlined />;
    case "WAIT_FOR_CONFIRMATION":
      return <QuestionOutlined />;
    case "WAIT_FOR_DELIVERY":
      return <CheckOutlined />;
    case "DELIVERING":
      return <CarOutlined />;
    case "COMPLETED":
      return <FileProtectOutlined />;
    default:
      return null;
  }
};

export const getNextStatus = (
  currentStatus: OrderStatus
): OrderStatus | null => {
  switch (currentStatus) {
    case "WAIT_FOR_CONFIRMATION":
      return "WAIT_FOR_DELIVERY";
    case "WAIT_FOR_DELIVERY":
      return "DELIVERING";
    case "DELIVERING":
      return "COMPLETED";
    case "COMPLETED":
      return null;
    case "CANCELED":
      return null;
    case "EXPIRED":
      return null;
    case "RETURNED":
      return null;
    case "EXCHANGED":
      return null;
    default:
      return null;
  }
};
