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
import { Avatar, Button, Card, Col, Form, Input, Row, Select, Space, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import { debounce } from "lodash";
import { getPromotionStatusOptions, tablePaginationSettings } from "../../../constants";
import { IPromotion, IPromotionFilterVariables } from "../../../interfaces";
import { formatTimestamp, showDangerConfirmDialog } from "../../../utils";
import { PromotionStatus } from "../../../components/admin/promotion/promotionStatus";

const { Text } = Typography;

export const PromotionList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { edit } = useNavigation();

  const { tableProps, searchFormProps, filters, current, pageSize } = useTable<
    IPromotion,
    HttpError,
    IPromotionFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q, status }) => {
      const promotionFilter: CrudFilters = [];

      promotionFilter.push({
        field: "status",
        operator: "eq",
        value: status ? status : undefined,
      });

      promotionFilter.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return promotionFilter;
    },
  });

  const columns: ColumnsType<IPromotion> = [
    {
      title: "#",
      key: "index",
      width: "1rem",
      align: "center",
      render: (text, record, index) => (current - 1) * pageSize + index + 1,
    },
    {
      title: t("promotions.fields.code"),
      dataIndex: "code",
      key: "code",
    },
    {
      title: t("promotions.fields.name"),
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
      title: t("promotions.fields.value"),
      dataIndex: "value",
      key: "value",
    },
    {
      title: t("promotions.fields.startDate"),
      dataIndex: "startDate",
      key: "startDate",
      render: (_, record) => {
        return <>{formatTimestamp(record.startDate).dateTimeFormat}</>;
      },
    },
    {
      title: t("promotions.fields.endDate"),
      dataIndex: "endDate",
      key: "endDate",
      render: (_, record) => {
        return <>{formatTimestamp(record.endDate).dateTimeFormat}</>;
      },
    },
    {
      title: t("promotions.fields.status"),
      key: "status",
      dataIndex: "status",
      width: "0.5rem",
      align: "center",
      render: (_, { status }) => <PromotionStatus status={status} />,
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
              onClick={() => edit("promotions", record.id)}
            />
          </Tooltip>
          <Tooltip title={t("actions.delete")}>
            <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
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
            resource: "promotions",
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
                  {t("promotions.filters.title")}
                </Text>
                <Form.Item name="q" noStyle>
                  <Input
                    style={{
                      width: "400px",
                    }}
                    placeholder={t("promotions.filters.search.placeholder")}
                    suffix={<SearchOutlined />}
                  />
                </Form.Item>
                <Form.Item noStyle label={t("promotions.fields.status")} name="status">
                  <Select
                    placeholder={t("promotions.filters.status.placeholder")}
                    style={{
                      width: "200px",
                    }}
                    options={getPromotionStatusOptions(t)}
                  />
                </Form.Item>
                <Button icon={<UndoOutlined />} onClick={() => handleClearFilters()}>
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
