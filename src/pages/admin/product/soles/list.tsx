import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { List, useModalForm, useTable } from "@refinedev/antd";
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
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CreateSole } from "./create";
import { EditSole } from "./edit";

import { debounce } from "lodash";
import { ProductStatus } from "../../../../components";
import {
  getProductStatusOptions,
  tablePaginationSettings,
} from "../../../../constants";
import { ISole, ISoleFilterVariables } from "../../../../interfaces";
import { showDangerConfirmDialog } from "../../../../utils";

const { Text } = Typography;

export const SoleList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { mutate: mutateDelete } = useDelete();

  const { tableProps, searchFormProps, filters, current, pageSize } = useTable<
    ISole,
    HttpError,
    ISoleFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q, status }) => {
      const soleFilters: CrudFilters = [];

      soleFilters.push({
        field: "status",
        operator: "eq",
        value: status ? status : undefined,
      });

      soleFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return soleFilters;
    },
  });

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    onFinish: createOnFinish,
  } = useModalForm<ISole>({
    onMutationSuccess: () => {
      createFormProps.form?.resetFields();
    },
    action: "create",
    warnWhenUnsavedChanges: true,
  });

  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: editModalShow,
    id: editId,
    onFinish: editOnFinish,
  } = useModalForm<ISole>({
    action: "edit",
    warnWhenUnsavedChanges: true,
  });

  const columns: ColumnsType<ISole> = [
    {
      title: "#",
      key: "index",
      align: "center",
      render: (text, record, index) => (current - 1) * pageSize + index + 1,
    },
    {
      title: t("soles.fields.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("soles.fields.status"),
      key: "status",
      dataIndex: "status",
      align: "center",
      render: (_, { status }) => <ProductStatus status={status} />,
    },
    {
      title: t("table.actions"),
      dataIndex: "actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t("actions.edit")}>
            <Button
              style={{ color: "#52c41a", borderColor: "#52c41a" }}
              size="small"
              icon={<EditOutlined />}
              onClick={() => editModalShow(record.id)}
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

  function handleDelete(id: string): void {
    showDangerConfirmDialog({
      options: {
        accept: () => {
          mutateDelete({
            resource: "soles",
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
    <List
      createButtonProps={{
        onClick: () => {
          createModalShow();
        },
      }}
    >
      <Row gutter={[8, 12]} align="middle" justify="center">
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
                  {t("soles.filters.title")}
                </Text>
                <Form.Item name="q" noStyle>
                  <Input
                    style={{
                      width: "400px",
                    }}
                    placeholder={t("soles.filters.search.placeholder")}
                    suffix={<SearchOutlined />}
                  />
                </Form.Item>
                <Form.Item
                  noStyle
                  label={t("soles.fields.status")}
                  name="status"
                >
                  <Select
                    placeholder={t("soles.filters.status.placeholder")}
                    style={{
                      width: "200px",
                    }}
                    options={getProductStatusOptions(t)}
                  />
                </Form.Item>
                <Button icon={<UndoOutlined />} onClick={handleClearFilters}>
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

      <CreateSole
        onFinish={createOnFinish}
        modalProps={createModalProps}
        formProps={createFormProps}
      />
      <EditSole
        id={editId}
        onFinish={editOnFinish}
        modalProps={editModalProps}
        formProps={editFormProps}
      />
    </List>
  );
};
