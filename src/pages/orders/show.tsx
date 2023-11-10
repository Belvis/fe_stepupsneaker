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
import { List, NumberField } from "@refinedev/antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  MobileOutlined,
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
} from "antd";
import dayjs from "dayjs";

// import { Map, MapMarker } from "../../components";
import { BikeWhiteIcon } from "../../components";
// import { useOrderCustomKbarActions } from "../../hooks";
import {
  IEvent,
  IOrder,
  IOrderDetail,
  IOrderHistory,
  IProduct,
} from "../../interfaces";

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

  const { id } = useParsed();

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
                  status: canceledReturnedOrExchangedOrder.actionStatus, // Thay thế trạng thái COMPLETED
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

    const handleMutate = (status: { id: number; text: string }) => {
      if (record) {
        mutate({
          resource: "orders",
          id: record.id.toString(),
          values: {
            status,
          },
        });
      }
    };

    // useOrderCustomKbarActions(record);

    return (
      <PageHeader
        ghost={false}
        onBack={() => window.history.back()}
        title={t("orders.fields.code")}
        subTitle={`#${record?.code ?? ""}`}
        extra={[
          <Button
            disabled={!canAcceptOrder}
            key="accept"
            icon={<CheckCircleOutlined />}
            type="primary"
            onClick={() =>
              handleMutate({
                id: 2,
                text: "Ready",
              })
            }
          >
            {t("buttons.accept")}
          </Button>,
          <Button
            disabled={!canRejectOrder}
            key="reject"
            danger
            icon={<CloseCircleOutlined />}
            onClick={() =>
              handleMutate({
                id: 5,
                text: "Cancelled",
              })
            }
          >
            {t("buttons.reject")}
          </Button>,
        ]}
      >
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
              icon={notFinishedCurrentStep(event, index) && <LoadingOutlined />}
              description={
                event.date && dayjs(new Date(event.date)).format("L LT")
              }
            />
          ))}
        </Steps>
        {!record && <Skeleton paragraph={{ rows: 1 }} />}
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
    <Card>
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
                ID #
                {record && record.employee && record.employee.id
                  ? record.employee.id
                  : "N/A"}
              </Text>
            </EmployeeInfoText>
          </Employee>
        </Col>

        <EmployeeBoxContainer xl={12} lg={14} md={24}>
          {employeeInfoBox(
            t("employees.fields.email"),
            <MobileOutlined style={{ color: "#ffff", fontSize: 32 }} />,
            record && record.employee && record.employee.email
              ? record.employee.email
              : "N/A"
          )}
          {employeeInfoBox(
            t("employees.fields.dateOfBirth"),
            <BikeWhiteIcon style={{ color: "#ffff", fontSize: 32 }} />,
            "15:05"
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
              <Text>#{record.id}</Text>
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
    >
      <Table
        pagination={false}
        dataSource={record?.orderDetails}
        columns={columns}
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

  return (
    <>
      <Space size={20} direction="vertical" style={{ width: "100%" }}>
        {renderOrderSteps()}
        {/* <div style={{ height: "500px", width: "100%" }}>
          <Map
            center={{
              lat: 40.73061,
              lng: -73.935242,
            }}
            zoom={9}
          >
            <MapMarker
              key={`user-marker-${record?.user.id}`}
              icon={{
                url: "/images/marker-location.svg",
              }}
              position={{
                lat: Number(record?.adress.coordinate[0]),
                lng: Number(record?.adress.coordinate[1]),
              }}
            />
            <MapMarker
              key={`user-marker-${record?.user.id}`}
              icon={{
                url: "/images/marker-employee.svg",
              }}
              position={{
                lat: Number(record?.store.address.coordinate[0]),
                lng: Number(record?.store.address.coordinate[1]),
              }}
            />
          </Map>
        </div> */}
        {renderEmployeeInfo()}
      </Space>
      {renderDeliverables()}
    </>
  );
};
