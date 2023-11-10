import {
  useTranslate,
  IResourceComponentsProps,
  HttpError,
  CrudFilters,
  useParsed,
  getDefaultFilter,
  useCustomMutation,
  useApiUrl,
} from "@refinedev/core";
import { EditButton, Show, useSelect, useTable } from "@refinedev/antd";
import { UndoOutlined, CheckSquareOutlined } from "@ant-design/icons";
import {
  Table,
  Card,
  Button,
  Space,
  Row,
  Col,
  Grid,
  Typography,
  Avatar,
  Form,
  Select,
  InputNumber,
  Tag,
  Tooltip,
} from "antd";

import {
  IBrand,
  IColor,
  IProductDetailConvertedPayload,
  IMaterial,
  IProductDetail,
  IProductDetailFilterVariables,
  ISize,
  ISole,
  IStyle,
  ITradeMark,
} from "../../../interfaces";
import { debounce } from "lodash";
import { ColumnsType } from "antd/es/table";
import { ProductStatus } from "../../../components";
import { confirmDialog } from "primereact/confirmdialog";
import { useEffect, useState } from "react";
import { table } from "console";
import {
  getProductStatusOptions,
  tablePaginationSettings,
} from "../../../constants";
import { showWarningConfirmDialog } from "../../../utils";
const { Text } = Typography;

const renderColor = (value: string, label: string) => ({
  value: value,
  label: <Tag style={{ width: "100%" }} color={`#${label}`}>{`#${label}`}</Tag>,
});

