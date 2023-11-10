import { HttpError, useOne, useTranslate } from "@refinedev/core";
import {
  ColorPicker,
  Form,
  FormProps,
  Grid,
  Input,
  Modal,
  ModalProps,
  Select,
} from "antd";
import type { Color } from "antd/es/color-picker";
import { PRODUCT_STATUS_OPTIONS } from "../../../constants";
import { IColor } from "../../../interfaces";
import { colorPickerStyles } from "./style";
import { showWarningConfirmDialog } from "../../../utils";

type EditColorProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  id: any;
  onFinish: (values: any) => void;
  close: () => void;
};

export const EditColor: React.FC<EditColorProps> = ({
  modalProps,
  formProps,
  id,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { data } = useOne<IColor, HttpError>({
    resource: "colors",
    id,
  });

  const handleChange = (newColor: Color) => {
    const hexColor = newColor.toHex();

    if (formProps && formProps.form) {
      formProps.form.setFieldValue("code", hexColor);
    }
  };

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
          label={t("colors.fields.code")}
          name="code"
          initialValue={data?.data.code}
          rules={[
            {
              required: true,
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
          label={t("colors.fields.name")}
          name="name"
          initialValue={data?.data.name}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("colors.fields.status")}
          name="status"
          initialValue={data?.data.status}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select options={PRODUCT_STATUS_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
