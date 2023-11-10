import {
  useShow,
  HttpError,
  IResourceComponentsProps,
  useTranslate,
} from "@refinedev/core";
import {
  useTable,
  List,
  TextField,
  getDefaultSortOrder,
  NumberField,
  DateField,
  useForm,
} from "@refinedev/antd";

import {
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  Typography,
  Avatar,
  Row,
  Col,
  Card,
  Space,
  Table,
  Grid,
  Popover,
} from "antd";

import { EditAddressForm, OrderActions, OrderStatus } from "../../components";
import {
  IAddress,
  ICustomer,
  IOrder,
  IOrderFilterVariables,
} from "../../interfaces";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { formatTimestamp } from "../../utils";

const { useBreakpoint } = Grid;
const { Text } = Typography;

export const CustomerShow: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { xl } = useBreakpoint();
  const {
    queryResult: { refetch: refetchCustomer, data, isLoading },
  } = useShow<ICustomer>();

  const customer = data?.data;

  const {
    tableProps,
    current,
    pageSize,
    tableQueryResult: { refetch: refetchOrder },
  } = useTable<IOrder, HttpError, IOrderFilterVariables>({
    resource: "orders",
    initialSorter: [
      {
        field: "createdAt",
        order: "desc",
      },
    ],
    permanentFilter: [
      {
        field: "customer",
        operator: "eq",
        value: customer?.id,
      },
    ],
    initialPageSize: 5,
    queryOptions: {
      enabled: customer !== undefined,
    },
    syncWithLocation: false,
  });

  const columnsOrder: ColumnsType<IOrder> = [
    {
      title: "#",
      key: "index",
      width: "1rem",
      align: "center",
      render: (text, record, index) => (current - 1) * pageSize + index + 1,
    },
    {
      title: t("orders.fields.code"),
      key: "code",
      dataIndex: "code",
      align: "center",
      render: (_, { code }) => {
        return <Text>{code ? code : "N/A"}</Text>;
      },
    },
    {
      title: t("orders.fields.status"),
      key: "status",
      dataIndex: "status",
      width: "10%",
      align: "center",
      render: (_, { status }) => <OrderStatus status={status} />,
    },
    {
      title: t("orders.fields.type.title"),
      key: "type",
      dataIndex: "type",
      width: "10%",
      align: "center",
      render: (_, { type }) => {
        return <Text>{t(`orders.fields.type.${type}`)}</Text>;
      },
    },
    {
      title: t("orders.fields.totalPrice"),
      key: "amount",
      dataIndex: "amount",
      align: "end",
      render: (_, { totalMoney }) => (
        <NumberField
          options={{
            currency: "VND",
            style: "currency",
          }}
          value={totalMoney}
        />
      ),
    },
    {
      title: t("orders.fields.orderDetails"),
      key: "orderDetails",
      dataIndex: "orderDetails",
      render: (_, record) => {
        const orderDetails = record?.orderDetails || [];
        const totalQuantity = orderDetails.reduce((total, orderDetail) => {
          return total + orderDetail.quantity;
        }, 0);

        return (
          <Popover
            content={
              <ul>
                {record.orderDetails.map((orderDetail) => (
                  <li key={orderDetail.id}>
                    {orderDetail.productDetail.product.name} -{" "}
                    {orderDetail.productDetail.color.name} -{" "}
                    {orderDetail.productDetail.size.name} - x
                    {orderDetail.quantity}
                  </li>
                ))}
              </ul>
            }
            title={t("products.products")}
            trigger="hover"
          >
            {t("orders.fields.itemsAmount", {
              amount: totalQuantity,
            })}
          </Popover>
        );
      },
    },
    {
      title: t("orders.fields.createdAt"),
      key: "createdAt",
      dataIndex: "createdAt",
      render: (_, { createdAt }) => (
        <DateField value={dayjs(new Date(createdAt))} format="LLL" />
      ),
    },
  ];

  const columnsAddress: ColumnsType<IAddress> = [
    {
      title: t("customers.fields.address"),
      key: "id",
      render: (_, record) => {
        const fullAddress = record
          ? `${record.more}, ${record.wardName}, ${record.districtName}, ${record.provinceName}`
          : "N/A";
        return <>{fullAddress}</>;
      },
    },
  ];

  return (
    <>
      <Row gutter={[16, 16]} style={{}}>
        <Col xl={6} lg={24} xs={24}>
          <Card
            loading={isLoading}
            bordered={false}
            style={{
              height: "100%",
            }}
          >
            <Space
              direction="vertical"
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <Space
                direction="vertical"
                style={{
                  textAlign: "center",
                  width: "100%",
                }}
              >
                <Avatar size={120} src={customer?.image}></Avatar>
                <Typography.Title level={3}>
                  {customer?.fullName}
                </Typography.Title>
              </Space>
              <Space
                direction="vertical"
                style={{
                  width: "100%",
                  textAlign: xl ? "unset" : "center",
                }}
              >
                <Typography.Text>
                  <UserOutlined /> {customer?.gender}
                </Typography.Text>
                <Typography.Text>
                  <PhoneOutlined /> {customer?.email}
                </Typography.Text>
                <Typography.Text>
                  <CalendarOutlined />{" "}
                  {formatTimestamp(customer?.dateOfBirth || 0).dateFormat}
                </Typography.Text>
                <Typography.Text>
                  <CheckOutlined /> {t(`enum.userStatuses.${customer?.status}`)}
                </Typography.Text>
              </Space>
            </Space>
          </Card>
        </Col>
        <Col xl={18} xs={24}>
          <List
            title={t("orders.orders")}
            headerProps={{
              extra: <></>,
            }}
          >
            <Table {...tableProps} rowKey="id" columns={columnsOrder} />
          </List>
          <List
            title={t("customers.addresses")}
            breadcrumb={null}
            headerProps={{
              extra: <></>,
              style: {
                marginTop: "1em",
              },
            }}
          >
            <Table
              loading={isLoading}
              pagination={false}
              dataSource={customer?.addressList}
              columns={columnsAddress}
              expandable={{
                expandedRowRender: (record) => (
                  <EditAddressForm
                    callBack={refetchCustomer()}
                    address={record}
                  />
                ),
              }}
            />
          </List>
        </Col>
      </Row>
    </>
  );
};
