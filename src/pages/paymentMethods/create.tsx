import { useTranslate } from "@refinedev/core";
import { Modal, ModalProps, Form, FormProps, Input, Select, Grid } from "antd";

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
    onFinish(values);
  };

  return (
    <Modal
      {...modalProps}
      width={breakpoint.sm ? "500px" : "100%"}
      zIndex={1001}
    >
      <Form
        {...formProps}
        layout="vertical"
        onFinish={onFinishHandler}
        initialValues={{
          isActive: true,
        }}
      >
        <Form.Item
          label={t("paymentMethods.fields.name")}
          name="name"
          rules={[
            {
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
