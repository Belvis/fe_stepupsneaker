import { useTranslate } from "@refinedev/core";
import { Modal, ModalProps, Form, FormProps, Input, Grid } from "antd";
import { IBrand } from "../../../../interfaces";
import { showWarningConfirmDialog } from "../../../../utils";

type CreateBrandProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  onFinish: (values: any) => void;
};

export const CreateBrand: React.FC<CreateBrandProps> = ({
  modalProps,
  formProps,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const onFinishHandler = (values: IBrand) => {
    const submitData = {
      name: values.name,
      status: "ACTIVE",
    };
    showWarningConfirmDialog({
      options: {
        accept: () => {
          onFinish(submitData);
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
          label={t("brands.fields.name")}
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