export const ProductShow: React.FC<IResourceComponentsProps> = () => {
  const { id } = useParsed();
  const API_URL = useApiUrl();

  const { mutate: mutateUpdateMany } = useCustomMutation<IProductDetail>();

  const [productDetails, setProductDetails] = useState<IProductDetail[]>([]);
  const [productDetailsSave, setProductDetailsSave] = useState<
    IProductDetail[]
  >([]);

  const { tableProps, searchFormProps, filters, current, pageSize } = useTable<
    IProductDetail,
    HttpError,
    IProductDetailFilterVariables
  >({
    resource: `product-details`,
    filters: {
      initial: [
        {
          field: "product",
          operator: "eq",
          value: id,
        },
      ],
    },
    pagination: {
      pageSize: 5,
    },
    onSearch: ({
      status,
      brand,
      color,
      material,
      priceMax,
      priceMin,
      quantity,
      size,
      sole,
      style,
      tradeMark,
    }) => {
      const productDetailFilters: CrudFilters = [];

      productDetailFilters.push({
        field: "status",
        operator: "eq",
        value: status ? status : undefined,
      });

      productDetailFilters.push({
        field: "brand",
        operator: "eq",
        value: brand ? brand : undefined,
      });
      productDetailFilters.push({
        field: "color",
        operator: "eq",
        value: color ? color : undefined,
      });
      productDetailFilters.push({
        field: "material",
        operator: "eq",
        value: material ? material : undefined,
      });
      productDetailFilters.push({
        field: "size",
        operator: "eq",
        value: size ? size : undefined,
      });
      productDetailFilters.push({
        field: "sole",
        operator: "eq",
        value: sole ? sole : undefined,
      });
      productDetailFilters.push({
        field: "style",
        operator: "eq",
        value: style ? style : undefined,
      });
      productDetailFilters.push({
        field: "tradeMark",
        operator: "eq",
        value: tradeMark ? tradeMark : undefined,
      });
      productDetailFilters.push({
        field: "priceMin",
        operator: "eq",
        value: priceMin ? priceMin : undefined,
      });
      productDetailFilters.push({
        field: "priceMax",
        operator: "eq",
        value: priceMax ? priceMax : undefined,
      });
      productDetailFilters.push({
        field: "quantity",
        operator: "eq",
        value: quantity ? quantity : undefined,
      });

      return productDetailFilters;
    },
  });

  useEffect(() => {
    if (tableProps && tableProps.dataSource) {
      const fetchedProductDetails: IProductDetail[] = [
        ...tableProps.dataSource,
      ];
      setProductDetails(fetchedProductDetails);
      console.log(fetchedProductDetails);
    }
  }, [tableProps.dataSource]);

  const t = useTranslate();

  const { selectProps: brandSelectProps } = useSelect<IBrand>({
    resource: "brands?pageSize=1000&",
    optionLabel: "name",
    optionValue: "id",
    debounce: 500,
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  const { selectProps: styleSelectProps } = useSelect<IStyle>({
    resource: "styles?pageSize=1000&",
    optionLabel: "name",
    optionValue: "id",
    debounce: 500,
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  const { selectProps: materialSelectProps } = useSelect<IMaterial>({
    resource: "materials?pageSize=1000&",
    optionLabel: "name",
    optionValue: "id",
    debounce: 500,
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  const { selectProps: tradeMarkSelectProps } = useSelect<ITradeMark>({
    resource: "trade-marks?pageSize=1000&",
    optionLabel: "name",
    optionValue: "id",
    debounce: 500,
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  const { selectProps: soleSelectProps } = useSelect<ISole>({
    resource: "soles?pageSize=1000&",
    optionLabel: "name",
    optionValue: "id",
    debounce: 500,
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  const { selectProps: colorSelectProps } = useSelect<IColor>({
    resource: "colors?pageSize=1000&",
    optionLabel: "code",
    optionValue: "id",
    pagination: {
      pageSize: 1000,
    },
  });

  const { selectProps: sizeSelectProps } = useSelect<ISize>({
    resource: "sizes?pageSize=1000&",
    optionLabel: "name",
    optionValue: "id",
    pagination: {
      pageSize: 1000,
    },
  });

  const handleClearFilters = () => {
    searchFormProps.form?.setFieldValue("q", "");
    searchFormProps.form?.setFieldValue("status", "");
    searchFormProps.form?.submit();
  };

  const updateProductDetailsSaveQuantity = (
    record: IProductDetail,
    value: number
  ) => {
    const existingIndex = productDetailsSave.findIndex(
      (productDetail) => productDetail.id === record.id
    );
    const updatedDetails = [...productDetailsSave];
    if (existingIndex !== -1) {
      updatedDetails[existingIndex].quantity = value;
    } else {
      updatedDetails.push({ ...record, quantity: value });
    }
    setProductDetailsSave(updatedDetails);
  };

  const updateProductDetailsQuantity = (index: number, value: number) => {
    const updatedProducts = [...productDetails];
    updatedProducts[index] = { ...updatedProducts[index], quantity: value };
    setProductDetails(updatedProducts);
  };

  const handleQuantityChange = (value: number, record: IProductDetail) => {
    const index = productDetails.findIndex(
      (productDetail) => productDetail.id === record.id
    );

    updateProductDetailsSaveQuantity(record, value);

    updateProductDetailsQuantity(index, value);
  };

  const updateProductDetailsSavePrice = (
    record: IProductDetail,
    value: number
  ) => {
    const existingIndex = productDetailsSave.findIndex(
      (productDetail) => productDetail.id === record.id
    );
    const updatedDetails = [...productDetailsSave];
    if (existingIndex !== -1) {
      updatedDetails[existingIndex].price = value;
    } else {
      updatedDetails.push({ ...record, price: value });
    }
    setProductDetailsSave(updatedDetails);
  };

  const updateProductDetailsPrice = (index: number, value: number) => {
    const updatedProducts = [...productDetails];
    updatedProducts[index] = { ...updatedProducts[index], price: value };
    setProductDetails(updatedProducts);
  };

  const handlePriceChange = debounce(
    (value: number, record: IProductDetail) => {
      const index = productDetails.findIndex(
        (productDetail) => productDetail.id === record.id
      );

      updateProductDetailsSavePrice(record, value);

      updateProductDetailsPrice(index, value);
    },
    500
  );

  const columns: ColumnsType<IProductDetail> = [
    {
      title: "#",
      key: "index",
      width: "1rem",
      align: "center",
      render: (text, record, index) => {
        const pageIndex = (current ?? 1) - 1;
        const calculatedIndex = pageIndex * pageSize + (index ?? 0) + 1;
        return calculatedIndex;
      },
    },
    {
      title: t("productDetails.fields.image"),
      dataIndex: "image",
      key: "image",
      render: (_, { image }) => <Avatar shape="square" size={74} src={image} />,
    },
    {
      title: t("productDetails.fields.name"),
      dataIndex: "name",
      key: "name",
      render: (_, { product, size, color }) => (
        <Text style={{ wordBreak: "inherit" }}>
          {product.name} [{size.name} - {color.name}]
        </Text>
      ),
    },
    {
      title: t("productDetails.fields.quantity"),
      key: "quantity",
      dataIndex: "quantity",
      align: "center",
      render: (_, record) => (
        <InputNumber
          width={100}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(value as number, record)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: t("productDetails.fields.price"),
      key: "price",
      dataIndex: "price",
      align: "center",
      render: (_, record) => (
        <InputNumber
          formatter={(value) =>
            `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => {
            const parsedValue = parseInt(value!.replace(/₫\s?|(,*)/g, ""), 10);
            return isNaN(parsedValue) ? 0 : parsedValue;
          }}
          value={record.price}
          onChange={(value) => handlePriceChange(value as number, record)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: t("productDetails.fields.size"),
      key: "size",
      dataIndex: "size",
      align: "center",
      render: (_, record) => (
        <Text style={{ width: "100%" }}>{record.size.name}</Text>
      ),
    },
    {
      title: t("productDetails.fields.color"),
      key: "color",
      dataIndex: "color",
      align: "center",
      render: (_, record) => (
        <Tag
          style={{ width: "100%" }}
          color={`#${record.color.code}`}
        >{`#${record.color.code}`}</Tag>
      ),
    },
    {
      title: t("products.fields.status"),
      key: "status",
      dataIndex: "status",
      width: "10%",
      align: "center",
      render: (_, { status }) => <ProductStatus status={status} />,
    },
    {
      title: t("table.actions"),
      dataIndex: "actions",
      key: "actions",
      width: "5%",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t("actions.edit")}>
            <EditButton
              style={{ color: "#52c41a", borderColor: "#52c41a" }}
              hideText
              size="small"
              onClick={() => {}}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSubmit = async () => {
    const convertedPayload: IProductDetailConvertedPayload[] =
      convertToPayload(productDetailsSave);
    try {
      mutateUpdateMany(
        {
          url: `${API_URL}/product-details`,
          method: "put",
          values: convertedPayload,
          successNotification: () => {
            return {
              message: `Successfully update ${convertedPayload.length} product details.`,
              description: "Success with no errors",
              type: "success",
            };
          },
          errorNotification: () => {
            return {
              message: `Something went wrong when updating product details`,
              description: "Error",
              type: "error",
            };
          },
        },
        {
          onSuccess: (data, variables, context) => {
            setProductDetailsSave([]);
          },
        }
      );
    } catch (error) {
      console.error("Creation failed", error);
    }
  };

  return (
    <Show
      title="Product details"
      canEdit={false}
      contentProps={{
        style: {
          backgroundColor: "transparent",
        },
      }}
    >
      <Card>
        <Form
          {...searchFormProps}
          onValuesChange={debounce(() => {
            searchFormProps.form?.submit();
          }, 500)}
          initialValues={{
            status: getDefaultFilter("status", filters, "eq"),
          }}
        >
          <Row gutter={[16, 24]}>
            <Col span={3}>
              <Text style={{ fontSize: "18px" }} strong>
                {t("productDetails.filters.title")}
              </Text>
            </Col>
            <Col span={18}>
              <Row gutter={[16, 24]}>
                <Col span={24}>
                  <Space wrap style={{ width: "100%" }}>
                    <Form.Item
                      noStyle
                      label={t("productDetails.fields.color")}
                      name="color"
                    >
                      <Select
                        {...colorSelectProps}
                        mode="multiple"
                        allowClear
                        options={colorSelectProps.options?.map((item) =>
                          renderColor(
                            item.value as string,
                            item.label as string
                          )
                        )}
                        placeholder={t(
                          "productDetails.filters.color.placeholder"
                        )}
                        style={{ width: "200px" }}
                      />
                    </Form.Item>
                    <Form.Item
                      noStyle
                      label={t("productDetails.fields.size")}
                      name="size"
                    >
                      <Select
                        {...sizeSelectProps}
                        mode="multiple"
                        allowClear
                        placeholder={t(
                          "productDetails.filters.size.placeholder"
                        )}
                        style={{ width: "200px" }}
                      />
                    </Form.Item>
                    <Form.Item
                      noStyle
                      label={t("productDetails.fields.status")}
                      name="status"
                    >
                      <Select
                        placeholder={t(
                          "productDetails.filters.status.placeholder"
                        )}
                        style={{ width: "200px" }}
                        options={getProductStatusOptions(t)}
                      />
                    </Form.Item>
                    <Form.Item
                      noStyle
                      label={t("productDetails.fields.brand")}
                      name="brand"
                    >
                      <Select
                        {...brandSelectProps}
                        mode="multiple"
                        allowClear
                        placeholder={t(
                          "productDetails.filters.brand.placeholder"
                        )}
                        style={{ width: "200px" }}
                      />
                    </Form.Item>
                    <Form.Item
                      noStyle
                      label={t("productDetails.fields.material")}
                      name="material"
                    >
                      <Select
                        {...materialSelectProps}
                        mode="multiple"
                        allowClear
                        placeholder={t(
                          "productDetails.filters.material.placeholder"
                        )}
                        style={{ width: "200px" }}
                      />
                    </Form.Item>
                    <Form.Item
                      noStyle
                      label={t("productDetails.fields.sole")}
                      name="sole"
                    >
                      <Select
                        {...soleSelectProps}
                        mode="multiple"
                        allowClear
                        placeholder={t(
                          "productDetails.filters.sole.placeholder"
                        )}
                        style={{ width: "200px" }}
                      />
                    </Form.Item>
                    <Form.Item
                      noStyle
                      label={t("productDetails.fields.style")}
                      name="style"
                    >
                      <Select
                        {...styleSelectProps}
                        mode="multiple"
                        allowClear
                        placeholder={t(
                          "productDetails.filters.style.placeholder"
                        )}
                        style={{ width: "200px" }}
                      />
                    </Form.Item>
                    <Form.Item
                      noStyle
                      label={t("productDetails.fields.tradeMark")}
                      name="tradeMark"
                    >
                      <Select
                        {...tradeMarkSelectProps}
                        mode="multiple"
                        allowClear
                        placeholder={t(
                          "productDetails.filters.tradeMark.placeholder"
                        )}
                        style={{ width: "200px" }}
                      />
                    </Form.Item>
                  </Space>
                </Col>
                <Col span={24}>
                  <Space wrap style={{ width: "100%" }}>
                    <Form.Item
                      label={t("productDetails.filters.priceMin.label")}
                      name="priceMin"
                    >
                      <InputNumber
                        formatter={(value) =>
                          `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => {
                          const parsedValue = parseInt(
                            value!.replace(/₫\s?|(,*)/g, ""),
                            10
                          );
                          return isNaN(parsedValue) ? 0 : parsedValue;
                        }}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                    <Form.Item
                      label={t("productDetails.filters.priceMax.label")}
                      name="priceMax"
                    >
                      <InputNumber
                        formatter={(value) =>
                          `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => {
                          const parsedValue = parseInt(
                            value!.replace(/₫\s?|(,*)/g, ""),
                            10
                          );
                          return isNaN(parsedValue) ? 0 : parsedValue;
                        }}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                    <Form.Item
                      label={t("productDetails.filters.quantity.label")}
                      name="quantity"
                    >
                      <InputNumber width={100} style={{ width: "100%" }} />
                    </Form.Item>
                  </Space>
                </Col>
              </Row>
            </Col>
            <Col span={3}>
              <Button
                icon={<UndoOutlined />}
                onClick={() => handleClearFilters()}
              >
                {t("actions.clear")}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card
        extra={
          <Button
            type="primary"
            icon={<CheckSquareOutlined />}
            onClick={() => {
              showWarningConfirmDialog({
                options: {
                  accept: handleSubmit,
                  reject: () => {},
                },
                t: t,
              });
            }}
          >
            {t("actions.submit")}
          </Button>
        }
        title="List"
        style={{ marginTop: "0.5rem" }}
      >
        <Table
          {...tableProps}
          pagination={{
            ...tableProps.pagination,
            ...tablePaginationSettings,
          }}
          dataSource={productDetails}
          rowKey="id"
          columns={columns}
        />
      </Card>
    </Show>
  );
};

function convertToPayload(
  productDetails: IProductDetail[]
): IProductDetailConvertedPayload[] {
  return productDetails.map((detail) => ({
    id: detail.id,
    product: detail.product.id,
    tradeMark: detail.tradeMark.id,
    style: detail.style.id,
    size: detail.size.id,
    material: detail.material.id,
    color: detail.color.id,
    brand: detail.brand.id,
    sole: detail.sole.id,
    image: detail.image,
    price: detail.price,
    quantity: detail.quantity,
    status: detail.status,
  }));
}
