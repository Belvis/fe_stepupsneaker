import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import {
  List,
  getDefaultSortOrder,
  useModalForm,
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
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CreateRole } from "./create";
import { EditRole } from "./edit";

import { debounce } from "lodash";
import { tablePaginationSettings } from "../../../constants";
import { IRole, IRoleFilterVariables } from "../../../interfaces";
import { showDangerConfirmDialog } from "../../../utils";

const { Text } = Typography;

export const RoleList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { mutate: mutateDelete } = useDelete();

  const { tableProps, searchFormProps, filters, current, pageSize, sorters } =
    useTable<IRole, HttpError, IRoleFilterVariables>({
      pagination: {
        pageSize: 5,
      },
      onSearch: ({ q }) => {
        const roleFilters: CrudFilters = [];

        roleFilters.push({
          field: "q",
          operator: "eq",
          value: q ? q : undefined,
        });

        return roleFilters;
      },
    });

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    onFinish: createOnFinish,
  } = useModalForm<IRole>({
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
  } = useModalForm<IRole>({
    action: "edit",
    warnWhenUnsavedChanges: true,
  });

  const columns: ColumnsType<IRole> = [
    {
      title: "#",
      key: "createdAt",
      dataIndex: "createdAt",
      align: "center",
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("createdAt", sorters),
      render: (text, record, index) => {
        const createdAtSorter = sorters.find((s) => s.field === "createdAt");
        const isDescOrder = createdAtSorter && createdAtSorter.order === "desc";
        const pagination = tableProps.pagination as any;
        const totalItems = pagination.total;

        const calculatedIndex = isDescOrder
          ? totalItems - (current - 1) * pageSize - index
          : (current - 1) * pageSize + index + 1;

        return calculatedIndex;
      },
    },
    {
      title: t("roles.fields.name"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("name", sorters),
      dataIndex: "name",
      key: "name",
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
            resource: "roles",
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
              }}
            >
              <Space wrap>
                <Text style={{ fontSize: "18px" }} strong>
                  {t("roles.filters.title")}
                </Text>
                <Form.Item name="q" noStyle>
                  <Input
                    style={{
                      width: "400px",
                    }}
                    placeholder={t("roles.filters.search.placeholder")}
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

      <CreateRole
        onFinish={createOnFinish}
        modalProps={createModalProps}
        formProps={createFormProps}
      />
      <EditRole
        id={editId}
        onFinish={editOnFinish}
        modalProps={editModalProps}
        formProps={editFormProps}
      />
    </List>
  );
};
