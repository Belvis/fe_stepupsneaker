import {
  useTranslate,
  IResourceComponentsProps,
  useDelete,
  useNavigation,
  HttpError,
  CrudFilters,
  getDefaultFilter,
} from "@refinedev/core";
import { EditButton, List, useTable } from "@refinedev/antd";
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

import { IEmployee, IEmployeeFilterVariables } from "../../interfaces";
import { ColumnsType } from "antd/es/table";
import { UserStatus } from "../../components/admin/userStatus";
import { confirmDialog } from "primereact/confirmdialog";
import { debounce } from "lodash";

const { Text } = Typography;
import dayjs from "dayjs";

export const EmployeeList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { tableProps, searchFormProps, filters, current, pageSize } = useTable<
    IEmployee,
    HttpError,
    IEmployeeFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q, status }) => {
      const employeeFilters: CrudFilters = [];

      employeeFilters.push({
        field: "status",
        operator: "eq",
        value: status ? status : undefined,
      });

      employeeFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return employeeFilters;
    },
  });

  const { mutate: mutateDelete } = useDelete();

  function handleDelete(id: string): void {
    confirmDialog({
      message: t("confirmDialog.delete.message"),
      header: t("confirmDialog.delete.header"),
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: () => {
        mutateDelete({
          resource: "employees",
          id: id,
        });
      },
      acceptLabel: t("confirmDialog.delete.acceptLabel"),
      rejectLabel: t("confirmDialog.delete.rejectLabel"),
      reject: () => {},
    });
  }

  const columns: ColumnsType<IEmployee> = [
    {
      title: "#",
      key: "index",
      width: "1rem",
      render: (text, record, index) => (current - 1) * pageSize + index + 1,
    },
    {
      title: t("employees.fields.fullName"),
      dataIndex: "fullName",
      key: "fullName",
      width: 300,
      render: (_, { image, fullName }) => (
        <Space>
          <Avatar size={74} src={image} />
          <Text style={{ wordBreak: "inherit" }}>{fullName}</Text>
        </Space>
      ),
    },
    {
      title: t("employees.fields.gender.label"),
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: t("employees.fields.role"),
      dataIndex: ["role", "name"],
      key: "role",
    },
    {
      title: t("employees.fields.phone"),
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: t("employees.fields.email"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("employees.fields.address"),
      dataIndex: "address",
      key: "address",
      width: "10%",
    },
    {
      title: t("employees.fields.status"),
      key: "status",
      dataIndex: "status",
      width: "0.5rem",
      align: "center",
      render: (_, { status }) => <UserStatus status={status} />,
    },
    {
      title: t("table.actions"),
      dataIndex: "actions",
      key: "actions",
      width: "10%",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t("actions.edit")}>
            <EditButton
              style={{ color: "#52c41a", borderColor: "#52c41a" }}
              hideText
              size="small"
              recordItemId={record.id}
            />
          </Tooltip>
          <Tooltip title={t("actions.delete")}>
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
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
            {t("employees.filters.title")}
          </Text>
          <Form.Item name="q" noStyle>
            <Input
              style={{
                width: "400px",
              }}
              placeholder={t("employees.filters.search.placeholder")}
              suffix={<SearchOutlined />}
            />
          </Form.Item>
          <Form.Item noStyle label={t("employees.fields.status")} name="status">
            <Select
              placeholder={t("employees.filters.status.placeholder")}
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
