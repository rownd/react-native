import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"

const SvgComponent = (props: SvgProps) => (
  <Svg viewBox="0 0 320 254" {...props}>
    <Path
      d="m323 256-324-1 .498-72.766C53.972 163.427 91.97 149.35 113.492 140c69.85-30.343 139.288-77.352 208.317-141.025C324.899-3.875 325.296 81.8 323 256Z"
      fill={props.fill}
      fillRule="evenodd"
      opacity={0.1}
    />
  </Svg>
)

export default SvgComponent
