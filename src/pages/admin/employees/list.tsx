import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import {
  EditButton,
  List,
  getDefaultSortOrder,
  useTable,
} from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  getDefaultFilter,
  useDelete,
  useTranslate,
} from "@refinedev/core";
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";

import { ColumnsType } from "antd/es/table";
import { debounce } from "lodash";
import { UserStatus } from "../../../components";
import {
  getUserStatusOptions,
  tablePaginationSettings,
} from "../../../constants";
import { IEmployee, IEmployeeFilterVariables } from "../../../interfaces";
import { showDangerConfirmDialog } from "../../../utils";

const { Text } = Typography;

export const EmployeeList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { tableProps, searchFormProps, filters, current, pageSize, sorters } =
    useTable<IEmployee, HttpError, IEmployeeFilterVariables>({
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
    showDangerConfirmDialog({
      options: {
        accept: () => {
          mutateDelete({
            resource: "employees",
            id: id,
          });
        },
        reject: () => {},
      },
      t: t,
    });
  }

  const columns: ColumnsType<IEmployee> = [
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
      title: t("employees.fields.fullName"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("fullName", sorters),
      dataIndex: "fullName",
      key: "fullName",
      width: 200,
      render: (_, { image, fullName }) => (
        <Space>
          <Avatar size={74} src={image} />
          <Text style={{ wordBreak: "inherit" }}>{fullName}</Text>
        </Space>
      ),
    },
    {
      title: t("employees.fields.gender.label"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("gender", sorters),
      dataIndex: "gender",
      key: "gender",
      render: (text) => (
        <div>{t(`employees.fields.gender.options.${text}`)}</div>
      ),
    },
    {
      title: t("employees.fields.role"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("role", sorters),
      dataIndex: ["role", "name"],
      width: "10%",
      key: "role",
      render: (text) => <div>{t(`roles.${text}`)}</div>,
    },
    {
      title: t("employees.fields.phone"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("phoneNumber", sorters),
      dataIndex: "phoneNumber",
      width: "13%",
      key: "phoneNumber",
    },
    {
      title: t("employees.fields.email"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("email", sorters),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("employees.fields.address"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("address", sorters),
      dataIndex: "address",
      key: "address",
    },
    {
      title: t("employees.fields.status"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("status", sorters),
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
      <Row gutter={[8, 12]}>
        <Col span={24}>
          <Card>
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
              <Space wrap>
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
                <Form.Item
                  noStyle
                  label={t("employees.fields.status")}
                  name="status"
                >
                  <Select
                    placeholder={t("employees.filters.status.placeholder")}
                    style={{
                      width: "200px",
                    }}
                    options={getUserStatusOptions(t)}
                  />
                </Form.Item>
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
