import { useTranslate } from "@refinedev/core";
import {
  Button,
  Col,
  Empty,
  Grid,
  Modal,
  ModalProps,
  Row,
  Space,
  Typography,
} from "antd";
import { IProductDetail } from "../../../../pages/interfaces";
import ShoppingCartHeader from "../cartHeader";
import { ProductDetailItem } from "./productItem";
import { useEffect, useState } from "react";

const { Text } = Typography;

type SelectedItemsModalProps = {
  modalProps: ModalProps;
  close: () => void;
  callBack: any;
  items: IProductDetail[];
  submit: () => Promise<void>;
  showAddAndGoButton: boolean;
};

export const SelectedItemsModal: React.FC<SelectedItemsModalProps> = ({
  modalProps,
  close,
  callBack,
  items,
  showAddAndGoButton,
  submit,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();
  const [copiedItems, setCopiedItems] = useState<IProductDetail[]>(items);

  useEffect(() => {
    if (items) setCopiedItems([...items]);
  }, [modalProps.open]);

  const handleOk = async () => {
    callBack(copiedItems);
    close();
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCopiedItems((prev) =>
      prev.map((detail) =>
        detail.id === productId ? { ...detail, quantity: newQuantity } : detail
      )
    );
  };

  const removeProductDetails = (productId: string) => {
    setCopiedItems((prev) => {
      return prev
        .map((detail) =>
          detail.id === productId
            ? { ...detail, quantity: detail.quantity - 1 }
            : detail
        )
        .filter((detail) => detail.quantity > 0);
    });
  };

  const addAndGo = async () => {
    await handleOk();
    submit();
  };
  return (
    <Modal
      title="Thêm sản phẩm"
      {...modalProps}
      width={breakpoint.sm ? "800px" : "100%"}
      zIndex={1002}
      onOk={handleOk}
      okText={t("buttons.addAndContinue")}
      footer={(_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <Button type="primary" onClick={addAndGo}>
            {showAddAndGoButton ? t("buttons.go") : t("buttons.addAndGo")}
          </Button>
          <OkBtn />
        </>
      )}
    >
      <Row>
        <Col span={24}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <ShoppingCartHeader />
            {copiedItems.length > 0 ? (
              <>
                {copiedItems.map((item, index) => (
                  <ProductDetailItem
                    key={item.id}
                    productDetail={item}
                    callBack={updateQuantity}
                    onRemove={() => removeProductDetails(item.id)}
                    count={index}
                  />
                ))}
              </>
            ) : (
              <Empty />
            )}
          </Space>
        </Col>
      </Row>
    </Modal>
  );
};
