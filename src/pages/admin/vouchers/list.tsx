import {
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  PercentageOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { List, useTable } from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  getDefaultFilter,
  useDelete,
  useNavigation,
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
import type { ColumnsType } from "antd/es/table";

import { debounce } from "lodash";
import { VoucherStatus } from "../../../components";
import {
  getVouccherStatusOptions,
  tablePaginationSettings,
} from "../../../constants";
import { IVoucher, IVoucherFilterVariables } from "../../../interfaces";
import { formatTimestamp, showDangerConfirmDialog } from "../../../utils";

const { Text } = Typography;

export const VoucherList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { edit } = useNavigation();

  const { tableProps, searchFormProps, filters, current, pageSize } = useTable<
    IVoucher,
    HttpError,
    IVoucherFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q, status }) => {
      const voucherFilters: CrudFilters = [];

      voucherFilters.push({
        field: "status",
        operator: "eq",
        value: status ? status : undefined,
      });

      voucherFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return voucherFilters;
    },
  });

  const columns: ColumnsType<IVoucher> = [
    {
      title: "#",
      key: "index",
      width: "1rem",
      align: "center",
      render: (text, record, index) => (current - 1) * pageSize + index + 1,
    },
    {
      title: t("vouchers.fields.code"),
      dataIndex: "code",
      key: "code",
    },
    {
      title: t("vouchers.fields.name"),
      dataIndex: "name",
      key: "name",
      width: 300,
      render: (_, { image, name }) => (
        <Space>
          <Avatar shape="square" size={74} src={image} />
          <Text style={{ wordBreak: "inherit" }}>{name}</Text>
        </Space>
      ),
    },
    {
      title: t("vouchers.fields.type"),
      dataIndex: "type",
      key: "type",
      width: "0.5rem",
      align: "center",
      render: (_, record) => {
        const icon =
          record.type === "PERCENTAGE" ? (
            <PercentageOutlined style={{ fontSize: 24 }} />
          ) : (
            <DollarOutlined style={{ fontSize: 24 }} />
          );
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
        );
      },
    },
    {
      title: t("vouchers.fields.value"),
      dataIndex: "value",
      key: "value",
    },
    {
      title: t("vouchers.fields.constraint"),
      dataIndex: "constraint",
      key: "constraint",
    },
    {
      title: t("vouchers.fields.quantity"),
      dataIndex: "quantity",
      width: "1rem",
      key: "quantity",
    },
    {
      title: t("vouchers.fields.startDate"),
      dataIndex: "startDate",
      key: "startDate",
      render: (_, record) => {
        return <>{formatTimestamp(record.startDate).dateTimeFormat}</>;
      },
    },
    {
      title: t("vouchers.fields.endDate"),
      dataIndex: "endDate",
      key: "endDate",
      render: (_, record) => {
        return <>{formatTimestamp(record.endDate).dateTimeFormat}</>;
      },
    },
    {
      title: t("vouchers.fields.status"),
      key: "status",
      dataIndex: "status",
      width: "0.5rem",
      align: "center",
      render: (_, { status }) => <VoucherStatus status={status} />,
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
            <Button
              style={{ color: "#52c41a", borderColor: "#52c41a" }}
              size="small"
              icon={<EditOutlined />}
              onClick={() => edit("vouchers", record.id)}
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

  const { mutate: mutateDelete } = useDelete();

  function handleDelete(id: string): void {
    showDangerConfirmDialog({
      options: {
        accept: () => {
          mutateDelete({
            resource: "vouchers",
            id: id,
          });
        },
        reject: () => {},
      },
      t: t,
    });
  }

  const handleClearFilters = () => {
    searchFormProps.form?.setFieldValue("q", "");
    searchFormProps.form?.setFieldValue("status", "");
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
                  {t("vouchers.filters.title")}
                </Text>
                <Form.Item name="q" noStyle>
                  <Input
                    style={{
                      width: "400px",
                    }}
                    placeholder={t("vouchers.filters.search.placeholder")}
                    suffix={<SearchOutlined />}
                  />
                </Form.Item>
                <Form.Item
                  noStyle
                  label={t("vouchers.fields.status")}
                  name="status"
                >
                  <Select
                    placeholder={t("vouchers.filters.status.placeholder")}
                    style={{
                      width: "200px",
                    }}
                    options={getVouccherStatusOptions(t)}
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
