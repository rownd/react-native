import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"

const SvgComponent = (props: SvgProps) => (
  <Svg viewBox="0 0 320 159" {...props}>
    <Path
      d="M-2 160-1.025-.747c45.35 53.165 90.48 84.387 135.391 93.667C193.25 105.086 255.794 92.78 322 56v104H-2Z"
      fill={props.fill}
      fillRule="evenodd"
      opacity={0.1}
    />
  </Svg>
)

export default SvgComponent
