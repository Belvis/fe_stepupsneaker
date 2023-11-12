import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  getDefaultFilter,
  useNavigation,
  useTranslate,
} from "@refinedev/core";

import { SearchOutlined, UndoOutlined } from "@ant-design/icons";
import { DateField, List, NumberField, useTable } from "@refinedev/antd";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Popover,
  Row,
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
import { IOrder, IOrderFilterVariables } from "../../../interfaces";

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
  } = useTable<IOrder, HttpError, IOrderFilterVariables>({
    onSearch: (params) => {
      const filters: CrudFilters = [];
      const { q, status, priceMin, priceMax } = params;

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
        return (
          <Text strong style={{ color: "#fb5231" }}>
            {code ? code.toUpperCase() : "N/A"}
          </Text>
        );
      },
    },
    {
      title: t("orders.fields.type.title"),
      key: "type",
      dataIndex: "type",
      align: "center",
      render: (_, { type }) => {
        return <OrderType type={type} />;
      },
    },
    {
      title: t("orders.fields.status"),
      key: "status",
      dataIndex: "status",
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
                      width: "400px",
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
