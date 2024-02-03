import { useTranslate } from "@refinedev/core";
import { Form, FormProps, Grid, Input, Modal, ModalProps } from "antd";
import { showWarningConfirmDialog } from "../../../utils";

type CreatePaymentMethodProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  onFinish: (values: any) => void;
};

export const CreatePaymentMethod: React.FC<CreatePaymentMethodProps> = ({
  modalProps,
  formProps,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const onFinishHandler = (values: any) => {
    showWarningConfirmDialog({
      options: {
        accept: () => {
          onFinish(values);
        },
        reject: () => {},
      },
      t: t,
    });
  };

  return (
    <Modal
      {...modalProps}
      width={breakpoint.sm ? "500px" : "100%"}
      zIndex={1001}
    >
      <Form {...formProps} layout="vertical" onFinish={onFinishHandler}>
        <Form.Item
          label={t("paymentMethods.fields.name")}
          name="name"
          rules={[
            {
              whitespace: true,
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
