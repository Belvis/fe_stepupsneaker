import { InfoCircleOutlined } from "@ant-design/icons";
import { Descriptions, Modal, Space, Tooltip, Typography } from "antd";
import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  IAddress,
  IOrderDetail,
  OrderStatus,
} from "../../../../pages/interfaces";
import { NumberField } from "@refinedev/antd";

interface ChangeDetailProps {
  restModalProps: {
    open?: boolean | undefined;
    confirmLoading?: boolean | undefined;
    title?: ReactNode;
    closable?: boolean | undefined;
  };
  callBack: any;
  close: () => void;
  changes:
    | {
        [key: string]: {
          oldValue: any;
          newValue: any;
        };
      }
    | undefined;
}

const { Title } = Typography;

const ChangeDetail: React.FC<ChangeDetailProps> = ({
  restModalProps,
  callBack,
  close,
  changes,
}) => {
  const { t } = useTranslation();

  const handleOk = () => {};

  const keys = Object.keys(changes ?? {});

  const renderChange = (key: string) => {
    if (changes) {
      switch (key) {
        case "orderDetails":
          const newOD: IOrderDetail = changes[key].newValue[0];
          const oldOD: IOrderDetail = changes[key].oldValue[0];

          return (
            <Descriptions
              title="Giỏ hàng"
              layout="vertical"
              size="small"
              bordered
            >
              <Descriptions.Item label="Cũ">
                {oldOD ? (
                  <>
                    <div>
                      <strong>Sản phẩm</strong>:{" "}
                      {oldOD.productDetail.product.name}
                    </div>
                    <div>
                      <strong>Số lượng</strong>: {oldOD.quantity}
                    </div>
                    <div>
                      <strong>Đơn giá</strong>: {renderValue(oldOD.price)}
                    </div>
                    <div>
                      <strong>Thành tiền</strong>:{" "}
                      {renderValue(oldOD.totalPrice)}
                    </div>
                  </>
                ) : (
                  <div>N/A</div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Mới">
                {newOD ? (
                  <>
                    <div>
                      <strong>Sản phẩm</strong>:{" "}
                      {newOD.productDetail.product.name}
                    </div>
                    <div>
                      <strong>Số lượng</strong>: {newOD.quantity}
                    </div>
                    <div>
                      <strong>Đơn giá</strong>: {renderValue(newOD.price)}
                    </div>
                    <div>
                      <strong>Thành tiền</strong>:{" "}
                      {renderValue(newOD.totalPrice)}
                    </div>
                  </>
                ) : (
                  <div>N/A</div>
                )}
              </Descriptions.Item>
            </Descriptions>
          );
        case "status":
          const newStatus: OrderStatus = changes[key].newValue;
          const oldStatus: OrderStatus = changes[key].oldValue;

          return (
            <Descriptions
              title="Trạng thái"
              layout="vertical"
              size="small"
              bordered
            >
              <Descriptions.Item label="Cũ">
                {oldStatus ? (
                  <>
                    <div>{t(`enum.orderStatuses.${oldStatus}`)}</div>
                  </>
                ) : (
                  <div>N/A</div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Mới">
                {newStatus ? (
                  <>
                    <div>{t(`enum.orderStatuses.${newStatus}`)}</div>
                  </>
                ) : (
                  <div>N/A</div>
                )}
              </Descriptions.Item>
            </Descriptions>
          );
        case "address":
          const newAddress: IAddress = changes[key].newValue;
          const oldAddress: IAddress = changes[key].oldValue;

          return (
            <Descriptions
              title="Địa chỉ"
              layout="vertical"
              size="small"
              bordered
            >
              <Descriptions.Item label="Cũ">
                {oldAddress ? (
                  <>
                    <div>
                      <strong>{t("customers.fields.phoneNumber")}</strong>:{" "}
                      {oldAddress.phoneNumber}
                    </div>
                    <div>
                      <strong>{t("customers.fields.province.label")}</strong>:{" "}
                      {oldAddress.provinceName}
                    </div>
                    <div>
                      <strong>{t("customers.fields.district.label")}</strong>:{" "}
                      {oldAddress.districtName}
                    </div>
                    <div>
                      <strong>{t("customers.fields.ward.label")}</strong>:{" "}
                      {oldAddress.wardName}
                    </div>
                    <div>
                      <strong>{t("customers.fields.more")}</strong>:{" "}
                      {oldAddress.more}
                    </div>
                  </>
                ) : (
                  <div>N/A</div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Mới">
                {newAddress ? (
                  <>
                    <div>
                      <strong>{t("customers.fields.phoneNumber")}</strong>:{" "}
                      {newAddress.phoneNumber}
                    </div>
                    <div>
                      <strong>{t("customers.fields.province.label")}</strong>:{" "}
                      {newAddress.provinceName}
                    </div>
                    <div>
                      <strong>{t("customers.fields.district.label")}</strong>:{" "}
                      {newAddress.districtName}
                    </div>
                    <div>
                      <strong>{t("customers.fields.ward.label")}</strong>:{" "}
                      {newAddress.wardName}
                    </div>
                    <div>
                      <strong>{t("customers.fields.more")}</strong>:{" "}
                      {newAddress.more}
                    </div>
                  </>
                ) : (
                  <div>N/A</div>
                )}
              </Descriptions.Item>
            </Descriptions>
          );
        default:
          const newValue = changes[key].newValue;
          const oldValue = changes[key].oldValue;

          return (
            <Descriptions title={key} layout="vertical" size="small" bordered>
              <Descriptions.Item label="Cũ">
                {oldValue ? <div>{renderValue(oldValue)}</div> : <div>N/A</div>}
              </Descriptions.Item>
              <Descriptions.Item label="Mới">
                {newValue ? <div>{renderValue(newValue)}</div> : <div>N/A</div>}
              </Descriptions.Item>
            </Descriptions>
          );
      }
    } else {
      return <>Chưa tính đến</>;
    }
  };

  const renderValue = (value: any) => {
    if (typeof value === "number") {
      return (
        <NumberField
          options={{ currency: "VND", style: "currency" }}
          value={value}
          locale={"vi"}
        />
      );
    } else {
      return value ? <div>{value}</div> : <div>N/A</div>;
    }
  };

  return (
    <Modal
      title={
        <Space align="baseline">
          <Title level={5}>Chi tiết thay đổi</Title>
          {/* <Tooltip title="Lê Văn Ri.">
            <InfoCircleOutlined />
          </Tooltip> */}
        </Space>
      }
      {...restModalProps}
      open={restModalProps.open}
      width="700px"
      zIndex={2000}
      centered
      onOk={handleOk}
    >
      {changes && keys && (
        <Space direction="vertical" style={{ width: "100%" }}>
          {keys.map((key) => renderChange(key))}
        </Space>
      )}
    </Modal>
  );
};

export default ChangeDetail;
