import { SearchOutlined, UndoOutlined } from "@ant-design/icons";
import {
  List,
  NumberField,
  getDefaultSortOrder,
  useTable,
} from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  getDefaultFilter,
  useTranslate,
} from "@refinedev/core";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Table,
  Typography,
} from "antd";

import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { debounce } from "lodash";
import { tablePaginationSettings } from "../../../constants";
import { IPayment, IPaymentFilterVariables } from "../../../interfaces";

const { Text } = Typography;

export const PaymentList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { tableProps, searchFormProps, filters, current, pageSize, sorters } =
    useTable<IPayment, HttpError, IPaymentFilterVariables>({
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
      key: "createdAt",
      dataIndex: "createdAt",
      align: "center",
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("createdAt", sorters),
      render: (text, record, index) => {
        // const createdAtSorter = sorters.find((s) => s.field === "createdAt");
        // Sẽ sai khi enable multi sort

        const sorter = sorters[0];
        const isDescOrder = sorter && sorter.order === "desc";
        const pagination = tableProps.pagination as any;
        const totalItems = pagination.total;

        const calculatedIndex = isDescOrder
          ? totalItems - (current - 1) * pageSize - index
          : (current - 1) * pageSize + index + 1;

        return calculatedIndex;
      },
    },
    {
      title: t("payments.fields.customer"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("customer", sorters),
      dataIndex: ["order", "customer"],
      key: "customer",
      width: 300,
      render: (_, { order }) => {
        console.log(sorters);

        return (
          <Text style={{ wordBreak: "inherit" }}>
            {order?.customer?.fullName || "Khách lẻ"}
          </Text>
        );
      },
    },
    {
      title: t("payments.fields.order"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("order.code", sorters),
      dataIndex: ["order", "code"],
      key: "order",
      render: (_, { order }) => <Text>{order?.code.toUpperCase()}</Text>,
    },
    {
      title: t("payments.fields.totalMoney"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("totalMoney", sorters),
      dataIndex: "totalMoney",
      key: "totalMoney",
      render: (_, record) => (
        <NumberField
          options={{
            currency: "VND",
            style: "currency",
          }}
          value={record.totalMoney}
          locale={"vi"}
        />
      ),
    },
    {
      title: t("payments.fields.paymentMethod"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("paymentMethod.name", sorters),
      dataIndex: "paymentMethod.name",
      align: "center",
      key: "paymentMethod.name",
      render: (_, record) => (
        <Text style={{ wordBreak: "inherit" }}>
          {t(`paymentMethods.options.${record.paymentMethod.name}`)}
        </Text>
      ),
    },
    {
      title: t("payments.fields.transactionCode"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("transactionCode", sorters),
      dataIndex: "transactionCode",
      key: "transactionCode",
      render: (text) => (
        <Text style={{ wordBreak: "inherit" }}>
          {text == "PENDING" ? "Chưa thanh toán" : text}
        </Text>
      ),
    },
    {
      title: t("payments.fields.createdAt"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("updatedAt", sorters),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (_, record) => {
        const date = dayjs(new Date(record.updatedAt));
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
    <List canCreate={false}>
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
