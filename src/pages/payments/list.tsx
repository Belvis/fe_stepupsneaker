import {
  useTranslate,
  IResourceComponentsProps,
  useDelete,
  HttpError,
  CrudFilters,
  getDefaultFilter,
  useCustom,
} from "@refinedev/core";
import { EditButton, List, NumberField, useTable } from "@refinedev/antd";
import {
  DeleteOutlined,
  SearchOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import {
  Table,
  Avatar,
  Space,
  Typography,
  Tooltip,
  Button,
  Form,
  Input,
  Select,
} from "antd";

import {
  ICustomer,
  ICustomerFilterVariables,
  IPayment,
  IPaymentFilterVariables,
} from "../../interfaces";
import { ColumnsType } from "antd/es/table";
import { UserStatus } from "../../components/admin/userStatus";
import { confirmDialog } from "primereact/confirmdialog";
import { debounce } from "lodash";
import { useEffect, useState } from "react";

const { Text } = Typography;
import dayjs from "dayjs";

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

  const { mutate: mutateDelete } = useDelete();

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

  return (
    <List>
      <Form
        {...searchFormProps}
        onValuesChange={debounce(() => {
          searchFormProps.form?.submit();
        }, 500)}
        initialValues={{
          name: getDefaultFilter("q", filters, "eq"),
          status: getDefaultFilter("status", filters, "eq"),
        }}
      >
        <Space wrap style={{ marginBottom: "16px" }}>
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
          <Form.Item noStyle label={t("payments.fields.status")} name="status">
            <Select
              placeholder={t("payments.filters.status.placeholder")}
              style={{
                width: "200px",
              }}
              options={[
                {
                  label: t("enum.userStatuses.ACTIVE"),
                  value: "ACTIVE",
                },
                {
                  label: t("enum.userStatuses.IN_ACTIVE"),
                  value: "IN_ACTIVE",
                },
                {
                  label: t("enum.userStatuses.BLOCKED"),
                  value: "BLOCKED",
                },
              ]}
            />
          </Form.Item>
        </Space>
      </Form>
      <Table
        {...tableProps}
        pagination={{
          ...tableProps.pagination,
          pageSizeOptions: [5, 10, 20, 50, 100],
          showTotal(total: number, range: [number, number]): React.ReactNode {
            return (
              <div>
                {range[0]} - {range[1]} of {total} items
              </div>
            );
          },
          showQuickJumper: true,
          showSizeChanger: true,
        }}
        rowKey="id"
        columns={columns}
      />
    </List>
  );
};
