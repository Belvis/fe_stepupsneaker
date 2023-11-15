import { CreateButton, DateField, List, NumberField, useModalForm, useTable } from "@refinedev/antd";
import {
  HttpError,
  IResourceComponentsProps,
  useApiUrl,
  useCustom,
  useCustomMutation,
  useParsed,
  useShow,
  useTranslate,
} from "@refinedev/core";

import {
  CalendarOutlined,
  CheckOutlined,
  EditOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Grid,
  Popover,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";

import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { CreateAddress, EditAddress, EditAddressForm, OrderStatus } from "../../../components";
import {
  IAddress,
  ICustomer,
  IOrder,
  IOrderFilterVariables,
  IVoucherHistory,
} from "../../../interfaces";
import { formatTimestamp, showWarningConfirmDialog } from "../../../utils";
import { useEffect, useState } from "react";

const { useBreakpoint } = Grid;
const { Text } = Typography;

export const CustomerShow: React.FC<IResourceComponentsProps> = () => {
  const { id:customerId } = useParsed();
  const api = useApiUrl();
  const t = useTranslate();
  const { xl } = useBreakpoint();
  const {
    queryResult: { refetch: refetchCustomer, data, isLoading },
  } = useShow<ICustomer>();

  const [selectedAddress, setSelectedAddress] = useState<IAddress>();
  const [addresses, setAddresses] = useState<IAddress[]>([]);

  const customer = data?.data;
  useEffect(() => {
    refetchAddress();
  }, [])

  const { mutate } = useCustomMutation<IAddress>();
  
  function handleAddressSetDefault(id: string) {
    showWarningConfirmDialog({
      options: {
        accept: () => {
          mutate(
            {
              url: `${api}/addresses/set-default-address?address=${id}`,
              method: "put",
              values: {
                address: id,
              },
              successNotification: (data, values) => {
                return {
                  message: `Successfully set default.`,
                  description: "Success with no errors",
                  type: "success",
                };
              },
              errorNotification: (data, values) => {
                return {
                  message: `Something went wrong when setting default address`,
                  description: "Error",
                  type: "error",
                };
              },
            },
            {
              onSuccess: (data, variables, context) => {
                refetchAddress();
              },
            }
          );
        },
        reject: () => {},
      },
      t: t
    });
  }

  const { refetch: refetchAddress, isLoading:isLoadingAddresses } = useCustom<IAddress[]>({
    url: `${api}/addresses`,
    method: "get",
    config: {
      filters: [
        {
          field: "customer",
          operator: "eq",
          value: customerId,
        },
      ],
      sorters: [
        {
          field: "isDefault",
          order: "desc"
        }
      ]
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data: any) => {
        const response = data.response.content.data;
        setAddresses(response);
      },
    },
  });

  const {
    modalProps: editModalProps,
    show: editModalShow,
    id: editId,
  } = useModalForm<IAddress>({
    resource: "addresses",
    redirect: false,
    action: "edit",
    onMutationSuccess: () => {
      refetchAddress();
    },
    warnWhenUnsavedChanges: true,
  });

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    onFinish: createOnFinish,
  } = useModalForm<IAddress>({
    resource: "addresses",
    onMutationSuccess: () => {
      createFormProps.form?.resetFields();
      refetchAddress();
    },
    action: "create",
    redirect: false,
    warnWhenUnsavedChanges: true,
  });

  const {
    tableProps: tablePropsOrder,
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
  });

  const {
    tableProps: tablePropsVoucherHistory,
    current: currentTableVoucherHistory,
    pageSize: pageSizeTableVoucherHistory,
    tableQueryResult: { refetch: refechVoucherHistory },
  } = useTable<IVoucherHistory, HttpError>({
    resource: "voucher-histories",
    permanentFilter: [
      {
        field: "customer",
        operator: "eq",
        value: customerId,
      },
    ],
    initialSorter: [
      {
        field: "createdAt",
        order: "desc",
      },
    ],
    initialPageSize: 5,
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

  const columnsVoucherHistory: ColumnsType<IVoucherHistory> = [
    {
      title: "#",
      key: "index",
      width: "1rem",
      align: "center",
      render: (text, record, index) => (current - 1) * pageSize + index + 1,
    },
    {
      title: "Mã voucher",
      key: "voucherCode",
      dataIndex: ["voucher", "code"],
      align: "center",
    },
    {
      title: "Mã hoá đơn",
      key: "orderCode",
      dataIndex: ["order", "code"],
      align: "center",
    },
    {
      title: "Tiền được giảm",
      key: "moneyReduction",
      dataIndex: "moneyReduction",
      align: "center",
    },
    {
      title: "Tiền trước khi giảm",
      key: "moneyBeforeReduction",
      dataIndex: "moneyBeforeReduction",
      align: "center",
    },
    {
      title: "Tiền sau khi giảm",
      key: "moneyAfterReduction",
      dataIndex: "moneyAfterReduction",
      align: "center",
    },
    {
      title: "Ngày áp dụng",
      key: "createdAt",
      dataIndex: "createdAt",
      render: (_, record) => {
        return (
          <DateField
            value={dayjs(new Date(record.createdAt || 0))}
            format="LLL"
          />
        );
      },
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
        const defaultTag = record.isDefault ? <Tag color="green">Default</Tag> : null;
        
        return <Flex align="middle" justify="space-between">
          <Space>
          {fullAddress} {defaultTag} 
          </Space>
          <Space size="small" key={record.id}>
            <Tooltip title={t("actions.edit")}>
              <Button
                style={{ color: "#52c41a", borderColor: "#52c41a" }}
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setSelectedAddress(record);
                  editModalShow(record.id);
                }}
              />
            </Tooltip>
            <Button
              disabled={record.isDefault}
              size="small"
              onClick={() => {
                handleAddressSetDefault(record.id);
              }}
            >
              {t("actions.setDefault")}
            </Button>
          </Space>
        </Flex>;
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
            <Table {...tablePropsOrder} rowKey="id" columns={columnsOrder} />
          </List>
          <List
            title="Lịch sử áp dụng Voucher"
            headerProps={{
              extra: <></>,
            }}
            breadcrumb={false}
          >
            <Table
              {...tablePropsVoucherHistory}
              rowKey="id"
              columns={columnsVoucherHistory}
            />
          </List>
          <List
            title={t("customers.addresses")}
            breadcrumb={null}
            headerProps={{
              extra: <CreateButton
              onClick={() => {
                createFormProps.form?.resetFields();
                createModalShow();
              }}
            />,
              style: {
                marginTop: "1em",
              },
            }}
          >
            <Table
              loading={isLoading}
              pagination={false}
              dataSource={addresses}
              columns={columnsAddress}
              expandable={{
                expandedRowRender: (record) => (
                  <EditAddressForm
                    callBack={refetchCustomer}
                    address={record}
                  />
                ),
              }}
            />
          </List>
        </Col>
      </Row>
      <CreateAddress
        onFinish={createOnFinish}
        modalProps={createModalProps}
        formProps={createFormProps}
        customer={customer}
      />
      <EditAddress address={selectedAddress} modalProps={editModalProps} callBack={refetchAddress} />
    </>
  );
};
