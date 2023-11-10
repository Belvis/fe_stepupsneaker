import { SearchOutlined, UndoOutlined } from "@ant-design/icons";
import { List, NumberField, useTable } from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  getDefaultFilter,
  useDelete,
  useTranslate,
} from "@refinedev/core";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Typography,
} from "antd";

import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { debounce } from "lodash";
import { tablePaginationSettings } from "../../constants";
import { IPayment, IPaymentFilterVariables } from "../../interfaces";

const { Text } = Typography;

export const PaymentList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { tableProps, searchFormProps, filters, current, pageSize } = useTable<
    IPayment,
    HttpError,
    IPaymentFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q }) => {
      const customerFilters: CrudFilters = [];

      customerFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return customerFilters;
    },
  });

  const columns: ColumnsType<IPayment> = [
    {
      title: "#",
      key: "index",
      width: "1rem",
      render: (text, record, index) => (current - 1) * pageSize + index + 1,
    },
    {
      title: t("payments.fields.customer"),
      dataIndex: ["order", "customer"],
      key: "customer",
      width: 300,
      render: (_, { order }) => (
        <Text style={{ wordBreak: "inherit" }}>
          {order?.customer?.fullName || "Retail customer"}
        </Text>
      ),
    },
    {
      title: t("payments.fields.order"),
      dataIndex: ["order", "code"],
      key: "order",
      render: (_, { order }) => <Text>{order?.code.toUpperCase()}</Text>,
    },
    {
      title: t("payments.fields.totalMoney"),
      dataIndex: "totalMoney",
      key: "totalMoney",
      render: (_, record) => (
        <NumberField
          options={{
            currency: "VND",
            style: "currency",
          }}
          value={record.totalMoney}
        />
      ),
    },
    {
      title: t("payments.fields.paymentMethod"),
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (_, record) => (
        <Text style={{ wordBreak: "inherit" }}>
          {record.paymentMethod.name}
        </Text>
      ),
    },
    {
      title: t("payments.fields.transactionCode"),
      dataIndex: "transactionCode",
      key: "transactionCode",
    },
    {
      title: t("payments.fields.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_, record) => {
        const date = dayjs(new Date(record.createdAt));
        const formattedDate = date.format("YYYY-MM-DD HH:mm");
        return <>{formattedDate}</>;
      },
    },
  ];

  const handleClearFilters = () => {
    searchFormProps.form?.setFieldValue("q", "");
    searchFormProps.form?.submit();
  };

  return (
    <List>
      <Row gutter={[8, 12]} align="middle" justify="center">
        <Col span={24}>
          <Card>
            <Form
              {...searchFormProps}
              onValuesChange={debounce(() => {
                searchFormProps.form?.submit();
              }, 500)}
              initialValues={{
                name: getDefaultFilter("q", filters, "eq"),
              }}
            >
              <Space wrap>
                <Text style={{ fontSize: "18px" }} strong>
                  {t("payments.filters.title")}
                </Text>
                <Form.Item name="q" noStyle>
                  <Input
                    style={{
                      width: "400px",
                    }}
                    placeholder={t("payments.filters.search.placeholder")}
                    suffix={<SearchOutlined />}
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
          />
        </Col>
      </Row>
    </List>
  );
};
