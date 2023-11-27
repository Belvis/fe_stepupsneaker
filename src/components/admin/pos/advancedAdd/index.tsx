import {
  PlusOutlined,
  SearchOutlined,
  SelectOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { NumberField, useModal, useSelect, useTable } from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  getDefaultFilter,
  useCreateMany,
  useTranslate,
} from "@refinedev/core";
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Grid,
  Input,
  InputNumber,
  Modal,
  ModalProps,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import {
  getProductStatusOptions,
  tablePaginationSettings,
} from "../../../../constants";
import {
  IBrand,
  IColor,
  IMaterial,
  IOrderDetailConvertedPayload,
  IProductDetail,
  IProductDetailFilterVariables,
  ISize,
  ISole,
  IStyle,
  ITradeMark,
} from "../../../../interfaces";
import { SelectedItemsModal } from "./itemsModal";

const { Text, Title } = Typography;

type AdvancedAddModalProps = {
  modalProps: ModalProps;
  close: () => void;
  callBack: any;
  orderId: string;
};

export const AdvancedAddModal: React.FC<AdvancedAddModalProps> = ({
  modalProps,
  close,
  callBack,
  orderId,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { mutate } = useCreateMany();
  const [messageApi, contextHolder] = message.useMessage();

  const { tableProps, searchFormProps, filters, current, pageSize } = useTable<
    IProductDetail,
    HttpError,
    IProductDetailFilterVariables
  >({
    resource: `product-details`,
    syncWithLocation: false,
    pagination: {
      pageSize: 5,
    },
    sorters: {
      initial: [
        {
          field: "id",
          order: "desc",
        },
      ],
    },
    onSearch: ({
      q,
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
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

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
    searchFormProps.form?.resetFields();
    searchFormProps.form?.submit();
  };

  const [showAddAndGoButton, setShowAddAndGoButton] = useState(false);
  const {
    show: showItem,
    close: closeItem,
    modalProps: itemModalProps,
  } = useModal();

  const [selectedProductDetails, setSelectedProductDetails] = useState<
    IProductDetail[]
  >([]);

  useEffect(() => {
    setSelectedProductDetails([]);
  }, [modalProps.open]);

  const addProductDetails = (
    productDetails: IProductDetail | IProductDetail[]
  ) => {
    setSelectedProductDetails((prevSelectedProductDetails) => {
      const updatedDetails = Array.isArray(productDetails)
        ? productDetails.map((detail) => ({ ...detail, quantity: 1 }))
        : [{ ...productDetails, quantity: 1 }];

      const existingIndex = prevSelectedProductDetails.findIndex(
        (existingDetail) => existingDetail.id === updatedDetails[0].id
      );

      if (existingIndex !== -1) {
        const newDetails = [...prevSelectedProductDetails];
        newDetails[existingIndex].quantity += 1;
        return newDetails;
      }

      return [...prevSelectedProductDetails, ...updatedDetails];
    });
  };

  const handleAddProductDetail: React.MouseEventHandler<HTMLElement> = () => {
    addProductDetails(selectedRows);
    setShowAddAndGoButton(false);
    showItem();
    setSelectedRows([]);
    setSelectedRowKeys([]);
  };

  const [selectedRows, setSelectedRows] = useState<IProductDetail[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: IProductDetail[]
  ) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(selectedRows);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRows.length > 0;

  const handleSubmit = async () => {
    const payLoad = orderDetailToPayload(selectedProductDetails, orderId);

    try {
      mutate(
        {
          resource: "order-details",
          values: payLoad,
          successNotification: () => {
            return false;
          },
          errorNotification: () => {
            return false;
          },
        },
        {
          onError: (error, variables, context) => {
            messageApi.open({
              type: "error",
              content: t("orders.notification.product.add.error"),
            });
          },
          onSuccess: () => {
            messageApi.open({
              type: "success",
              content: t("orders.notification.product.add.success"),
            });
            callBack();
            close();
          },
        }
      );
    } catch (error) {
      console.error("Creation failed", error);
    }
  };

  const columns: ColumnsType<IProductDetail> = [
    {
      title: "#",
      key: "index",
      width: "1px",
      align: "center",
      render: (text, record, index) => {
        const pageIndex = (current ?? 1) - 1;
        const calculatedIndex = pageIndex * pageSize + (index ?? 0) + 1;
        return calculatedIndex;
      },
    },
    {
      title: t("productDetails.fields.name"),
      dataIndex: "name",
      key: "name",
      render: (_, { product, size, color, image }) => (
        <Row style={{ display: "flex", alignItems: "center" }}>
          <Col span={4}>
            <Avatar shape="square" size={74} src={image} />
          </Col>
          <Col span={20}>
            <Text style={{ wordBreak: "inherit" }}>
              {product.name} [{size.name} - {color.name}]
            </Text>
          </Col>
        </Row>
      ),
    },
    {
      title: t("productDetails.fields.quantity"),
      key: "quantity",
      dataIndex: "quantity",
      align: "center",
    },
    {
      title: t("productDetails.fields.price"),
      key: "price",
      dataIndex: "price",
      align: "center",
      render: (_, record) => (
        <NumberField
          options={{
            currency: "VND",
            style: "currency",
          }}
          value={record.price}
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
  ];

  return (
    <Modal
      title="Thêm sản phẩm nâng cao"
      {...modalProps}
      width={breakpoint.sm ? "1300px" : "100%"}
      zIndex={1001}
      onOk={handleSubmit}
    >
      {contextHolder}
      <Row gutter={[10, 10]}>
        <Col span={24}>
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
              <Row gutter={[16, 24]} align="middle" justify="center">
                <Col span={3}>
                  <Text style={{ fontSize: "18px" }} strong>
                    {t("productDetails.filters.title")}
                  </Text>
                </Col>
                <Col span={18}>
                  <Row gutter={[16, 24]}>
                    <Col span={24}>
                      <Space>
                        <Text>{t("productDetails.filters.search.title")}</Text>
                        <Form.Item name="q" noStyle>
                          <Input
                            style={{
                              width: "400px",
                            }}
                            placeholder={t(
                              "productDetails.filters.search.placeholder"
                            )}
                            suffix={<SearchOutlined />}
                          />
                        </Form.Item>
                      </Space>
                    </Col>
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
        </Col>
        <Col span={24}>
          <Card
            title={
              <Space>
                <span>{t("productDetails.list")}</span>
                {hasSelected && (
                  <span>
                    |{" "}
                    {t("table.selection", {
                      count: setSelectedRows.length,
                    })}
                  </span>
                )}
              </Space>
            }
            style={{ marginTop: "0.5rem" }}
            extra={
              <Space>
                <Button
                  icon={<SelectOutlined />}
                  onClick={() => {
                    setShowAddAndGoButton(true);
                    showItem();
                  }}
                >
                  {t("buttons.checkSelected")}
                </Button>
                <Button
                  disabled={!hasSelected}
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddProductDetail}
                >
                  {t("actions.add")}
                </Button>
              </Space>
            }
          >
            <Table
              rowSelection={rowSelection}
              {...tableProps}
              pagination={{
                ...tableProps.pagination,
                ...tablePaginationSettings,
              }}
              rowKey="id"
              columns={columns}
            />
          </Card>
        </Col>
      </Row>
      <SelectedItemsModal
        modalProps={itemModalProps}
        submit={handleSubmit}
        close={closeItem}
        callBack={setSelectedProductDetails}
        items={selectedProductDetails}
        showAddAndGoButton={showAddAndGoButton}
      />
    </Modal>
  );
};

const renderColor = (value: string, label: string) => ({
  value: value,
  label: <Tag style={{ width: "100%" }} color={`#${label}`}>{`#${label}`}</Tag>,
});

const orderDetailToPayload = (
  productDetails: IProductDetail[],
  orderId: string
): IOrderDetailConvertedPayload[] => {
  return productDetails.map((detail) => ({
    order: orderId,
    productDetail: detail.id,
    quantity: detail.quantity,
    price: detail.price,
    totalPrice: detail.price * detail.quantity,
    status: "COMPLETED",
  }));
};
