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
  ColorPicker,
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
import { CreateColor } from "./create";
import { EditColor } from "./edit";

import { debounce } from "lodash";
import { ProductStatus } from "../../../components";
import { getProductStatusOptions } from "../../../constants";
import { IColor, IColorFilterVariables } from "../../../interfaces";
import { showDangerConfirmDialog } from "../../../utils";
import { colorPickerStyles } from "./style";

const { Text } = Typography;

export const ColorList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { mutate: mutateDelete } = useDelete();
  const { tableProps, searchFormProps, filters, current, pageSize } = useTable<
    IColor,
    HttpError,
    IColorFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q, status }) => {
      const colorFilters: CrudFilters = [];

      colorFilters.push({
        field: "status",
        operator: "eq",
        value: status ? status : undefined,
      });

      colorFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return colorFilters;
    },
  });

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    onFinish: createOnFinish,
  } = useModalForm<IColor>({
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
    close: editClose,
  } = useModalForm<IColor>({
    action: "edit",
    warnWhenUnsavedChanges: true,
  });

  const columns: ColumnsType<IColor> = [
    {
      title: "#",
      key: "index",
      align: "center",
      render: (text, record, index) => (current - 1) * pageSize + index + 1,
    },
    {
      title: t("colors.fields.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("colors.fields.code"),
      dataIndex: "code",
      key: "code",
      align: "center",
      render: (_, { code }) => (
        <ColorPicker style={colorPickerStyles} value={code} showText disabled />
      ),
    },
    {
      title: t("colors.fields.status"),
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

  const handleClearFilters = () => {
    searchFormProps.form?.setFieldValue("q", null);
    searchFormProps.form?.setFieldValue("status", null);
    searchFormProps.form?.submit();
  };

  function handleDelete(id: string): void {
    showDangerConfirmDialog({
      options: {
        accept: () => {
          mutateDelete({
            resource: "colors",
            id: id,
          });
        },
        reject: () => {},
      },
      t: t,
    });
  }

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
                  {t("colors.filters.title")}
                </Text>
                <Form.Item name="q" noStyle>
                  <Input
                    style={{
                      width: "400px",
                    }}
                    placeholder={t("colors.filters.search.placeholder")}
                    suffix={<SearchOutlined />}
                  />
                </Form.Item>
                <Form.Item
                  noStyle
                  label={t("colors.fields.status")}
                  name="status"
                >
                  <Select
                    placeholder={t("colors.filters.status.placeholder")}
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
              pageSizeOptions: [5, 10, 20, 50, 100],
              showTotal(
                total: number,
                range: [number, number]
              ): React.ReactNode {
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
        </Col>
      </Row>

      <CreateColor
        onFinish={createOnFinish}
        modalProps={createModalProps}
        formProps={createFormProps}
      />
      <EditColor
        onFinish={editOnFinish}
        close={editClose}
        id={editId}
        modalProps={editModalProps}
        formProps={editFormProps}
      />
    </List>
  );
};
