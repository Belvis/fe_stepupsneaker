import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { List, NumberField, useModalForm, useTable } from "@refinedev/antd";
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
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import { debounce } from "lodash";
import { ProductStatus, EditProduct } from "../../../../components";
import {
  getProductStatusOptions,
  tablePaginationSettings,
} from "../../../../constants";
import {
  IColor,
  IProduct,
  IProductFilterVariables,
  ISize,
} from "../../../../interfaces";
import { showDangerConfirmDialog } from "../../../../utils";

const { Text } = Typography;

export const ProductList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { show } = useNavigation();
  const { mutate: mutateDelete } = useDelete();

  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: editModalShow,
    id: editId,
    onFinish: editOnFinish,
  } = useModalForm<IProduct>({
    action: "edit",
    warnWhenUnsavedChanges: true,
  });

  const { tableProps, searchFormProps, filters, current, pageSize } = useTable<
    IProduct,
    HttpError,
    IProductFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q, status }) => {
      const productFilters: CrudFilters = [];

      productFilters.push({
        field: "status",
        operator: "eq",
        value: status ? status : undefined,
      });

      productFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return productFilters;
    },
  });

  const columns: ColumnsType<IProduct> = [
    {
      title: "#",
      key: "index",
      width: "1rem",
      align: "center",
      render: (text, record, index) => (current - 1) * pageSize + index + 1,
    },
    {
      title: t("products.fields.code"),
      key: "code",
      dataIndex: "code",
      width: "2rem",
      align: "center",
    },
    {
      title: t("products.fields.name"),
      dataIndex: "name",
      width: "25%",
      key: "name",
      render: (_, { image, name }) => (
        <Space>
          <Avatar shape="square" size={74} src={image} />
          <Text style={{ wordBreak: "inherit" }}>{name}</Text>
        </Space>
      ),
    },
    {
      title: t("products.fields.color"),
      dataIndex: "color",
      key: "color",
      width: "10%",
      align: "center",
      render: (_, { productDetails }) => {
        const colors: IColor[] = Object.values(
          productDetails.reduce((uniqueColorMap: any, productDetail) => {
            const colorCode = productDetail.color.code;
            if (!uniqueColorMap[colorCode]) {
              uniqueColorMap[colorCode] = productDetail.color;
            }
            return uniqueColorMap;
          }, {})
        );
        return (
          <Space wrap>
            {colors.length > 0 ? (
              <>
                {colors.map((color, index) => (
                  <Tag
                    key={index}
                    style={{
                      width: "16px",
                      height: "16px",
                      backgroundColor: "#" + color.code,
                    }}
                  />
                ))}
              </>
            ) : (
              <Text>N/A</Text>
            )}
          </Space>
        );
      },
    },
    {
      title: t("products.fields.size"),
      dataIndex: "size",
      key: "size",
      width: "10%",
      align: "center",
      render: (_, { productDetails }) => {
        const sizes: ISize[] = Object.values(
          productDetails.reduce((uniqueSizeMap: any, productDetail) => {
            const sizeId = productDetail.size.id;
            if (!uniqueSizeMap[sizeId]) {
              uniqueSizeMap[sizeId] = productDetail.size;
            }
            return uniqueSizeMap;
          }, {})
        );
        return (
          <Space wrap>
            {sizes.length > 0 && (
              <>
                {sizes.map((size, index) => (
                  <Tag key={index}>{size.name}</Tag>
                ))}
              </>
            )}
          </Space>
        );
      },
    },
    {
      title: t("products.fields.price"),
      dataIndex: "price",
      key: "price",
      align: "center",
      render: (_, { productDetails }) => {
        const prices = productDetails.map((detail) => detail.price);
        const lowestPrice = Math.min(...prices);

        return (
          <Text>
            {prices.length > 0 ? (
              <NumberField
                options={{
                  currency: "VND",
                  style: "currency",
                }}
                value={lowestPrice}
              />
            ) : (
              "N/A"
            )}
          </Text>
        );
      },
    },
    {
      title: t("products.fields.quantity"),
      key: "quantity",
      dataIndex: "quantity",
      align: "center",
      render: (text, record) => {
        const totalQuantity = record.productDetails.reduce(
          (total, productDetail) => {
            return total + productDetail.quantity;
          },
          0
        );
        return <Text>{totalQuantity}</Text>;
      },
    },
    {
      title: t("products.fields.status"),
      key: "status",
      dataIndex: "status",
      align: "center",
      render: (_, { status }) => <ProductStatus status={status} />,
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
            resource: "products",
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
                  {t("products.filters.title")}
                </Text>
                <Form.Item name="q" noStyle>
                  <Input
                    style={{
                      width: "400px",
                    }}
                    placeholder={t("products.filters.search.placeholder")}
                    suffix={<SearchOutlined />}
                  />
                </Form.Item>
                <Form.Item
                  noStyle
                  label={t("products.fields.status")}
                  name="status"
                >
                  <Select
                    placeholder={t("products.filters.status.placeholder")}
                    style={{
                      width: "200px",
                    }}
                    options={getProductStatusOptions(t)}
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
            onRow={(record) => {
              return {
                onDoubleClick: () => {
                  show("products", record.id);
                },
              };
            }}
          />
        </Col>
      </Row>
      <EditProduct
        onFinish={editOnFinish}
        id={editId}
        modalProps={editModalProps}
        formProps={editFormProps}
      />
    </List>
  );
};
