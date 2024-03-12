import { useTranslate } from "@refinedev/core";
import {
  ColorPicker,
  Form,
  FormProps,
  Grid,
  Input,
  Modal,
  ModalProps,
} from "antd";
import type { Color } from "antd/es/color-picker";
import { IColor } from "../../../../interfaces";
import { showWarningConfirmDialog } from "../../../../utils";
import { colorPickerStyles } from "./style";
import { validateCommon } from "../../../../helpers/validate";

type CreateColorProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  onFinish: (values: any) => void;
};

export const CreateColor: React.FC<CreateColorProps> = ({
  modalProps,
  formProps,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const handleChange = (newColor: Color) => {
    const hexColor = newColor.toHex();

    if (formProps && formProps.form) {
      formProps.form.setFieldValue("code", hexColor);
    }
  };

  const onFinishHandler = (values: IColor) => {
    const submitData = {
      code: values.code,
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
          label={t("colors.fields.code")}
          name="code"
          required
          rules={[
            {
              validator: (_, value) => validateCommon(_, value, t, "code"),
            },
          ]}
        >
          <ColorPicker
            onChange={handleChange}
            showText
            style={colorPickerStyles}
          />
        </Form.Item>
        <Form.Item
          label={
            <div>
              <span>{t("colors.fields.name")}</span>
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
