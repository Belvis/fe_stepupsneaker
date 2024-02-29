import {
  CaretDownOutlined,
  CaretUpOutlined,
  DeleteOutlined,
  GiftOutlined,
  InfoCircleOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useModal } from "@refinedev/antd";
import {
  Authenticated,
  useCustom,
  useCustomMutation,
  useGetIdentity,
  useUpdate,
} from "@refinedev/core";
import {
  Avatar,
  Badge,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";
import { ColumnsType } from "antd/es/table";
import _, { debounce, isNumber } from "lodash";
import React, { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { FREE_SHIPPING_THRESHOLD } from "../../../constants";
import {
  ICustomer,
  IDistrict,
  IOrder,
  IOrderDetail,
  IProvince,
  IVoucherList,
  IWard,
} from "../../../interfaces";
import { orderToPayload, showWarningConfirmDialog } from "../../../utils";
import VoucherModal from "../pos/discountModal/VoucherModal";
import { AddressModal } from "../address/modal/list";

const { Text } = Typography;

const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const GHN_SHOP_ID = import.meta.env.VITE_GHN_SHOP_ID;
const GHN_TOKEN = import.meta.env.VITE_GHN_USER_TOKEN;

interface MyOrderModalProps {
  restModalProps: {
    open?: boolean | undefined;
    confirmLoading?: boolean | undefined;
    title?: ReactNode;
    closable?: boolean | undefined;
  };
  order: IOrder;
  callBack: any;
  close: () => void;
  showCancel: () => void;
}

const { Title } = Typography;

const MyOrderModal: React.FC<MyOrderModalProps> = ({
  restModalProps,
  order,
  callBack,
  close,
  showCancel,
}) => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();

  const { mutate: update, isLoading: isLoadingUpdate } = useUpdate();

  const [form] = Form.useForm<{
    districtId: number;
    districtName: string;
    wardCode: string;
    wardName: string;
    provinceId: number;
    provinceName: string;
    line: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    orderNote: string;
  }>();

  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [wards, setWards] = useState<IWard[]>([]);
  const provinceId = Form.useWatch("provinceId", form);
  const districtId = Form.useWatch("districtId", form);
  const wardCode = Form.useWatch("wardCode", form);
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");

  const [viewOrder, setViewOrder] = useState<IOrder>(order);

  const [shippingMoney, setShippingMoney] = useState<number>(0);

  const [legitVouchers, setLegitVouchers] = useState<IVoucherList[]>([]);

  // Reset on open

  useEffect(() => {
    if (order && restModalProps.open) {
      setViewOrder(_.cloneDeep(order));
      form.setFieldsValue({
        districtId: Number(order.address?.districtId),
        districtName: order.address?.districtName,
        wardCode: order.address?.wardCode,
        wardName: order.address?.wardName,
        provinceId: Number(order.address?.provinceId),
        provinceName: order.address?.provinceName,
        line: order.address?.more,
        fullName: order.fullName,
        phoneNumber: order.phoneNumber,
        email: order.customer?.email,
        orderNote: order.note,
      });
    }
  }, [order, restModalProps]);

  // Update money

  useEffect(() => {
    if (viewOrder.voucher) {
      if (viewOrder.voucher !== order.voucher) {
        const newReduceMoney =
          viewOrder.voucher.type === "PERCENTAGE"
            ? (viewOrder.voucher.value * viewOrder.originMoney) / 100
            : viewOrder.voucher.value;
        const newTotalMoney =
          viewOrder.originMoney + viewOrder.shippingMoney - newReduceMoney;
        setViewOrder((prev) => ({
          ...prev,
          reduceMoney: newReduceMoney,
          totalMoney: newTotalMoney,
        }));
      }
    } else {
      const newReduceMoney = 0;
      const newTotalMoney =
        viewOrder.originMoney + viewOrder.shippingMoney - newReduceMoney;

      setViewOrder((prev) => ({
        ...prev,
        reduceMoney: newReduceMoney,
        totalMoney: newTotalMoney,
      }));
    }
  }, [viewOrder.voucher]);
  // Convert vouchers list

  useEffect(() => {
    if (
      order.customer &&
      order.customer.customerVoucherList &&
      viewOrder.originMoney
    ) {
      const convertedLegitVoucher = _.cloneDeep(
        order.customer.customerVoucherList
      );
      convertedLegitVoucher.map((single) => {
        const updatedVoucher = { ...single };
        if (single.voucher.type === "PERCENTAGE") {
          updatedVoucher.voucher.value =
            (single.voucher.value * viewOrder.originMoney) / 100;
        }
        return updatedVoucher;
      });

      convertedLegitVoucher.sort((a, b) => b.voucher.value - a.voucher.value);
      setLegitVouchers(convertedLegitVoucher);
    }
  }, [order.customer, viewOrder.originMoney]);

  const { mutate: calculateFeeMutate, isLoading: isLoadingFee } =
    useCustomMutation<any>();

  const { isLoading: isLoadingProvince, refetch: refetchProvince } = useCustom<
    IProvince[]
  >({
    url: `${GHN_API_BASE_URL}/master-data/province`,
    method: "get",
    config: {
      headers: {
        token: GHN_TOKEN,
      },
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data: any) => {
        setProvinces(data.response.data);
      },
    },
  });

  const { isLoading: isLoadingDistrict, refetch: refetchDistrict } = useCustom<
    IDistrict[]
  >({
    url: `${GHN_API_BASE_URL}/master-data/district`,
    method: "get",
    config: {
      headers: {
        token: GHN_TOKEN,
      },
      query: {
        province_id: provinceId,
      },
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data: any) => {
        setDistricts(data.response.data);
      },
    },
  });

  const { isLoading: isLoadingWard, refetch: refetchWard } = useCustom<IWard[]>(
    {
      url: `${GHN_API_BASE_URL}/master-data/ward`,
      method: "get",
      config: {
        headers: {
          token: GHN_TOKEN,
        },
        query: {
          district_id: districtId,
        },
      },
      queryOptions: {
        enabled: false,
        onSuccess: (data: any) => {
          setWards(data.response.data);
        },
      },
    }
  );

  useEffect(() => {
    setProvinces([]);
    refetchProvince();
  }, []);

  useEffect(() => {
    if (provinceId) {
      setDistricts([]);
      refetchDistrict();
    }
  }, [provinceId]);

  useEffect(() => {
    if (districtId) {
      setWards([]);
      refetchWard();
    }
  }, [districtId]);

  useEffect(() => {
    if (provinceId && districtId && wardCode) {
      calculateFeeMutate(
        {
          url: `${GHN_API_BASE_URL}/v2/shipping-order/fee`,
          method: "post",
          values: {
            from_district_id: 1542,
            service_id: 53321,
            to_district_id: Number(districtId),
            to_ward_code: wardCode,
            height: 15,
            length: 15,
            weight: 500,
            width: 15,
            insurance_value: 500000,
          },
          config: {
            headers: {
              "Content-Type": "application/json",
              Token: GHN_TOKEN,
              ShopId: GHN_SHOP_ID,
            },
          },
          successNotification: false,
          errorNotification: (data, values) => {
            return {
              message: `Đã xảy ra lỗi`,
              description: "Lỗi tính tiền ship",
              type: "error",
            };
          },
        },
        {
          onError: (error, variables, context) => {
            console.log("An error occurred! ", +error);
          },
          onSuccess: (data: any, variables, context) => {
            setShippingMoney(data?.response.data.total as number);
          },
        }
      );
    }
  }, [provinceId, districtId, wardCode]);

  const handleProvinceChange = (value: number, option: any) => {
    setProvinceName(option.label);
  };

  const handleDistrictChange = (value: number, option: any) => {
    setDistrictName(option.label);
  };

  const handleWardChange = (value: string, option: any) => {
    setWardName(option.label);
  };

  const handleUpdateOrder = () => {
    const simplifiedCartItems: { id: string; quantity: number }[] =
      viewOrder.orderDetails.map((item) => {
        return { id: item.id, quantity: item.quantity };
      });
    const orderPayload = orderToPayload(order);

    const submitData = {
      ...orderPayload,
      fullName: form.getFieldValue("fullName"),
      email: form.getFieldValue("email"),
      phoneNumber: form.getFieldValue("phoneNumber"),
      note: form.getFieldValue("orderNote"),
      addressShipping: {
        phoneNumber: form.getFieldValue("phoneNumber"),
        districtId: form.getFieldValue("districtId"),
        districtName: districtName,
        provinceId: form.getFieldValue("provinceId"),
        provinceName: provinceName,
        wardCode: form.getFieldValue("wardCode"),
        wardName: wardName,
        more: form.getFieldValue("line"),
      },
      cartItems: simplifiedCartItems,
      voucher: viewOrder.voucher !== null ? viewOrder.voucher?.id : null,
    };

    update(
      {
        resource: `orders`,
        values: submitData,
        id: viewOrder.id,
      },
      {
        onError: (error, variables, context) => {},
        onSuccess: (data, variables, context) => {
          callBack();
          close();
        },
      }
    );
  };
  const handleOk = () => {
    showWarningConfirmDialog({
      options: {
        accept: () => handleUpdateOrder(),
        reject: () => {},
      },
      t: t,
    });
  };

  const showBadgeShipping = viewOrder.originMoney < FREE_SHIPPING_THRESHOLD;
  const showCaretUpShipping = viewOrder.shippingMoney > order.shippingMoney;
  const showCaretDownShipping = viewOrder.shippingMoney < order.shippingMoney;

  const showBadgeGrandTotal = viewOrder.totalMoney !== order.totalMoney;
  const showCaretUpGrandTotal = viewOrder.totalMoney > order.totalMoney;
  const showCaretDownGrandTotal = viewOrder.totalMoney < order.totalMoney;

  const showBadgeCartTotal = viewOrder.originMoney !== order.originMoney;
  const showCaretUpCartTotal = viewOrder.originMoney > order.originMoney;
  const showCaretDownCartTotal = viewOrder.originMoney < order.originMoney;

  const shippingBadgeCount =
    showBadgeShipping && showCaretUpShipping ? (
      <CaretUpOutlined style={{ color: "red" }} />
    ) : showBadgeShipping && showCaretDownShipping ? (
      <CaretDownOutlined style={{ color: "green" }} />
    ) : (
      0
    );

  const grandTotalBadgeCount =
    showBadgeGrandTotal && showCaretUpGrandTotal ? (
      <CaretUpOutlined style={{ color: "red" }} />
    ) : showBadgeGrandTotal && showCaretDownGrandTotal ? (
      <CaretDownOutlined style={{ color: "green" }} />
    ) : (
      0
    );

  const cartTotalBadgeCount =
    showBadgeCartTotal && showCaretUpCartTotal ? (
      <CaretUpOutlined style={{ color: "red" }} />
    ) : showBadgeCartTotal && showCaretDownCartTotal ? (
      <CaretDownOutlined style={{ color: "green" }} />
    ) : (
      0
    );

  const {
    show,
    close: voucherClose,
    modalProps: { visible, ...restVoucherModalProps },
  } = useModal();

  const {
    show: showAddress,
    close: closeAddress,
    modalProps: { visible: addressVisible, ...restAddressModalProps },
  } = useModal();

  const setAddresses = (order: IOrder) => {
    form.setFieldsValue({
      districtId: Number(order.address?.districtId),
      districtName: order.address?.districtName,
      wardCode: order.address?.wardCode,
      wardName: order.address?.wardName,
      provinceId: Number(order.address?.provinceId),
      provinceName: order.address?.provinceName,
      line: order.address?.more,
      phoneNumber: order.phoneNumber,
    });
  };

  const handleQuantityChange = (value: number | null, record: IOrderDetail) => {
    if (isNumber(value) && value > 0) {
      if (value > record.productDetail.quantity) {
        return messageApi.open({
          type: "info",
          content: "Rất tiếc, đã đạt giới hạn số lượng sản phẩm",
        });
      }

      if (value > 5) {
        return messageApi.open({
          type: "info",
          content: "Bạn chỉ có thể mua tối đa 5 sản phẩm",
        });
      }

      if (value !== record.quantity) {
        setViewOrder((prev) => {
          const newQuantity = value;
          const newTotalPrice = record.price * newQuantity;
          const newOriginMoney =
            newTotalPrice + (viewOrder.originMoney - record.totalPrice);
          const currentVoucherThreshold = viewOrder.voucher?.constraint ?? 0;

          const newShippingMoney =
            newOriginMoney < FREE_SHIPPING_THRESHOLD
              ? shippingMoney === 0
                ? viewOrder.shippingMoney
                : shippingMoney
              : 0;
          const newTotalMoney =
            newOriginMoney + newShippingMoney - prev.reduceMoney;

          if (newOriginMoney < currentVoucherThreshold) {
            showWarningConfirmDialog({
              options: {
                header: "Bạn có chắc?",
                message:
                  "Tổng tiền của đơn hàng đang được giảm xuống dưới ngưỡng giảm giá hiện tại, tương đương với việc gỡ giảm giá khỏi đơn.",
                accept: () => {
                  setViewOrder({
                    ...prev,
                    orderDetails: prev.orderDetails.map((detail) =>
                      detail.id === record.id
                        ? {
                            ...detail,
                            quantity: newQuantity,
                            totalPrice: newTotalPrice,
                          }
                        : detail
                    ),
                    voucher: undefined,
                    originMoney: newOriginMoney,
                    shippingMoney: newShippingMoney,
                    totalMoney: newTotalMoney,
                  });
                },
                reject: () => {
                  return prev;
                },
              },
              t: t,
            });
            return prev;
          } else {
            return {
              ...prev,
              orderDetails: prev.orderDetails.map((detail) =>
                detail.id === record.id
                  ? {
                      ...detail,
                      quantity: newQuantity,
                      totalPrice: newTotalPrice,
                    }
                  : detail
              ),
              originMoney: newOriginMoney,
              shippingMoney: newShippingMoney,
              totalMoney: newTotalMoney,
            };
          }
        });
      }
    }
  };

  const handleRemoveItem = (record: IOrderDetail) => {
    const cartCount = viewOrder.orderDetails.length;
    const newOriginMoney = viewOrder.orderDetails.reduce(
      (accumulator, detail) => accumulator + detail.totalPrice,
      0
    );
    const newShippingMoney =
      newOriginMoney < FREE_SHIPPING_THRESHOLD
        ? shippingMoney === 0
          ? viewOrder.shippingMoney
          : shippingMoney
        : 0;

    if (cartCount == 1) {
      showWarningConfirmDialog({
        options: {
          message:
            "Loại bỏ sản phẩm duy nhất tương đương với việc huỷ đơn hàng",
          accept: () => {
            close();
            showCancel();
          },
          reject: () => {},
        },
        t: t,
      });
    } else {
      showWarningConfirmDialog({
        options: {
          accept: () => {
            setViewOrder((prev) => ({
              ...prev,
              orderDetails: prev.orderDetails.filter(
                (detail) => detail.id !== record.id
              ),
              originMoney: newOriginMoney,
              shippingMoney: newShippingMoney,
              totalMoney: newOriginMoney + newShippingMoney - prev.reduceMoney,
            }));
          },
          reject: () => {},
        },
        t: t,
      });
    }
  };

  const columns: ColumnsType<IOrderDetail> = [
    {
      title: "Ảnh",
      key: "image",
      dataIndex: ["productDetail", "image"],
      align: "center",
      render: (value) => (
        <Avatar
          size={{
            xs: 60,
            lg: 108,
            xl: 132,
            xxl: 144,
          }}
          shape="square"
          src={value ?? "default_image_url"}
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      key: "name",
      dataIndex: ["productDetail", "product", "name"],
      align: "start",
      render(_, record) {
        return (
          <div>
            <Link
              to={"/product/" + record.productDetail.product.id}
              style={{
                color: "black",
                fontWeight: "500",
              }}
            >
              {record.productDetail.product.name}
            </Link>
            <div className="cart-item-variation">
              <span>Màu sắc: {record.productDetail.color.name}</span>
              <br />
              <span>Kích cỡ: {record.productDetail.size.name}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Đơn giá",
      key: "unitPrice",
      dataIndex: "price",
      align: "center",
      render(value) {
        return (
          <>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              currencyDisplay: "symbol",
            }).format(value)}
          </>
        );
      },
    },
    {
      title: "Số lượng",
      key: "quantity",
      dataIndex: "quantity",
      align: "center",
      render(value, record) {
        return (
          <InputNumber
            value={Number(value)}
            onChange={debounce(
              (value) => handleQuantityChange(value as number, record),
              300
            )}
          />
        );
      },
    },
    {
      title: "Thành tiền",
      key: "totalPrice",
      dataIndex: "totalPrice",
      align: "center",
      width: "200px",
      render(value) {
        return (
          <>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              currencyDisplay: "symbol",
            }).format(value)}
          </>
        );
      },
    },
    {
      title: "Hành động",
      key: "quantity",
      dataIndex: "quantity",
      align: "center",
      width: "10%",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t("actions.delete")}>
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveItem(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const Footer = (
    <Row justify="end" style={{ marginRight: "1rem" }}>
      <Col span={12} style={{ textAlign: "end" }}>
        <Row>
          <Col span={16}>
            <Badge count={cartTotalBadgeCount}>
              <h4>THÀNH TIỀN</h4>
            </Badge>
          </Col>
          <Col span={8}>
            <h4 style={{ fontWeight: "normal" }}>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                currencyDisplay: "symbol",
              }).format(viewOrder.originMoney)}
            </h4>
          </Col>
        </Row>
        <Row>
          <Col span={16}>
            <Badge count={shippingBadgeCount}>
              <h4>PHÍ SHIP</h4>
            </Badge>
          </Col>
          <Col span={8}>
            {showBadgeShipping ? (
              <h4 style={{ fontWeight: "normal" }}>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  currencyDisplay: "symbol",
                }).format(viewOrder.shippingMoney)}
              </h4>
            ) : (
              <h4
                className="free-shipping"
                style={{
                  color: "#fb5231",
                  textTransform: "uppercase",
                }}
              >
                Miễn phí vận chuyển
              </h4>
            )}
          </Col>
        </Row>
        <Row>
          <Col span={16}>
            <h4>
              {viewOrder.voucher ? (
                <Tooltip title="Gỡ voucher">
                  <MinusCircleOutlined
                    className="remove-voucher"
                    onClick={() => {
                      showWarningConfirmDialog({
                        options: {
                          accept: () => {
                            setViewOrder((prev) => {
                              const { voucher, ...rest } = prev;
                              return rest;
                            });
                          },
                          reject: () => {},
                        },
                        t: t,
                      });
                    }}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Thêm voucher">
                  <PlusCircleOutlined className="add-voucher" onClick={show} />
                </Tooltip>
              )}{" "}
              GIẢM GIÁ
            </h4>
          </Col>
          <Col span={8}>
            <h4 style={{ fontWeight: "normal" }}>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                currencyDisplay: "symbol",
              }).format(viewOrder.reduceMoney)}
            </h4>
          </Col>
        </Row>
        <Row align="middle">
          <Col span={16}>
            <Badge count={grandTotalBadgeCount}>
              <h3 className="grand-total-title">TỔNG CỘNG</h3>
            </Badge>
          </Col>
          <Col span={8}>
            <h3 style={{ margin: 0 }}>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                currencyDisplay: "symbol",
              }).format(viewOrder.totalMoney)}
            </h3>
          </Col>
        </Row>
        <Row justify="end" style={{ marginTop: "0.5rem" }}>
          {(() => {
            const freeShippingDifference =
              viewOrder.originMoney < FREE_SHIPPING_THRESHOLD
                ? FREE_SHIPPING_THRESHOLD - viewOrder.originMoney
                : Infinity;

            const voucherDifference =
              legitVouchers && legitVouchers.length > 0
                ? viewOrder.originMoney < legitVouchers[0].voucher.constraint
                  ? legitVouchers[0].voucher.constraint - viewOrder.originMoney
                  : Infinity
                : Infinity;

            const shouldDisplayFreeShipping =
              freeShippingDifference > 0 &&
              freeShippingDifference !== Infinity &&
              freeShippingDifference <= voucherDifference;
            const shouldDisplayVoucher =
              voucherDifference > 0 &&
              voucherDifference !== Infinity &&
              voucherDifference < freeShippingDifference;

            if (shouldDisplayFreeShipping) {
              return (
                <DiscountMessage>
                  <GiftOutlined /> Mua thêm{" "}
                  <DiscountMoney>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      currencyDisplay: "symbol",
                    }).format(freeShippingDifference)}
                  </DiscountMoney>{" "}
                  để được miễn phí vận chuyển
                </DiscountMessage>
              );
            } else if (shouldDisplayVoucher) {
              return (
                <DiscountMessage>
                  <GiftOutlined /> Mua thêm{" "}
                  <DiscountMoney>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      currencyDisplay: "symbol",
                    }).format(voucherDifference)}
                  </DiscountMoney>{" "}
                  để được giảm tới{" "}
                  <DiscountMoney>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      currencyDisplay: "symbol",
                    }).format(legitVouchers[0].voucher.value)}
                  </DiscountMoney>
                </DiscountMessage>
              );
            } else {
              return null;
            }
          })()}
        </Row>
      </Col>
    </Row>
  );

  return (
    <Modal
      title={
        <Space align="baseline">
          <Title level={5}>Đơn hàng của bạn</Title>
          <Tooltip title="Bạn chỉ có thể 1 số thông tin cơ bản của đơn hàng, mọi trường hợp xin vui lòng liên hệ với chúng tôi hoặc tạo đơn mới.">
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
      {...restModalProps}
      open={restModalProps.open}
      width="1200px"
      centered
      okText="Xác nhận thay đổi"
      onOk={handleOk}
    >
      {contextHolder}
      <div className="row">
        <div className="col-12">
          <div className="table-content table-responsive cart-table-content">
            <Table
              pagination={false}
              rowKey="id"
              columns={columns}
              dataSource={viewOrder.orderDetails}
              footer={() => Footer}
            />
          </div>
        </div>
        <div className="col-12 mt-2">
          <Title level={5}>Thông tin đơn hàng</Title>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              districtId: Number(viewOrder.address?.districtId),
              districtName: viewOrder.address?.districtName,
              wardCode: viewOrder.address?.wardCode,
              wardName: viewOrder.address?.wardName,
              provinceId: Number(viewOrder.address?.provinceId),
              provinceName: viewOrder.address?.provinceName,
              line: viewOrder.address?.more,
              fullName: viewOrder.fullName,
              phoneNumber: viewOrder.phoneNumber,
              email: viewOrder.customer?.email,
              orderNote: viewOrder.note,
            }}
          >
            <Form.Item label="Mã hoá đơn">
              <Input value={viewOrder.code} disabled />
            </Form.Item>
            <Form.Item label="Tên đầy đủ" name="fullName">
              <Input />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input />
            </Form.Item>
            <Form.Item label="Số điện thoại" name="phoneNumber">
              <Input />
            </Form.Item>
            <Form.Item
              label={
                <Space size="large">
                  <Text>{"Tỉnh/Thành phố"}</Text>
                  <Authenticated fallback={false}>
                    <Button type="default" onClick={showAddress}>
                      Hoặc chọn địa chỉ của bạn tại đây
                    </Button>
                  </Authenticated>
                </Space>
              }
              name="provinceId"
              rules={[
                {
                  required: true,
                  message: "Hãy chọn tỉnh/thành phố trước!",
                },
              ]}
            >
              <Select
                className="email s-email s-wid"
                showSearch
                placeholder={"Chọn tỉnh/thành phố"}
                loading={isLoadingProvince}
                onChange={handleProvinceChange}
                filterOption={filterOption}
                options={provinces.map((province) => ({
                  label: province.ProvinceName,
                  value: province.ProvinceID,
                }))}
              />
            </Form.Item>
            <Form.Item
              label={"Quận/huyện"}
              name="districtId"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn quận/huyện!",
                },
              ]}
            >
              <Select
                className="email s-email s-wid"
                showSearch
                placeholder={"Chọn quận/huyện"}
                loading={isLoadingDistrict}
                onChange={handleDistrictChange}
                filterOption={filterOption}
                options={districts.map((district) => ({
                  label: district.DistrictName,
                  value: district.DistrictID,
                }))}
              />
            </Form.Item>
            <Form.Item
              label={"Phường/xã"}
              name="wardCode"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn phường/xã!",
                },
              ]}
            >
              <Select
                className="email s-email s-wid"
                showSearch
                placeholder={"Chọn phường/xã phố"}
                loading={isLoadingWard}
                onChange={handleWardChange}
                filterOption={filterOption}
                options={wards.map((ward) => ({
                  label: ward.WardName,
                  value: ward.WardCode,
                }))}
              />
            </Form.Item>
            <Form.Item
              label="Chi tiết địa chỉ"
              name="line"
              rules={[
                {
                  whitespace: true,
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Ghi chú hoá đơn" name="orderNote">
              <Input />
            </Form.Item>
          </Form>
        </div>
      </div>
      <Authenticated fallback={false}>
        <VoucherModal
          restModalProps={restVoucherModalProps}
          vouchers={order.customer?.customerVoucherList || []}
          type="apply"
          setViewOrder={setViewOrder}
          close={voucherClose}
        />
        <AddressModal
          customer={order.customer}
          setAddresses={setAddresses}
          open={restAddressModalProps.open ?? false}
          handleOk={closeAddress}
          handleCancel={closeAddress}
          order={order}
        />
      </Authenticated>
    </Modal>
  );
};

export default MyOrderModal;

const filterOption = (
  input: string,
  option?: { label: string; value: number | string }
) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

const DiscountMessage = styled.h4`
  color: #fb5231;
  line-height: 1.3rem;
  font-weight: normal;
`;

const DiscountMoney = styled.span`
  color: #fb5231;
  font-weight: bold;
`;
