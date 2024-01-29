import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  getDefaultFilter,
  useNavigation,
  useTranslate,
} from "@refinedev/core";

import { SearchOutlined, UndoOutlined } from "@ant-design/icons";
import {
  DateField,
  List,
  NumberField,
  getDefaultSortOrder,
  useTable,
} from "@refinedev/antd";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Popover,
  Row,
  Segmented,
  SegmentedProps,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { debounce } from "lodash";
import { OrderActions, OrderStatus, OrderType } from "../../../components";
import {
  getOrderStatusOptions,
  getOrderTypeOptions,
  tablePaginationSettings,
} from "../../../constants";
import {
  IOrder,
  IOrderFilterVariables,
  IOrderNotification,
} from "../../../interfaces";
import { useEffect, useState } from "react";
import { AxiosInstance } from "axios";
import { axiosInstance } from "../../../utils";
import { stringify } from "query-string";
import { SegmentedValue } from "antd/es/segmented";

const httpClient: AxiosInstance = axiosInstance;

const { Text } = Typography;

export const OrderList: React.FC<IResourceComponentsProps> = () => {
  const {
    tableProps,
    searchFormProps,
    filters,
    current,
    pageSize,
    tableQueryResult: { refetch },
    overtime,
    sorters,
  } = useTable<IOrder, HttpError, IOrderFilterVariables>({
    onSearch: (params) => {
      const filters: CrudFilters = [];
      const { q, status, priceMin, priceMax, type } = params;

      filters.push({
        field: "q",
        operator: "eq",
        value: q,
      });

      filters.push({
        field: "status",
        operator: "eq",
        value: status,
      });

      filters.push({
        field: "type",
        operator: "eq",
        value: type,
      });

      filters.push({
        field: "priceMin",
        operator: "eq",
        value: priceMin ? priceMin : undefined,
      });

      filters.push({
        field: "priceMax",
        operator: "eq",
        value: priceMax ? priceMax : undefined,
      });

      return filters;
    },
  });

  const t = useTranslate();
  const { show } = useNavigation();

  const columns: ColumnsType<IOrder> = [
    {
      title: "#",
      key: "createdAt",
      dataIndex: "createdAt",
      align: "center",
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("createdAt", sorters),
      render: (text, record, index) => {
        const createdAtSorter = sorters.find((s) => s.field === "createdAt");
        const isDescOrder = createdAtSorter && createdAtSorter.order === "desc";
        const pagination = tableProps.pagination as any;
        const totalItems = pagination.total;

        const calculatedIndex = isDescOrder
          ? totalItems - (current - 1) * pageSize - index
          : (current - 1) * pageSize + index + 1;

        return calculatedIndex;
      },
    },
    {
      title: t("orders.fields.code"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("code", sorters),
      key: "code",
      dataIndex: "code",
      width: "10%",
      align: "center",
      render: (_, { code }) => {
        return (
          <Text strong style={{ color: "#fb5231" }}>
            {code ? code.toUpperCase() : "N/A"}
          </Text>
        );
      },
    },
    {
      title: t("orders.fields.type.title"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("type", sorters),
      key: "type",
      dataIndex: "type",
      align: "center",
      render: (_, { type }) => {
        return <OrderType type={type} />;
      },
    },
    {
      title: t("orders.fields.status"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("status", sorters),
      key: "status",
      dataIndex: "status",
      align: "center",
      render: (_, { status }) => <OrderStatus status={status} />,
    },
    {
      title: t("orders.fields.totalPrice"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("totalMoney", sorters),
      key: "totalMoney",
      dataIndex: "totalMoney",
      width: "10%",
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
      title: t("orders.fields.customer"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("customer", sorters),
      key: "customer",
      dataIndex: ["customer"],
      render: (_, { customer }) => {
        return (
          <Text>
            {customer ? customer.fullName : t("orders.tab.retailCustomer")}
          </Text>
        );
      },
    },
    {
      title: t("orders.fields.orderDetails"),
      key: "orderDetails",
      dataIndex: "orderDetails",
      align: "center",
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
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("createdAt", sorters),
      key: "createdAt",
      dataIndex: "createdAt",
      align: "right",
      render: (_, { createdAt }) => (
        <DateField value={dayjs(new Date(createdAt))} format="LLL" />
      ),
    },
    {
      title: t("table.actions"),
      dataIndex: "actions",
      key: "actions",
      width: "10%",
      align: "center",
      render: (_, record) => (
        <OrderActions record={record} callBack={refetch} />
      ),
    },
  ];

  const handleClearFilters = () => {
    searchFormProps.form?.setFieldValue("q", null);
    searchFormProps.form?.setFieldValue("status", null);
    searchFormProps.form?.setFieldValue("type", null);
    searchFormProps.form?.setFieldValue("priceMin", null);
    searchFormProps.form?.setFieldValue("priceMax", null);
    searchFormProps.form?.submit();
  };

  const [allStatusCount, setAllStatusCount] = useState<number>(0);
  const [confirmStatusCount, setConfirmStatusCount] = useState<number>(0);
  const [deliveryStatusCount, setDeliveryStatusCount] = useState<number>(0);
  const [deliveringStatusCount, setDeliveringStatusCount] = useState<number>(0);
  const [completedStatusCount, setCompletedStatusCount] = useState<number>(0);
  const [canceledStatusCount, setCanceledStatusCount] = useState<number>(0);

  // useEffect(() => {
  //   // Todo: refetch whenever get new noti
  // }, [confirmStatusCount]);

  const url = "http://localhost:8080/admin/notifications/orders/sse";

  // Hàm để cập nhật các state dựa trên notifications
  const updateStatusCounts = (newNotifications: IOrderNotification[]) => {
    let confirmCount = 0;
    let deliveryCount = 0;
    let deliveringCount = 0;
    let completedCount = 0;
    let canceledCount = 0;

    newNotifications.forEach((notification) => {
      switch (notification.status) {
        case "WAIT_FOR_CONFIRMATION":
          confirmCount += notification.count;
          break;
        case "WAIT_FOR_DELIVERY":
          deliveryCount += notification.count;
          break;
        case "DELIVERING":
          deliveringCount += notification.count;
          break;
        case "COMPLETED":
          completedCount += notification.count;
          break;
        case "CANCELED":
          canceledCount += notification.count;
          break;
        default:
          break;
      }
    });

    setConfirmStatusCount(confirmCount);
    setDeliveryStatusCount(deliveryCount);
    setDeliveringStatusCount(deliveringCount);
    setCompletedStatusCount(completedCount);
    setCanceledStatusCount(canceledCount);
    setAllStatusCount(
      confirmCount +
        deliveringCount +
        deliveryCount +
        completedCount +
        canceledCount
    );
  };

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data && data.length > 0) {
        updateStatusCounts(data);
      }
    };

    eventSource.addEventListener("close", () => {
      console.log("Connection closed");
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const options: SegmentedProps["options"] = [
    {
      label: (
        <Badge count={allStatusCount} size="small">
          <Text>Tất cả</Text>
        </Badge>
      ),
      value: "ALL",
    },
    {
      label: (
        <Badge count={confirmStatusCount} size="small">
          <Text>Chờ xác nhận</Text>
        </Badge>
      ),
      value: "WAIT_FOR_CONFIRMATION",
    },
    {
      label: (
        <Badge count={deliveryStatusCount} size="small">
          <Text>Chờ vận chuyển</Text>
        </Badge>
      ),
      value: "WAIT_FOR_DELIVERY",
    },
    {
      label: (
        <Badge count={deliveringStatusCount} size="small">
          <Text>Đang vận chuyển</Text>
        </Badge>
      ),
      value: "DELIVERING",
    },
    {
      label: (
        <Badge count={completedStatusCount} size="small">
          <Text>Hoàn thành</Text>
        </Badge>
      ),
      value: "COMPLETED",
    },
    {
      label: (
        <Badge count={canceledStatusCount} size="small">
          <Text>Huỷ</Text>
        </Badge>
      ),
      value: "CANCELED",
    },
  ];

  return (
    <List>
      <Row gutter={[8, 12]}>
        <Col span={24}>
          <Card>
            <Form
              {...searchFormProps}
              onValuesChange={debounce(() => {
                searchFormProps.form?.submit();
              }, 500)}
              initialValues={{
                q: getDefaultFilter("q", filters, "eq"),
                status: getDefaultFilter("status", filters, "eq"),
              }}
            >
              <Space wrap>
                <Text style={{ fontSize: "18px" }} strong>
                  {t("orders.filters.title")}
                </Text>
                <Form.Item name="q" noStyle>
                  <Input
                    style={{
                      width: "300px",
                    }}
                    placeholder={t("orders.filters.search.placeholder")}
                    suffix={<SearchOutlined />}
                  />
                </Form.Item>
                <Form.Item
                  noStyle
                  label={t("orders.fields.status")}
                  name="status"
                >
                  <Select
                    placeholder={t("orders.filters.status.placeholder")}
                    options={getOrderStatusOptions(t)}
                  />
                </Form.Item>
                <Form.Item noStyle label={t("orders.fields.type")} name="type">
                  <Select
                    placeholder={t("orders.filters.type.placeholder")}
                    options={getOrderTypeOptions(t)}
                  />
                </Form.Item>
                <Text>{t("productDetails.filters.priceMin.label")}</Text>
                <Form.Item
                  noStyle
                  label={t("productDetails.filters.priceMin.label")}
                  name="priceMin"
                >
                  <InputNumber
                    formatter={(value) =>
                      `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => {
                      const parsedValue = parseInt(
                        value!.replace(/₫\s?|(,*)/g, ""),
                        10
                      );
                      return isNaN(parsedValue) ? 0 : parsedValue;
                    }}
                  />
                </Form.Item>
                <Text>{t("productDetails.filters.priceMax.label")}</Text>
                <Form.Item
                  noStyle
                  label={t("productDetails.filters.priceMax.label")}
                  name="priceMax"
                >
                  <InputNumber
                    formatter={(value) =>
                      `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => {
                      const parsedValue = parseInt(
                        value!.replace(/₫\s?|(,*)/g, ""),
                        10
                      );
                      return isNaN(parsedValue) ? 0 : parsedValue;
                    }}
                  />
                </Form.Item>
                <Button
                  icon={<UndoOutlined />}
                  onClick={() => handleClearFilters()}
                >
                  {t("actions.clear")}
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>
        <Col span={24}>
          <Card>
            <Segmented
              size="large"
              block
              options={options}
              onChange={(value: SegmentedValue) => {
                searchFormProps.form?.setFieldValue("status", value);
                searchFormProps.form?.submit();
              }}
            />
          </Card>
        </Col>
        <Col span={24}>
          <Table
            {...tableProps}
            pagination={{
              ...tableProps.pagination,
              ...tablePaginationSettings,
            }}
            rowKey="id"
            columns={columns}
            onRow={(record) => {
              return {
                onDoubleClick: () => {
                  show("orders", record.id);
                },
              };
            }}
            loading={overtime.elapsedTime != undefined}
          />
        </Col>
      </Row>
    </List>
  );
};
