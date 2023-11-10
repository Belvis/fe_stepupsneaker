import { Tag } from "antd";
import styled from "styled-components";
import { lightenDarkenColor, hexToRgba } from "../../../utils";

interface StyledCheckableTagProps {
  colorcode: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const StyledCheckableTag = styled(
  Tag.CheckableTag
)<StyledCheckableTagProps>`
  padding: 10px 20px;
  width: 120px;
  height: 40px;
  text-align: center;
  font-size: 16px;
  transition: all 0.3s;
  border: 1px solid
    ${(props) => (props.checked ? "transparent" : `#${props.colorcode}`)};

  background-color: ${(props) => {
    const opacity = props.checked ? 1.0 : 0.2;
    const modifiedColor = lightenDarkenColor("#" + props.colorcode, 20);
    return hexToRgba(modifiedColor, opacity);
  }};

  color: ${(props) => (props.checked ? "#000000" : `#000000`)};

  &:hover {
    background-color: ${(props) => {
      const opacity = props.checked ? 1.0 : 0.2;
      const modifiedColor = lightenDarkenColor("#" + props.colorcode, 20);
      return hexToRgba(modifiedColor, opacity);
    }};
    color: ${(props) => (props.checked ? "#000000" : `#${props.colorcode}`)};
  }
`;
