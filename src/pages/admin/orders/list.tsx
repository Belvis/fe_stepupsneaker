import {
  useTranslate,
  IResourceComponentsProps,
  CrudFilters,
  useExport,
  useNavigation,
  HttpError,
  getDefaultFilter,
} from "@refinedev/core";

import {
  List,
  TextField,
  useTable,
  getDefaultSortOrder,
  DateField,
  NumberField,
  useSelect,
  ExportButton,
} from "@refinedev/antd";
import { SearchOutlined, UndoOutlined } from "@ant-design/icons";
import {
  Table,
  Popover,
  Card,
  Input,
  Form,
  DatePicker,
  Select,
  Button,
  FormProps,
  Row,
  Col,
  Space,
  Avatar,
  Typography,
  Tooltip,
} from "antd";
import dayjs from "dayjs";

import { IOrder, IOrderFilterVariables } from "../../../interfaces";
import { ColumnsType } from "antd/es/table";
import { OrderActions, OrderStatus } from "../../../components";
import { debounce } from "lodash";
import { tablePaginationSettings } from "../../../constants";

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

export const OrderList: React.FC<IResourceComponentsProps> = () => {
  const { tableProps, searchFormProps, filters, current, pageSize } = useTable<
    IOrder,
    HttpError,
    IOrderFilterVariables
  >({
    onSearch: (params) => {
      const filters: CrudFilters = [];
      const { q, status } = params;

      filters.push({
        field: "q",
        operator: "eq",
        value: q,
      });

      filters.push({
        field: "status.text",
        operator: "in",
        value: status,
      });

      return filters;
    },
  });

  const t = useTranslate();
  const { show } = useNavigation();

  const columns: ColumnsType<IOrder> = [
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
      width: "10%",
      align: "center",
      render: (_, { code }) => {
        return <Text>{code ? code : "N/A"}</Text>;
      },
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
      title: t("orders.fields.status"),
      key: "status",
      dataIndex: "status",
      width: "10%",
      align: "center",
      render: (_, { status }) => <OrderStatus status={status} />,
    },
    {
      title: t("orders.fields.totalPrice"),
      key: "amount",
      dataIndex: "amount",
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
      key: "customer.id",
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
    {
      title: t("table.actions"),
      dataIndex: "actions",
      key: "actions",
      width: "10%",
      align: "center",
      render: (_, record) => <OrderActions record={record} />,
    },
  ];

  const handleClearFilters = () => {
    searchFormProps.form?.setFieldValue("q", "");
    searchFormProps.form?.setFieldValue("status", "");
    searchFormProps.form?.submit();
  };

  return (
    <List>
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
        <Space wrap style={{ marginBottom: "16px" }}>
          <Text style={{ fontSize: "18px" }} strong>
            {t("orders.filters.title")}
          </Text>
          <Form.Item name="q" noStyle>
            <Input
              style={{
                width: "400px",
              }}
              placeholder={t("orders.filters.search.placeholder")}
              suffix={<SearchOutlined />}
            />
          </Form.Item>
          <Form.Item noStyle label={t("orders.fields.status")} name="status">
            <Select
              placeholder={t("orders.filters.status.placeholder")}
              style={{
                width: "200px",
              }}
              options={[
                {
                  label: t("enum.orderStatuses.ACTIVE"),
                  value: "ACTIVE",
                },
                {
                  label: t("enum.orderStatuses.IN_ACTIVE"),
                  value: "IN_ACTIVE",
                },
              ]}
            />
          </Form.Item>
          <Button icon={<UndoOutlined />} onClick={() => handleClearFilters()}>
            {t("actions.clear")}
          </Button>
        </Space>
      </Form>
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
      />
    </List>
  );
};
