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
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CreateTradeMark } from "./create";
import { EditTradeMark } from "./edit";

import { debounce } from "lodash";
import { ProductStatus } from "../../../../components";
import { getProductStatusOptions } from "../../../../constants";
import { tablePaginationSettings } from "../../../../constants";
import { ITradeMark, ITradeMarkFilterVariables } from "../../../../interfaces";
import { showDangerConfirmDialog } from "../../../../utils";

const { Text } = Typography;

export const TradeMarkList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { mutate: mutateDelete } = useDelete();

  const { tableProps, searchFormProps, filters, current, pageSize, sorters } =
    useTable<ITradeMark, HttpError, ITradeMarkFilterVariables>({
      pagination: {
        pageSize: 5,
      },
      onSearch: ({ q, status }) => {
        const tradeMarkFilters: CrudFilters = [];

        tradeMarkFilters.push({
          field: "status",
          operator: "eq",
          value: status ? status : undefined,
        });

        tradeMarkFilters.push({
          field: "q",
          operator: "eq",
          value: q ? q : undefined,
        });

        return tradeMarkFilters;
      },
    });

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    onFinish: createOnFinish,
  } = useModalForm<ITradeMark>({
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
  } = useModalForm<ITradeMark>({
    action: "edit",
    warnWhenUnsavedChanges: true,
  });

  const columns: ColumnsType<ITradeMark> = [
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
      title: t("trade-marks.fields.name"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("name", sorters),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("trade-marks.fields.status"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("status", sorters),
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
            resource: "tradeMarks",
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
                  {t("trade-marks.filters.title")}
                </Text>
                <Form.Item name="q" noStyle>
                  <Input
                    style={{
                      width: "400px",
                    }}
                    placeholder={t("trade-marks.filters.search.placeholder")}
                    suffix={<SearchOutlined />}
                  />
                </Form.Item>
                <Form.Item
                  noStyle
                  label={t("trade-marks.fields.status")}
                  name="status"
                >
                  <Select
                    placeholder={t("trade-marks.filters.status.placeholder")}
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

      <CreateTradeMark
        onFinish={createOnFinish}
        modalProps={createModalProps}
        formProps={createFormProps}
      />
      <EditTradeMark
        id={editId}
        onFinish={editOnFinish}
        modalProps={editModalProps}
        formProps={editFormProps}
      />
    </List>
  );
};
