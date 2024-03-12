import { useTranslate } from "@refinedev/core";
import { Form, FormProps, Grid, Input, Modal, ModalProps } from "antd";
import { IMaterial } from "../../../../interfaces";
import { showWarningConfirmDialog } from "../../../../utils";
import { validateCommon } from "../../../../helpers/validate";

type CreateMaterialProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  onFinish: (values: any) => void;
};

export const CreateMaterial: React.FC<CreateMaterialProps> = ({
  modalProps,
  formProps,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const onFinishHandler = (values: IMaterial) => {
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
          label={
            <div>
              <span>{t("brands.fields.name")}</span>
              <span className="sub-label">(Tối đa 255 ký tự)</span>
            </div>
          }
          required
          name="name"
          rules={[
            {
              validator: (_, value) => validateCommon(_, value, t, "name"),
            },
          ]}
        >
          <Input maxLength={255} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};
